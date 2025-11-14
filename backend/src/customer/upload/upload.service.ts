import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../utils/prisma.service';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class UploadService {
	constructor(private readonly prisma: PrismaService) {}

	private readonly uploadDir = path.join(process.cwd(), 'uploads');

	private async ensureUploadDir() {
		try {
			await fs.access(this.uploadDir);
		} catch {
			await fs.mkdir(this.uploadDir, { recursive: true });
		}
	}

	private getFileExtension(mimetype: string): string {
		const mimeToExt: Record<string, string> = {
			'application/pdf': 'pdf',
			'application/msword': 'doc',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
			'application/vnd.ms-excel': 'xls',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
		};
		return mimeToExt[mimetype] || 'bin';
	}

	async createUpload(file: Express.Multer.File, customerId: string) {
		try {
			// Ensure upload directory exists
			await this.ensureUploadDir();

			// Generate unique filename
			const fileExtension = this.getFileExtension(file.mimetype);
			const timestamp = Date.now();
			const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
			const uniqueFilename = `${customerId}_${timestamp}_${sanitizedOriginalName}`;
			const filePath = path.join(this.uploadDir, uniqueFilename);

			// Save file to disk
			await fs.writeFile(filePath, file.buffer);

			// Create database record
			const upload = await this.prisma.upload.create({
				data: {
					filename: file.originalname,
					fileData: uniqueFilename, // Store the saved filename
					format: fileExtension,
					customerId: customerId,
					status: 'pending',
				},
			});

			return {
				success: true,
				message: 'File uploaded successfully',
				data: {
					id: upload.id,
					filename: upload.filename,
					format: upload.format,
					status: upload.status,
					createdAt: upload.createdAt,
				},
			};
		} catch (error) {
			if (error.code !== 'ENOENT') {
				try {
					const fileExtension = this.getFileExtension(file.mimetype);
					const timestamp = Date.now();
					const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
					const uniqueFilename = `${customerId}_${timestamp}_${sanitizedOriginalName}`;
					const filePath = path.join(this.uploadDir, uniqueFilename);
					await fs.unlink(filePath).catch(() => {});
				} catch {}
			}
			throw new BadRequestException('Failed to upload file: ' + error.message);
		}
	}

	async getUserUploads(customerId: string) {
		return this.prisma.upload.findMany({
			where: { customerId },
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				filename: true,
				format: true,
				status: true,
				createdAt: true,
				updatedAt: true,
				needed_amount: true,
				cancel_reason: true,
				rejection_reason: true,
			},
		});
	}

	async getUploadById(uploadId: string, customerId: string) {
		const upload = await this.prisma.upload.findFirst({
			where: { 
				id: uploadId,
				customerId 
			},
		});

		if (!upload) {
			throw new NotFoundException('Upload not found');
		}

		return upload;
	}
}

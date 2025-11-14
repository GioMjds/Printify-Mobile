import { 
	Controller, 
	Post, 
	Get,
	Param,
	UseInterceptors, 
	UploadedFile, 
	BadRequestException,
	UseGuards,
	Req,
	ParseUUIDPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { CustomerGuard } from '../customer.guard';
import type { Request } from 'express';

@Controller('upload')
@UseGuards(CustomerGuard)
export class UploadController {
	constructor(private readonly uploadService: UploadService) {}

	@Post('upload-file')
	@UseInterceptors(FileInterceptor('file', {
		limits: {
			fileSize: 10 * 1024 * 1024, // 10MB limit
		},
		fileFilter: (req, file, callback) => {
			const allowedMimeTypes = [
				'application/pdf',
				'application/msword', // .doc
				'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
				'application/vnd.ms-excel', // .xls
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
			];

			if (allowedMimeTypes.includes(file.mimetype)) {
				callback(null, true);
			} else {
				callback(
					new BadRequestException(
						'Invalid file type. Only PDF, DOC, DOCX, XLS, and XLSX files are allowed.'
					),
					false
				);
			}
		},
	}))
	async uploadFile(
		@UploadedFile() file: Express.Multer.File,
		@Req() req: Request
	) {
		if (!file) {
			throw new BadRequestException('No file uploaded');
		}

		const customerId = req['customer']?.id;
		if (!customerId) {
			throw new BadRequestException('Customer ID not found');
		}

		return this.uploadService.createUpload(file, customerId);
	}

	@Get('my-uploads')
	async getMyUploads(@Req() req: Request) {
		const customerId = req['customer']?.id;
		if (!customerId) {
			throw new BadRequestException('Customer ID not found');
		}
		return this.uploadService.getUserUploads(customerId);
	}

	@Get(':uploadId')
	async getUploadById(
		@Param('uploadId', ParseUUIDPipe) uploadId: string,
		@Req() req: Request
	) {
		const customerId = req['customer']?.id;
		if (!customerId) {
			throw new BadRequestException('Customer ID not found');
		}
		return this.uploadService.getUploadById(uploadId, customerId);
	}
}

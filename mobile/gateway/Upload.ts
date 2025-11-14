import { httpClient } from '../configs/axios';
import { UploadResponse, UserUpload } from '@/types/Upload.types';

const http = httpClient.endpoint('/upload');

export const upload =  {
    async uploadFile(
        fileUri: string,
        fileName: string,
        mimeType: string
    ): Promise<UploadResponse> {
        const formData = new FormData();

        const file = {
            uri: fileUri,
            name: fileName,
            type: mimeType,
        } as any;
        
        formData.append('file', file);

        return await http.post<UploadResponse>('/upload-file', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    async getUserUploads(): Promise<UserUpload[]> {
        return await http.get<UserUpload[]>('/my-uploads');
    },

    async getUploadById(uploadId: string): Promise<UserUpload> {
        return await http.get<UserUpload>(`/${uploadId}`);
    }
}

export interface UploadResponse {
    success: boolean;
    message: string;
    data: {
        id: string;
        filename: string;
        format: string;
        status: string;
        createdAt: Date;
    };
}

export interface UserUpload {
    id: string;
    filename: string;
    format: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    needed_amount?: number | null;
    cancel_reason?: string | null;
    rejection_reason?: string | null;
}
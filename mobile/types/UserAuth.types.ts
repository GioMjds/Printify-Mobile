export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface ResetPasswordRequest {
    email: string;
    otp: string;
    newPassword: string;
    confirmNewPassword: string;
}

export interface VerifyOtpRequest {
    email: string;
    otp: string;
}
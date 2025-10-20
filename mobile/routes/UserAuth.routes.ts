import { httpClient } from "@/configs/axios";
import { LoginRequest, RegisterRequest } from "@/types/UserAuth.types";

class UserAuth {
    async logout() {
        return await httpClient.post('/auth/logout');
    }

    async login({ email, password }: LoginRequest) {
        return await httpClient.post('/auth/login', {
            email: email,
            password: password,
        });
    }

    async sendRegisterOtp({ firstName, lastName, email, password, confirmPassword }: RegisterRequest) {
        return await httpClient.post('/auth/register', {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            confirmPassword: confirmPassword
        });
    }

    async verifyRegisterOtp(email: string, otp: string) {
        return await httpClient.post('/auth/verify_otp', {
            email: email,
            otp: otp,
        });
    }

    async resendRegisterOtp(email: string) {
        return await httpClient.post('/auth/resend_otp', {
            email: email,
        });
    }

    async forgotPassword(email: string) {
        return await httpClient.post('/auth/forgot_password', {
            email: email,
        });
    }

    async resetPassword(email: string, otp: string, newPassword: string, confirmNewPassword: string) {
        return await httpClient.post('/auth/reset_password', {
            email: email,
            otp: otp,
            newPassword: newPassword,
            confirmNewPassword: confirmNewPassword,
        });
    }
}

export const auth = new UserAuth();
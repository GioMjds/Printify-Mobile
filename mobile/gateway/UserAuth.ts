import { httpClient } from "@/configs/axios";
import { LoginRequest, RegisterRequest } from "@/types/UserAuth.types";

const http = httpClient.endpoint('/auth');

export const auth = {
    async logout() {
        return await http.post('/logout');
    },

    async login({ email, password }: LoginRequest) {
        return await http.post('/login', {
            email: email,
            password: password,
        });
    },

    async sendRegisterOtp({ firstName, lastName, email, password, confirmPassword }: RegisterRequest) {
        return await http.post('/register', {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            confirmPassword: confirmPassword
        });
    },

    async verifyRegisterOtp(email: string, otp: string) {
        return await http.post('/verify_otp', {
            email: email,
            otp: otp,
        });
    },

    async resendRegisterOtp(email: string) {
        return await http.post('/resend_otp', {
            email: email,
        });
    },

    async forgotPassword(email: string) {
        return await http.post('/forgot_password', {
            email: email,
        });
    },

    async resetPassword(email: string, otp: string, newPassword: string, confirmNewPassword: string) {
        return await http.post('/reset_password', {
            email: email,
            otp: otp,
            newPassword: newPassword,
            confirmNewPassword: confirmNewPassword,
        });
    }
}
import { IsEmail, IsString, MinLength } from 'class-validator';

export class ForgotPassword {
    @IsEmail()
    email!: string;
}

export class ResetPassword {
    @IsEmail()
    email!: string;

    @IsString()
    otp!: string;

    @IsString()
    @MinLength(6)
    newPassword!: string;

    @IsString()
    @MinLength(6)
    confirmNewPassword!: string;
}

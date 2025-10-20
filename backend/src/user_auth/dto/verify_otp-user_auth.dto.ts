import { IsEmail, IsString, Length } from "class-validator";

export class VerifyOtp {
    @IsEmail()
    email: string;

    @IsString()
    @Length(6, 6)
    otp: string;
}
import { IsEmail, IsString, IsOptional, MinLength } from "class-validator";

export class RegisterUser {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @MinLength(6)
    confirmPassword: string;

    @IsString()
    @MinLength(2)
    firstName: string;

    @IsString()
    @MinLength(2)
    lastName: string;

    @IsOptional()
    @IsString()
    name?: string;
}
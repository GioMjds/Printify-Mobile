import { IsEmail, IsOptional, IsString, IsEnum } from "class-validator";
import { UserRole } from "@prisma/client";

export class CreateCustomerDto {
    @IsOptional()
    @IsString()
    id: string;

    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsString()
    name: string;

    @IsString()
    profile_image?: string;
    
    @IsEnum(UserRole)
    role: UserRole;
}

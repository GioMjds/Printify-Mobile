import { Expose } from 'class-transformer';
import { UserRole } from '@prisma/client';

export class CustomerEntity {
    @Expose()
    id!: string;

    @Expose()
    email!: string;

    password: string;

    @Expose()
    profile_image: string | null;

    @Expose()
    name: string;

    @Expose()
    role!: UserRole;

    @Expose()
    isVerified!: boolean;

    @Expose()
    createdAt!: Date;

    @Expose()
    updatedAt!: Date;
}

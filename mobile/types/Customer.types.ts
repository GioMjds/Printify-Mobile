export interface Customer {
    id: string;
    email: string;
    name: string;
    profile_image?: string;
    role: 'customer' | 'admin';
    isVerified: boolean;
}
export interface Customer {
    id: string;
    email: string;
    name: string;
    profile_image?: string;
    role: 'customer' | 'admin';
    isVerified: boolean;
}

export interface CustomerResponse {
    message: string;
    access_token: string;
    refresh_token: string;
    customer: Customer;
}
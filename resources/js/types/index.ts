export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export interface Auth {
    user: User | null;
}

export interface PageProps {
    auth: Auth;
    [key: string]: unknown;
}

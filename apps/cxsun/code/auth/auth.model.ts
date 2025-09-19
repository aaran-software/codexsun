// Defines types for authentication requests and responses

export interface AuthRequest {
    username: string;
    password: string;
}

export interface AuthResponse {
    message: string;
}

import React from "react";

export interface User {
    id: string;
    username: string;
    email: string;
    tenantId: string;
    role: string;
    token: string;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextType | null>(null);
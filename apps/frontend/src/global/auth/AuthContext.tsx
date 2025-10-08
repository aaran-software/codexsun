import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface User {
    id: string;
    username: string;
    email: string;
    tenantId: string;
    role: string;
    token: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const API_URL = "http://localhost:3006"; // Matches backend port

    useEffect(() => {
        const savedUser = localStorage.getItem("auth_user");
        const savedToken = localStorage.getItem("auth_token");
        if (savedUser && savedToken) {
            try {
                setUser(JSON.parse(savedUser));
                setToken(savedToken);
            } catch {
                localStorage.removeItem("auth_user");
                localStorage.removeItem("auth_token");
            }
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Invalid credentials');
            }

            const data = await res.json();
            const mappedUser: User = {
                id: data.user.id,
                username: data.user.username || "Unknown",
                email: data.user.email,
                tenantId: data.user.tenantId,
                role: data.user.role,
                token: data.user.token,
            };

            setUser(mappedUser);
            setToken(data.user.token);
            localStorage.setItem("auth_user", JSON.stringify(mappedUser));
            localStorage.setItem("auth_token", data.user.token);
            setLoading(false);
            return true;
        } catch (error) {
            setLoading(false);
            console.error('Login error:', error instanceof Error ? error.message : 'Unknown error', { email, status: res?.status, response: res?.statusText, body: await res?.text().catch(() => '') });
            return false;
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            console.log('[AuthContext] Starting logout...');
            if (token) {
                await fetch(`${API_URL}/api/logout`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });
            }
            console.log('[AuthContext] Backend logout request completed.');
        } catch (error) {
            console.error('[AuthContext] Logout backend error (non-fatal):', error);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem("auth_user");
            localStorage.removeItem("auth_token");
            setLoading(false);
            console.log('[AuthContext] Frontend state cleared.');
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};
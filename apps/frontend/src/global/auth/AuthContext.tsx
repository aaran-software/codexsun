import React, { useState, ReactNode, useEffect } from "react";
import { AuthContext, User } from "./AuthContextTypes";

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
            console.error('Login error:', error instanceof Error ? error.message : 'Unknown error', { email });
            return false;
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            console.log('[AuthContext] Starting logout...');
            if (token) {
                const res = await fetch(`${API_URL}/api/logout`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.error || 'Logout failed');
                }
                console.log('[AuthContext] Backend logout request completed.');
            }
            setUser(null);
            setToken(null);
            localStorage.removeItem("auth_user");
            localStorage.removeItem("auth_token");
            console.log('[AuthContext] Frontend state cleared.');
        } catch (error) {
            console.error('[AuthContext] Logout error:', error instanceof Error ? error.message : 'Unknown error');
            setUser(null);
            setToken(null);
            localStorage.removeItem("auth_user");
            localStorage.removeItem("auth_token");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
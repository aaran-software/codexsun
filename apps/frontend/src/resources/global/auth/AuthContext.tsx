// Updated AuthContext.tsx to connect with the backend API as per the test specifications
// Changes:
// - Use correct API base URL[](http://localhost:3000) and endpoints (/api/auth/login, /api/auth/logout, /api/users/email/:email)
// - Include X-Tenant-Id header with 'tenant1' (as per test)
// - Store and manage JWT token
// - Fetch user profile after login using the token
// - Map backend user fields to frontend User interface (username -> name, assume status 'active')
// - Handle logout with backend call
// - Persist token and user in localStorage
// - Remove unnecessary credentials: 'include' since using JWT Bearer
// - Error handling aligned with test expectations

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface User {
    id: number;
    name: string;
    email: string;
    status: string;
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

    const API_URL = "http://localhost:3000";
    const TENANT_ID = "tenant1";

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
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Tenant-Id": TENANT_ID,
                },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                const data = await res.json();
                const newToken = data.token;

                // Fetch user profile with token
                const profileRes = await fetch(`${API_URL}/api/users/email/${email}`, {
                    headers: {
                        "Authorization": `Bearer ${newToken}`,
                        "X-Tenant-Id": TENANT_ID,
                    },
                });

                if (profileRes.ok) {
                    const userData = await profileRes.json();
                    const mappedUser: User = {
                        id: userData.id,
                        name: userData.username,
                        email: userData.email,
                        status: "active", // Assume active as per test; adjust if needed
                    };

                    setUser(mappedUser);
                    setToken(newToken);
                    localStorage.setItem("auth_user", JSON.stringify(mappedUser));
                    localStorage.setItem("auth_token", newToken);
                    setLoading(false);
                    return true;
                } else {
                    throw new Error('Failed to fetch user profile');
                }
            } else {
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            setLoading(false);
            console.error('Login error:', error);
            return false;
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            console.log('[AuthContext] Starting logout...');
            if (token) {
                await fetch(`${API_URL}/api/auth/logout`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "X-Tenant-Id": TENANT_ID,
                    },
                });
            }
            console.log('[AuthContext] Backend logout request completed.');
        } catch (error) {
            console.error('[AuthContext] Logout backend error (non-fatal):', error);
            // Continue with frontend cleanup even if backend fails
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
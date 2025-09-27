import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface User {
    id: number;
    name: string;
    email: string;
    status: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem("auth_user");
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem("auth_user");
            }
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setLoading(true);
            const res = await fetch("http://localhost:3006/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: email, password }),
            });

            if (res.ok) {
                const profileRes = await fetch(`http://localhost:3006/users?email=${email}`);
                let userData: User = { id: 0, name: email, email, status: "active" };

                if (profileRes.ok) {
                    const users = await profileRes.json();
                    if (Array.isArray(users) && users.length > 0) {
                        userData = users[0];
                    }
                }

                setUser(userData);
                localStorage.setItem("auth_user", JSON.stringify(userData));
                setLoading(false);
                return true;
            } else {
                setLoading(false);
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
            await fetch("http://localhost:3006/logout", {
                method: "POST",
                credentials: 'include' // Include cookies if backend uses session-based logout
            });
            console.log('[AuthContext] Backend logout request completed.');
        } catch (error) {
            console.error('[AuthContext] Logout backend error (non-fatal):', error);
            // Continue with frontend cleanup even if backend fails
        } finally {
            setUser(null);
            localStorage.removeItem("auth_user");
            setLoading(false);
            console.log('[AuthContext] Frontend state cleared.');
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};
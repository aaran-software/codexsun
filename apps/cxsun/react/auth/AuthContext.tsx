// AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface User {
    id: number;
    name: string;
    email: string;
    status: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean; // Add loading state
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // Initialize as true

    // Restore session from localStorage
    useEffect(() => {
        const savedUser = localStorage.getItem("auth_user");
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem("auth_user");
            }
        }
        setLoading(false); // Set loading to false after checking localStorage
    }, []);

    const login = async (email: string, password: string) => {
        const res = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: email, password }),
        });

        if (res.ok) {
            const profileRes = await fetch(`http://localhost:3000/users?email=${email}`);
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
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("auth_user");
        fetch("http://localhost:3000/logout", { method: "POST" });
        setLoading(false);
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
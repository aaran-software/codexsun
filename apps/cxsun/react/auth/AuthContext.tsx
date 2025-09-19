import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface User {
    id: number;
    name: string;
    email: string;
    status: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    // ✅ Restore session from localStorage
    useEffect(() => {
        const savedUser = localStorage.getItem("auth_user");
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem("auth_user");
            }
        }
    }, []);

    const login = async (email: string, password: string) => {
        const res = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: email, password }),
        });

        if (res.ok) {
            // 📝 At this stage backend only returns { message: "Login successful" }
            // But we already know email & can fetch full user info.
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
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("auth_user");
        fetch("http://localhost:3000/logout", { method: "POST" });
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};

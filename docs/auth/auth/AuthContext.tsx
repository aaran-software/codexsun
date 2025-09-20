import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from "react";

interface User {
    id: number;
    name: string;
    email: string;
    status: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    authFetch: typeof fetch; // wrapper around fetch with token
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    // ✅ Restore session
    useEffect(() => {
        const savedUser = localStorage.getItem("auth_user");
        const savedToken = localStorage.getItem("auth_token");
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem("auth_user");
            }
        }
        if (savedToken) setToken(savedToken);
    }, []);

    const login = async (email: string, password: string) => {
        const res = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (res.ok) {
            const { token: jwtToken, user: userData } = await res.json();

            setToken(jwtToken);
            setUser(userData);

            localStorage.setItem("auth_token", jwtToken);
            localStorage.setItem("auth_user", JSON.stringify(userData));

            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_token");
        fetch("http://localhost:3000/logout", { method: "POST" });
    };

    // ✅ Middleware for fetch with Authorization header
    const authFetch: typeof fetch = (input, init = {}) => {
        const headers = new Headers(init.headers || {});
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        return fetch(input, { ...init, headers });
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, authFetch }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};

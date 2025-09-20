// index.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function DashboardPage() {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate("/login", { replace: true });
        }
    }, [user, loading, navigate]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            {user ? (
                <>
                    <h1 className="text-3xl font-bold mb-4">
                        Welcome, {user.name} ({user.email})
                    </h1>
                    <p className="mb-6 text-gray-600">Status: {user.status}</p>
                </>
            ) : (
                <p>Loading...</p>
            )}

            <div className="space-x-4">
                <button
                    onClick={() => navigate("/users")}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Manage Users
                </button>
                <button
                    onClick={logout}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
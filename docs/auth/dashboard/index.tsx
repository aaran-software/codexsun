import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function DashboardPage() {
    const { user, logout, authFetch } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate("/login", { replace: true });
        } else {
            // ✅ Example: protected API call using authFetch
            authFetch("http://localhost:3000/users")
                .then((res) => res.json())
                .then((data) => setUsers(data))
                .catch((err) => console.error("Error fetching users:", err))
                .finally(() => setLoading(false));
        }
    }, [user, navigate, authFetch]);

    if (!user) {
        return <p className="min-h-screen flex items-center justify-center">Redirecting...</p>;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
            <h1 className="text-3xl font-bold mb-4">
                Welcome, {user.name} ({user.email})
            </h1>
            <p className="mb-6 text-gray-600">Status: {user.status}</p>

            <div className="space-x-4 mb-8">
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

            {/* ✅ Protected data preview */}
            <div className="w-full max-w-2xl bg-white shadow rounded p-4">
                <h2 className="text-xl font-semibold mb-4">Users (protected API)</h2>
                {loading ? (
                    <p>Loading users...</p>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {users.map((u) => (
                            <li key={u.id} className="py-2">
                                {u.name} — <span className="text-gray-500">{u.email}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

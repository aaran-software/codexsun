// apps/cxsun/react/users/user.tsx

import React, { useEffect, useState } from "react";

interface User {
    id: number;
    name: string;
    email: string;
    status: string;
}

export default function UserPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Edit state
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Fetch users
    const fetchUsers = async () => {
        try {
            const res = await fetch("http://localhost:3000/users");
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Add new user
    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:3000/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });
            if (!res.ok) throw new Error("Failed to add user");
            await fetchUsers();
            setName("");
            setEmail("");
            setPassword("");
        } catch (err) {
            console.error("Error adding user", err);
        }
    };

    // Delete user
    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await fetch(`http://localhost:3000/users/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete user");
            await fetchUsers();
        } catch (err) {
            console.error("Error deleting user", err);
        }
    };

    // Start editing
    const startEdit = (user: User) => {
        setEditingUser(user);
        setName(user.name);
        setEmail(user.email);
        setPassword(""); // clear password on edit
    };

    // Save edit
    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        try {
            const res = await fetch(`http://localhost:3000/users/${editingUser.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });
            if (!res.ok) throw new Error("Failed to update user");
            await fetchUsers();
            setEditingUser(null);
            setName("");
            setEmail("");
            setPassword("");
        } catch (err) {
            console.error("Error updating user", err);
        }
    };

    if (loading) {
        return <p className="text-white">Loading users...</p>;
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">👤 User Management</h2>

            {/* ✅ Add / Edit Form */}
            <form
                onSubmit={editingUser ? handleUpdateUser : handleAddUser}
                className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3 text-left"
            >
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                    required
                />
                <input
                    type="password"
                    placeholder={editingUser ? "New Password (optional)" : "Password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                    required={!editingUser}
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                >
                    {editingUser ? "Update User" : "Add User"}
                </button>
            </form>

            {/* ✅ User Table */}
            {users.length === 0 ? (
                <p className="text-gray-600">No users found.</p>
            ) : (
                <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-100 text-gray-700">
                    <tr>
                        <th className="py-2 px-4 text-left">ID</th>
                        <th className="py-2 px-4 text-left">Name</th>
                        <th className="py-2 px-4 text-left">Email</th>
                        <th className="py-2 px-4 text-left">Status</th>
                        <th className="py-2 px-4 text-center">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((u) => (
                        <tr key={u.id} className="border-t">
                            <td className="py-2 px-4">{u.id}</td>
                            <td className="py-2 px-4">{u.name}</td>
                            <td className="py-2 px-4">{u.email}</td>
                            <td className="py-2 px-4">
                  <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.status === "active"
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                      }`}
                  >
                    {u.status}
                  </span>
                            </td>
                            <td className="py-2 px-4 text-center space-x-2">
                                <button
                                    onClick={() => startEdit(u)}
                                    className="px-3 py-1 text-sm bg-yellow-400 hover:bg-yellow-500 text-white rounded"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(u.id)}
                                    className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

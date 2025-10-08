import React from 'react';
import { useAuth } from '../../../global/auth/AuthContext';
import { Navigate } from 'react-router-dom';

interface User {
    id: string;
    username: string;
    email: string;
    tenantId: string;
    role: string;
    token: string;
}

const Credit: React.FC = () => {
    const { user, token, loading } = useAuth();
    const tenantId = 'default'; // Matches backend tenant ID

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-600">Loading...</p>
            </div>
        );
    }

    if (!user || !token) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">User Credentials</h1>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">User ID</label>
                        <p className="w-full p-2 border rounded bg-gray-50">{user.id}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <p className="w-full p-2 border rounded bg-gray-50">{user.username}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="w-full p-2 border rounded bg-gray-50">{user.email}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <p className="w-full p-2 border rounded bg-gray-50">{user.role}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tenant ID</label>
                        <p className="w-full p-2 border rounded bg-gray-50">{tenantId}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">JWT Token</label>
                        <p className="w-full p-2 border rounded bg-gray-50 break-all">{token}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bearer Token</label>
                        <p className="w-full p-2 border rounded bg-gray-50 break-all">Bearer {token}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Credit;
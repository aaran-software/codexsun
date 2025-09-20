import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to the App</h1>
                <p className="text-gray-600 mb-6">Please log in to access your dashboard and manage users.</p>
                <button
                    onClick={() => navigate("/login")}
                    className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 font-semibold"
                >
                    Login
                </button>
            </div>
        </div>
    );
}
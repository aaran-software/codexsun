// src/App.tsx

import React, { useState } from "react";
import UserPage from "./user";

export default function App() {
    const [page, setPage] = useState<"home" | "users">("home");

    return (
        <div className="h-screen flex flex-col bg-gradient-to-r from-blue-500 to-purple-600">
            {/* ✅ Navigation Menu */}
            <nav className="bg-white shadow p-4 flex space-x-6">
                <button
                    onClick={() => setPage("home")}
                    className={`font-semibold ${
                        page === "home" ? "text-blue-600" : "text-gray-600"
                    }`}
                >
                    Home
                </button>
                <button
                    onClick={() => setPage("users")}
                    className={`font-semibold ${
                        page === "users" ? "text-blue-600" : "text-gray-600"
                    }`}
                >
                    Users
                </button>
            </nav>

            {/* ✅ Page Content */}
            <div className="flex-grow flex items-center justify-center">
                {page === "home" && (
                    <div className="p-8 rounded-2xl shadow-xl bg-white text-center max-w-sm">
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">
                            🚀 CodexSun React Demo
                        </h1>
                        <p className="text-gray-600 mb-6">
                            This is a minimal React + Tailwind setup.
                        </p>
                        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow">
                            Get Started
                        </button>
                    </div>
                )}

                {page === "users" && <UserPage />}
            </div>
        </div>
    );
}

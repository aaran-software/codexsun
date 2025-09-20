// apps/cxsun/react/web/contact.tsx

import React from "react";
import { useNavigate } from "react-router-dom";

export default function ContactPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
                <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">Contact Us</h1>
                <p className="text-gray-600 mb-6 text-center">
                    Get in touch with us for any questions or support.
                </p>
                <div className="grid grid-cols-1 gap-4 mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-700">Email</h2>
                        <p className="text-gray-600">support@example.com</p>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-700">Phone</h2>
                        <p className="text-gray-600">+1 (123) 456-7890</p>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-700">Address</h2>
                        <p className="text-gray-600">123 App Street, Tech City, TC 12345</p>
                    </div>
                </div>
                <div className="text-center">
                    <button
                        onClick={() => navigate("/")}
                        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 font-semibold"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}
import React from "react";
import { useNavigate } from "react-router-dom";

export default function AboutPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">About Us</h1>
                <p className="text-gray-600 mb-6">
                    Welcome to MyApp! We provide a robust platform for user management and authentication, ensuring a seamless and secure experience.
                </p>
                <p className="text-gray-600 mb-6">
                    Built with React and Tailwind CSS, our app delivers a responsive and user-friendly interface for all your needs.
                </p>
                <button
                    onClick={() => navigate("/")}
                    className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 font-semibold"
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
}
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../global/auth/AuthContext";
import {useState} from "react";

export default function WebMenu() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const menuItems = [
        { label: "Home", path: "/" },
        { label: "About", path: "/about" },
        { label: "Contact", path: "/contact" },
        ...(user
            ? [
                { label: "Dashboard", path: "/dashboard" },
                { label: "Users", path: "/users" },
            ]
            : []),
        { label: user ? "Logout" : "Login", path: user ? null : "/login", action: user ? logout : null },
    ];

    return (
        <nav className="bg-gray-800 text-white p-4 fixed top-0 w-full z-10">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold">My App</h1>
                <button
                    className="sm:hidden text-white focus:outline-none"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
                        />
                    </svg>
                </button>
                <div className={`sm:flex ${isMenuOpen ? "block" : "hidden"} sm:space-x-4`}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-2 p-4 sm:p-0 bg-gray-800 sm:bg-transparent absolute sm:static top-16 left-0 w-full sm:w-auto">
                        {menuItems.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => {
                                    if (item.action) {
                                        item.action();
                                    } else if (item.path) {
                                        navigate(item.path);
                                    }
                                    setIsMenuOpen(false);
                                }}
                                className="text-white hover:bg-gray-700 px-4 py-2 rounded transition w-full text-left sm:w-auto"
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
}
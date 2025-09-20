// apps/cxsun/react/App.tsx

import React, { JSX } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../../../resources/global/auth/AuthContext";
import LoginPage from "../../../resources/global/auth/login";
import DashboardPage from "./dashboard/index";
import UserPage from "./user/user";
import HomePage from "./web/home";
import AboutPage from "./web/about"; // Import AboutPage
import ContactPage from "./web/contact"; // Import ContactPage
import WebMenu from "../../../resources/component/menu/web/web-menu"; // Import WebMenu

function ProtectedRoute({ children }: { children: JSX.Element }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="flex flex-col min-h-screen">
                    <WebMenu /> {/* Add WebMenu globally */}
                    <div className="flex-grow pt-16"> {/* Add padding to account for fixed menu */}
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/about" element={<AboutPage />} /> {/* New About route */}
                            <Route path="/contact" element={<ContactPage />} /> {/* New Contact route */}
                            <Route path="/login" element={<LoginPage />} />
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <DashboardPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/users"
                                element={
                                    <ProtectedRoute>
                                        <UserPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </div>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}
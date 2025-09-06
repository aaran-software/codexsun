import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import TenantList from "./tenant/view/Tenant.list";

export default function App() {
    return (
        <div style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", margin: "2rem auto", maxWidth: 960, padding: "0 1rem" }}>
            <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
                <h1 style={{ margin: 0, fontSize: 24 }}>Tenants</h1>
                <nav style={{ display: "flex", gap: 12 }}>
                    <Link to="/tenants">Tenant List</Link>
                </nav>
            </header>

            <Routes>
                <Route path="/" element={<Navigate to="/tenants" replace />} />
                <Route path="/tenants" element={<TenantList />} />
                <Route path="*" element={<h2>404 • Not Found</h2>} />
            </Routes>

            <footer style={{ marginTop: 32, color: "#666", fontSize: 12 }}>
                Demo UI — replace with your design system later.
            </footer>
        </div>
    );
}
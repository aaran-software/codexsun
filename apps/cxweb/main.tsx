import React from "react";
import ReactDOM from "react-dom/client";
import "./resources/assets/css/style.css";
import { AuthProvider } from "./resources/global/auth/AuthContext";
import AppWrapper from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <AuthProvider>
            <AppWrapper />
        </AuthProvider>
    </React.StrictMode>
);
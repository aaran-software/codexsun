import React from "react";
import ReactDOM from "react-dom/client";
import "@/assets/css/app.css";
import {AuthProvider} from "./global/auth/AuthContext";
import AppWrapper from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <AuthProvider>
            <AppWrapper/>
        </AuthProvider>
    </React.StrictMode>
);
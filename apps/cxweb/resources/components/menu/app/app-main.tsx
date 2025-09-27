// New file: src/components/menu/sidebar/app-main.tsx
// This wraps the header and the main content (Outlet)

import * as React from "react"
import { Outlet } from "react-router-dom"

import { AppHeader } from "../sidebar/app-header"

export function AppMain() {
    return (
        <>
            <AppHeader />
            <div className="flex flex-1 flex-col p-4 pt-0">
                <Outlet />
            </div>
        </>
    )
}
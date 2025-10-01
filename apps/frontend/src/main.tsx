import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './assets/css/app.css'
import App from './App'
import {AuthProvider} from "@/global/auth/AuthContext";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AuthProvider>
            <App/>
        </AuthProvider>
    </StrictMode>,
)

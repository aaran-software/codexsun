import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/css/index.css'
import App from './App'
import {NuqsAdapter} from "nuqs/adapters/react";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <NuqsAdapter>
    <App />
      </NuqsAdapter>
  </StrictMode>,
)

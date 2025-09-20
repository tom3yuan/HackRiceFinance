// main.tsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom' // --- 1. IMPORT THIS ---

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* --- 2. WRAP YOUR APP IN THE BROWSER ROUTER --- */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
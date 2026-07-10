import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ToastProvider } from './lib/toast'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/recipe/:recipeId" element={<App />} />
        </Routes>
      </ToastProvider>
    </HashRouter>
  </StrictMode>,
)

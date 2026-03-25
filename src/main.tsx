import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './core/App.tsx'
import { AuthProvider } from './core/contexts/AuthContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// Importe o Provider que criamos
import { ToastProvider } from './components/ToastContext'; 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider> {/* <--- Envolva o App aqui */}
      <App />
    </ToastProvider>
  </StrictMode>,
)
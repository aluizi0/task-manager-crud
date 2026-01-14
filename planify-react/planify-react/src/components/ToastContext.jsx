import React, { createContext, useContext, useState, useCallback } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Remove automático após 3 segundos
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {/* Container visual dos alertas */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <span className="toast-icon">
                {toast.type === 'success' && <FaCheckCircle style={{color: '#00ff88'}} />}
                {toast.type === 'error' && <FaExclamationCircle style={{color: '#ff4d4d'}} />}
                {toast.type === 'info' && <FaInfoCircle style={{color: '#00d2ff'}} />}
            </span>
            <span>{toast.message}</span>
            <button 
                onClick={() => removeToast(toast.id)} 
                style={{background:'none', border:'none', color:'#666', marginLeft:'auto', cursor:'pointer'}}
            >
                <FaTimes />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
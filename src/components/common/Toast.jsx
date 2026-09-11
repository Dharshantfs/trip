import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    const newToast = {
      id,
      type: toast.type || 'success',
      message: toast.message || '',
    };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration || 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => {
          let icon = <CheckCircle2 size={18} color="var(--color-success)" />;
          if (toast.type === 'error') {
            icon = <AlertCircle size={18} color="var(--color-danger)" />;
          } else if (toast.type === 'info') {
            icon = <Info size={18} color="var(--color-info)" />;
          }

          return (
            <div key={toast.id} className="toast">
              {icon}
              <span style={{ flex: 1, fontWeight: 500 }}>{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                style={{ padding: 2, color: 'var(--text-muted)' }}
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

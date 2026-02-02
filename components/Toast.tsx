'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

// Toast types
type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Hook to use toast
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Toast styling based on type
const toastStyles: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'bg-green-900/90',
    border: 'border-green-700',
    icon: '✓',
  },
  error: {
    bg: 'bg-red-900/90',
    border: 'border-red-700',
    icon: '✕',
  },
  info: {
    bg: 'bg-blue-900/90',
    border: 'border-blue-700',
    icon: 'ℹ',
  },
};

// Individual Toast component
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const styles = toastStyles[toast.type];
  const toastRef = useRef<HTMLDivElement>(null);

  // Auto-dismiss after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  // Handle keyboard dismiss
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Enter') {
      onDismiss(toast.id);
    }
  };

  return (
    <div
      ref={toastRef}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`
        ${styles.bg} ${styles.border}
        border rounded-lg px-4 py-3
        flex items-center gap-3
        shadow-lg backdrop-blur-sm
        animate-slide-in
        focus:outline-none focus:ring-2 focus:ring-white/30
        cursor-pointer
      `}
      onClick={() => onDismiss(toast.id)}
    >
      <span 
        className="w-5 h-5 flex items-center justify-center text-sm font-bold"
        aria-hidden="true"
      >
        {styles.icon}
      </span>
      <span className="text-sm text-white font-medium">
        {toast.message}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(toast.id);
        }}
        className="ml-auto text-white/60 hover:text-white transition-colors p-1"
        aria-label="Dismiss notification"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// Toast Provider component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast container - positioned at bottom center */}
      <div
        aria-label="Notifications"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={dismissToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

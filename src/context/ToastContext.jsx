import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const STYLES = {
  success: 'bg-emerald-950/85 border-emerald-500/25 text-emerald-300',
  error: 'bg-red-950/85 border-red-500/25 text-red-300',
  info: 'bg-accent-cyan/10 border-accent-cyan/25 text-accent-cyan',
};

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message, { type = 'info', title, duration = 3200 } = {}) => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, message, type, title }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      show,
      success: (msg, opts = {}) => show(msg, { ...opts, type: 'success' }),
      error: (msg, opts = {}) => show(msg, { ...opts, type: 'error' }),
      info: (msg, opts = {}) => show(msg, { ...opts, type: 'info' }),
      dismiss,
    }),
    [show, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined' &&
        ReactDOM.createPortal(
          <div className="fixed top-6 right-4 sm:right-6 z-[1000] flex flex-col gap-3 pointer-events-none max-w-[calc(100vw-2rem)] w-[360px]">
            <AnimatePresence>
              {toasts.map((t) => {
                const Icon = ICONS[t.type] || Info;
                return (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, y: -16, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 60, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-[0_0_35px_rgba(0,0,0,0.55)] backdrop-blur-xl ${STYLES[t.type]}`}
                  >
                    <Icon className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0 flex flex-col text-left">
                      {t.title && (
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-90">
                          {t.title}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-gray-100 break-words">
                        {t.message}
                      </span>
                    </div>
                    <button
                      onClick={() => dismiss(t.id)}
                      className="opacity-60 hover:opacity-100 transition-opacity p-0.5 -mr-0.5 -mt-0.5"
                      aria-label="Dismiss"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Safe no-op fallback so legacy callers don't crash if provider is missing.
    return {
      show: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
      dismiss: () => {},
    };
  }
  return ctx;
}

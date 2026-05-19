'use client';

import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

type Toast = {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
};

type ToastInput = Omit<Toast, 'id'> & { id?: string };

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const closeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback((input: ToastInput) => {
    const id = input.id || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    setToasts((current) => [...current, { ...input, id }]);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((item) => setTimeout(() => closeToast(item.id), TOAST_DURATION_MS));
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [closeToast, toasts]);

  const contextValue = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="pointer-events-none fixed inset-x-3 top-3 z-[9998] flex flex-col gap-2 sm:inset-x-auto sm:right-4 sm:top-4 sm:w-full sm:max-w-sm">
        {toasts.map((item) => {
          const isError = item.type === 'error';
          const Icon = item.type === 'success' ? CheckCircle2 : item.type === 'error' ? XCircle : Info;
          return (
            <article
              key={item.id}
              role={isError ? 'alert' : 'status'}
              aria-live={isError ? 'assertive' : 'polite'}
              className="toast-enter pointer-events-auto relative overflow-hidden rounded-xl border border-white/20 bg-[#11110f]/92 p-4 pr-11 shadow-[0_16px_34px_rgba(0,0,0,0.42)] backdrop-blur-md"
            >
              <span className={`absolute inset-y-0 left-0 w-1 ${isError ? 'bg-red-400/90' : 'bg-[#D4AF37]'}`} aria-hidden="true" />
              <div className="flex items-start gap-3 pl-1">
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${isError ? 'text-red-300' : 'text-[#D4AF37]'}`} aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-5 text-[#F6F1E8]">{item.title}</p>
                  {item.description ? <p className="mt-1 text-xs leading-5 text-white/72">{item.description}</p> : null}
                </div>
              </div>
              <button
                type="button"
                onClick={() => closeToast(item.id)}
                className="absolute right-2 top-2 rounded-full border border-white/15 p-1 text-white/65 transition hover:border-white/40 hover:text-white"
                aria-label="Tutup notifikasi"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </article>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

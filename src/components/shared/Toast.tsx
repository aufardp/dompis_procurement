"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

type ToastVariant = "success" | "error" | "warning" | "info";

type ToastItem = {
  id: string;
  variant: ToastVariant;
  message: string;
};

type ToastContextType = {
  toasts: ToastItem[];
  addToast: (variant: ToastVariant, message: string) => void;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

const icons: Record<ToastVariant, ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

const bgBorders: Record<ToastVariant, string> = {
  success: "border-green-200 bg-green-50",
  error: "border-red-200 bg-red-50",
  warning: "border-yellow-200 bg-yellow-50",
  info: "border-blue-200 bg-blue-50",
};

let toastCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (variant: ToastVariant, message: string) => {
      const id = `toast-${++toastCounter}`;
      setToasts((prev) => [...prev, { id, variant, message }]);
      setTimeout(() => removeToast(id), 4000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg text-sm min-w-[320px] max-w-[420px] animate-slide-in ${bgBorders[toast.variant]}`}
          >
            {icons[toast.variant]}
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-0.5 hover:bg-black/5 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return {
    success: (msg: string) => ctx.addToast("success", msg),
    error: (msg: string) => ctx.addToast("error", msg),
    warning: (msg: string) => ctx.addToast("warning", msg),
    info: (msg: string) => ctx.addToast("info", msg),
  };
}
"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";

type ConfirmVariant = "danger" | "warning" | "primary";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
};

type ConfirmPromise = {
  resolve: (value: boolean) => void;
};

type ConfirmContextType = {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextType | null>(null);

const variantStyles: Record<ConfirmVariant, string> = {
  danger: "bg-red-600 hover:bg-red-700",
  warning: "bg-yellow-500 hover:bg-yellow-600",
  primary: "bg-[#C098D6] hover:bg-[#b07ec9]",
};

const defaultOptions: ConfirmOptions = {
  message: "Apakah Anda yakin?",
  confirmText: "Ya, Hapus",
  cancelText: "Batal",
  variant: "danger",
};

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmOptions>(defaultOptions);
  const [promise, setPromise] = useState<ConfirmPromise | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    setOpts({ ...defaultOptions, ...options });
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      setPromise({ resolve });
    });
  }, []);

  function handleConfirm() {
    promise?.resolve(true);
    setOpen(false);
  }

  function handleCancel() {
    promise?.resolve(false);
    setOpen(false);
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9998]"
          onClick={(e) => { if (e.target === e.currentTarget) handleCancel(); }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-50">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <h2 className="text-lg font-bold">{opts.title || "Konfirmasi"}</h2>
              </div>
              <button onClick={handleCancel} className="p-0.5 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">{opts.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                {opts.cancelText || "Batal"}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 text-white rounded-lg text-sm font-medium ${variantStyles[opts.variant || "danger"]}`}
              >
                {opts.confirmText || "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx.confirm;
}
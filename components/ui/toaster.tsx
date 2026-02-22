"use client";

import * as React from "react";

import { Toast, ToastDescription, ToastTitle } from "@/components/ui/toast";

type ToastMessage = {
  id: number;
  title?: string;
  description?: string;
};

type ToastContextValue = {
  toast: (message: Omit<ToastMessage, "id">) => void;
};

const ToastContext = React.createContext<ToastContextValue | undefined>(
  undefined,
);

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const toast = React.useCallback(
    (message: Omit<ToastMessage, "id">) => {
      const id = ++toastId;
      setToasts((current) => [...current, { id, ...message }]);
      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== id));
      }, 2500);
    },
    [setToasts],
  );

  const value = React.useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2">
        {toasts.map((t) => (
          <Toast key={t.id} className="bg-background/95 backdrop-blur">
            <div className="flex flex-col gap-1">
              {t.title ? <ToastTitle>{t.title}</ToastTitle> : null}
              {t.description ? (
                <ToastDescription>{t.description}</ToastDescription>
              ) : null}
            </div>
          </Toast>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}


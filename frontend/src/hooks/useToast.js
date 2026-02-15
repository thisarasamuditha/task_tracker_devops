import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((toast) => {
    const id = makeId();
    const next = {
      id,
      title: toast.title,
      message: toast.message,
      variant: toast.variant || "info", // info | success | error
      timeoutMs: toast.timeoutMs ?? 3200,
    };

    setToasts((prev) => [next, ...prev]);

    if (next.timeoutMs > 0) {
      window.setTimeout(() => dismiss(id), next.timeoutMs);
    }

    return id;
  }, [dismiss]);

  const api = useMemo(
    () => ({
      toasts,
      show,
      dismiss,
      success: (opts) => show({ ...opts, variant: "success" }),
      error: (opts) => show({ ...opts, variant: "error" }),
      info: (opts) => show({ ...opts, variant: "info" }),
    }),
    [toasts, show, dismiss]
  );

  return React.createElement(ToastContext.Provider, { value: api }, children);
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

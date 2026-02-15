import { useToast } from "../hooks/useToast";

function ToastIcon({ variant }) {
  if (variant === "success") {
    return (
      <svg className="w-5 h-5 text-success" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  if (variant === "error") {
    return (
      <svg className="w-5 h-5 text-danger" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  return (
    <svg className="w-5 h-5 text-secondary" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zM9 9a1 1 0 102 0V7a1 1 0 10-2 0v2zm0 4a1 1 0 102 0 1 1 0 10-2 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function ToastHost() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-3 w-[92vw] max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-white/90 dark:bg-surfaceDark/90 backdrop-blur border border-border dark:border-borderDark rounded-2xl shadow-lg p-4 flex items-start gap-3 animate-slide-up"
        >
          <div className="mt-0.5">
            <ToastIcon variant={t.variant} />
          </div>
          <div className="flex-1">
            {t.title && (
              <p className="font-semibold text-text dark:text-textDark leading-5">
                {t.title}
              </p>
            )}
            {t.message && (
              <p className="text-sm text-muted dark:text-mutedDark mt-1">
                {t.message}
              </p>
            )}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="text-muted dark:text-mutedDark hover:text-text dark:hover:text-textDark transition-colors"
            aria-label="Dismiss"
            type="button"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

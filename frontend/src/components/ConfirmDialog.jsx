export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // danger | primary
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const confirmClasses =
    variant === "primary"
      ? "bg-primary hover:bg-primary/90"
      : "bg-danger hover:bg-danger/90";

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />

      <div className="relative w-full max-w-md bg-white dark:bg-surfaceDark border border-border dark:border-borderDark rounded-2xl shadow-2xl p-6 animate-scale-in">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-danger/10 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-danger"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v4m0 4h.01M10.29 3.86l-8.08 14A2 2 0 003.94 21h16.12a2 2 0 001.73-3.14l-8.08-14a2 2 0 00-3.46 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-text dark:text-textDark">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-muted dark:text-mutedDark mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-muted dark:text-mutedDark hover:text-text dark:hover:text-textDark transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border dark:border-borderDark text-text dark:text-textDark hover:bg-surface dark:hover:bg-surfaceDark transition-colors font-semibold"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-white transition-colors font-semibold shadow-md ${confirmClasses}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

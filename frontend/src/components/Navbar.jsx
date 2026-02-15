import { useTheme } from "../hooks/useTheme";

export default function Navbar({ onOpenMobileMenu }) {
  const { theme, toggleTheme } = useTheme();
  const username = localStorage.getItem("username") || "User";

  return (
    <header className="sticky top-0 z-40 border-b border-border dark:border-borderDark bg-white/70 dark:bg-surfaceDark/60 backdrop-blur-xl">
      <div className="h-16 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl hover:bg-surface dark:hover:bg-surfaceDark transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <p className="font-display font-bold text-text dark:text-textDark leading-5">
              Productivity
            </p>
            <p className="text-xs text-muted dark:text-mutedDark">
              Your tasks. Your flow.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-surface dark:hover:bg-surfaceDark transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M7.05 16.95l-1.414 1.414m0-11.314L7.05 7.05m10.9 9.9l1.414 1.414"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8a4 4 0 100 8 4 4 0 000-8z"
                />
              </svg>
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
                />
              </svg>
            )}
          </button>

          <div className="flex items-center gap-3 pl-2">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-text dark:text-textDark leading-4">
                {username}
              </p>
              <p className="text-xs text-muted dark:text-mutedDark">Account</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg flex items-center justify-center text-white font-bold">
              {username.slice(0, 1).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

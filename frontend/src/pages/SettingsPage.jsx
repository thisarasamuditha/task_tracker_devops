import { useTheme } from "../hooks/useTheme";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-extrabold text-text dark:text-textDark">Settings</h1>
        <p className="text-muted dark:text-mutedDark mt-2">Personalize your workspace.</p>
      </div>

      <div className="bg-white dark:bg-surfaceDark border border-border dark:border-borderDark rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-text dark:text-textDark">Appearance</p>
            <p className="text-sm text-muted dark:text-mutedDark mt-1">Toggle light/dark mode.</p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="px-4 py-2.5 rounded-xl bg-surface dark:bg-borderDark text-text dark:text-textDark font-bold hover:opacity-90 transition"
          >
            {theme === "dark" ? "Switch to light" : "Switch to dark"}
          </button>
        </div>
      </div>
    </div>
  );
}

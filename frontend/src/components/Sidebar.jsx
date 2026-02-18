import { NavLink, useNavigate } from "react-router-dom";

function Item({ to, icon, label, onNavigate }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold ` +
        (isActive
          ? "bg-primary/10 text-primary"
          : "text-text dark:text-textDark hover:bg-surface dark:hover:bg-surfaceDark")
      }
    >
      <span className="w-5 h-5">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

export default function Sidebar({ variant = "desktop", onNavigate }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const username = localStorage.getItem("username") || "User";

  const containerClassName =
    variant === "mobile"
      ? "flex w-72"
      : "hidden md:flex md:w-72";

  return (
    <aside
      className={`${containerClassName} shrink-0 border-r border-border dark:border-borderDark bg-white/70 dark:bg-surfaceDark/60 backdrop-blur-xl`}
    >
      <div className="w-full p-5 flex flex-col">
        <div className="flex items-center gap-3 px-3 py-2">
          <img
            src="/task.png"
            alt="Task Manager"
            className="w-11 h-11 rounded-2xl shadow-lg object-cover"
          />
          <div className="min-w-0">
            <p className="font-display font-bold text-text dark:text-textDark leading-5 truncate">
              Task Manager
            </p>
            <p className="text-xs text-muted dark:text-mutedDark truncate">
              @{username}
            </p>
          </div>
        </div>

        <nav className="mt-6 space-y-1">
          <Item
            to="/dashboard"
            label="Dashboard"
            onNavigate={onNavigate}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 13h8V3H3v10zm10 8h8V11h-8v10zM3 21h8v-6H3v6zm10-8h8V3h-8v10z"
                />
              </svg>
            }
          />
          <Item
            to="/tasks"
            label="Tasks"
            onNavigate={onNavigate}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"
                />
              </svg>
            }
          />
          <Item
            to="/settings"
            label="Settings"
            onNavigate={onNavigate}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15.5A3.5 3.5 0 1112 8.5a3.5 3.5 0 010 7z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.4 15a1.8 1.8 0 00.36 1.98l.03.03a2.2 2.2 0 01-1.56 3.76h-.09a1.8 1.8 0 00-1.58.9l-.02.04a2.2 2.2 0 01-3.9 0l-.02-.04a1.8 1.8 0 00-1.58-.9H9.96a1.8 1.8 0 00-1.58.9l-.02.04a2.2 2.2 0 01-3.9 0l-.02-.04a1.8 1.8 0 00-1.58-.9h-.09A2.2 2.2 0 011.2 17l.03-.03A1.8 1.8 0 001.59 15v-.06a1.8 1.8 0 00-.4-1.98l-.03-.03A2.2 2.2 0 012.72 9.2h.09a1.8 1.8 0 001.58-.9l.02-.04a2.2 2.2 0 013.9 0l.02.04a1.8 1.8 0 001.58.9h.06c.67 0 1.28-.37 1.58-.97l.02-.04a2.2 2.2 0 013.9 0l.02.04c.3.6.91.97 1.58.97h.06a1.8 1.8 0 001.58-.9h.09a2.2 2.2 0 011.56 3.76l-.03.03a1.8 1.8 0 00-.36 1.98v.06z"
                />
              </svg>
            }
          />
        </nav>

        <div className="mt-auto pt-5">
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-danger hover:bg-danger/10 transition-colors font-semibold"
          >
            <span className="w-5 h-5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </span>
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

function Badge({ children, tone = "muted" }) {
  const toneMap = {
    muted: "bg-surface text-text dark:bg-borderDark dark:text-textDark",
    pending: "bg-pending/20 text-pending",
    inProgress: "bg-inProgress/20 text-inProgress",
    completed: "bg-completed/20 text-completed",
    low: "bg-accent/20 text-accent",
    medium: "bg-warning/20 text-warning",
    high: "bg-danger/20 text-danger",
  };

  return (
    <span className={`px-3 py-1 text-xs font-bold rounded-full ${toneMap[tone] || toneMap.muted}`}>
      {children}
    </span>
  );
}

function formatStatus(status) {
  if (status === "IN_PROGRESS") return "In Progress";
  if (!status) return "Todo";
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function formatPriority(priority) {
  if (!priority) return "Low";
  return priority.charAt(0) + priority.slice(1).toLowerCase();
}

export default function TaskCard({
  task,
  removing,
  onEdit,
  onDelete,
  onToggleComplete,
}) {
  const statusTone =
    task.status === "PENDING"
      ? "pending"
      : task.status === "IN_PROGRESS"
      ? "inProgress"
      : task.status === "COMPLETED"
      ? "completed"
      : "muted";

  const priorityTone =
    task.priority === "HIGH" ? "high" : task.priority === "MEDIUM" ? "medium" : "low";

  const isCompleted = task.status === "COMPLETED";

  return (
    <div
      className={
        "bg-white dark:bg-surfaceDark border border-border dark:border-borderDark rounded-2xl shadow-sm p-5 hover:shadow-md transition-all duration-200 animate-slide-up " +
        (removing ? "opacity-0 translate-y-2" : "opacity-100")
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <button
            type="button"
            onClick={onToggleComplete}
            className={
              "mt-0.5 w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-colors " +
              (isCompleted
                ? "bg-completed/20 border-completed text-completed"
                : "bg-surface dark:bg-borderDark border-border dark:border-borderDark text-muted dark:text-mutedDark hover:border-primary")
            }
            aria-label={isCompleted ? "Mark as not completed" : "Mark as completed"}
          >
            {isCompleted ? (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m4-4H8" />
              </svg>
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={
                  "font-bold text-text dark:text-textDark truncate transition-opacity " +
                  (isCompleted ? "line-through opacity-70" : "")
                }
              >
                {task.title}
              </h3>
              <Badge tone={statusTone}>{formatStatus(task.status)}</Badge>
              <Badge tone={priorityTone}>{formatPriority(task.priority)}</Badge>
            </div>

            <p className="text-sm text-muted dark:text-mutedDark mt-2">
              {task.description || "No description"}
            </p>

            <div className="mt-3 flex items-center gap-3 flex-wrap">
              {task.dueDate && (
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-muted dark:text-mutedDark">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Due {new Date(task.dueDate).toLocaleDateString()}
                </div>
              )}

              {task.updatedAt && (
                <div className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold text-muted dark:text-mutedDark">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Updated {new Date(task.updatedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="p-2 rounded-xl text-primary hover:bg-primary/10 transition-colors"
            aria-label="Edit"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-2 rounded-xl text-danger hover:bg-danger/10 transition-colors"
            aria-label="Delete"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

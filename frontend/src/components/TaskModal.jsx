import { useEffect, useMemo, useState } from "react";

const DEFAULT_FORM = {
  title: "",
  description: "",
  status: "PENDING",
  priority: "LOW",
  dueDate: "",
};

export default function TaskModal({ open, mode, task, onClose, onSubmit }) {
  const initial = useMemo(() => {
    if (mode === "edit" && task) {
      return {
        title: task.title || "",
        description: task.description || "",
        status: task.status || "PENDING",
        priority: task.priority || "LOW",
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "",
      };
    }
    return DEFAULT_FORM;
  }, [mode, task]);

  const [form, setForm] = useState(initial);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setForm(initial);
  }, [open, initial]);

  if (!open) return null;

  const title = mode === "edit" ? "Edit task" : "Create new task";

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit({
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        dueDate: form.dueDate || null,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-surfaceDark border border-border dark:border-borderDark rounded-2xl shadow-2xl p-6 animate-scale-in">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-text dark:text-textDark">{title}</h3>
            <p className="text-sm text-muted dark:text-mutedDark mt-1">Keep it short. Ship it.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-surface dark:hover:bg-borderDark transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text dark:text-textDark mb-2">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-border dark:border-borderDark rounded-xl bg-white dark:bg-surfaceDark text-text dark:text-textDark focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Design homepage"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text dark:text-textDark mb-2">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border-2 border-border dark:border-borderDark rounded-xl bg-white dark:bg-surfaceDark text-text dark:text-textDark focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Optional notes..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text dark:text-textDark mb-2">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-border dark:border-borderDark rounded-xl bg-white dark:bg-surfaceDark text-text dark:text-textDark focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="PENDING">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text dark:text-textDark mb-2">Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-border dark:border-borderDark rounded-xl bg-white dark:bg-surfaceDark text-text dark:text-textDark focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text dark:text-textDark mb-2">Due date</label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-border dark:border-borderDark rounded-xl bg-white dark:bg-surfaceDark text-text dark:text-textDark focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-border dark:border-borderDark text-text dark:text-textDark hover:bg-surface dark:hover:bg-borderDark transition-colors font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors font-bold shadow-md disabled:opacity-60"
            >
              {submitting ? "Saving..." : mode === "edit" ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

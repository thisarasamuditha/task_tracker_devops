import { useEffect, useMemo, useState } from "react";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useToast } from "../hooks/useToast";
import ConfirmDialog from "../components/ConfirmDialog";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import { TaskCardSkeleton } from "../components/Skeletons";
import {
  createTaskForUser,
  deleteTaskForUser,
  getTasksByUser,
  updateTaskForUser,
} from "../services/tasksService";

function sortTasks(tasks, sortBy) {
  const copy = [...tasks];

  if (sortBy === "dueDate") {
    return copy.sort((a, b) => {
      const ad = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
      const bd = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
      return ad - bd;
    });
  }

  if (sortBy === "priority") {
    const weight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return copy.sort((a, b) => (weight[b.priority] || 0) - (weight[a.priority] || 0));
  }

  if (sortBy === "title") {
    return copy.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  }

  if (sortBy === "status") {
    const weight = { PENDING: 1, IN_PROGRESS: 2, COMPLETED: 3 };
    return copy.sort((a, b) => (weight[a.status] || 9) - (weight[b.status] || 9));
  }

  // default: newest updated first (if present)
  return copy.sort((a, b) => {
    const at = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bt = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return bt - at;
  });
}

export default function TasksPage() {
  const toast = useToast();
  const userId = localStorage.getItem("userId");

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);

  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updatedAt");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingTask, setEditingTask] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const [removingIds, setRemovingIds] = useState(() => new Set());

  const fetchTasks = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getTasksByUser(userId);
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error({ title: "Failed to load tasks", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();

    let next = tasks;

    if (q) {
      next = next.filter((t) => {
        const hay = `${t.title || ""} ${t.description || ""}`.toLowerCase();
        return hay.includes(q);
      });
    }

    if (statusFilter !== "all") {
      next = next.filter((t) => t.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      next = next.filter((t) => t.priority === priorityFilter);
    }

    return sortTasks(next, sortBy);
  }, [tasks, debouncedQuery, statusFilter, priorityFilter, sortBy]);

  const openCreate = () => {
    setModalMode("create");
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setModalMode("edit");
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSubmitTask = async (payload) => {
    if (!userId) return;

    try {
      if (modalMode === "edit" && editingTask) {
        const updated = await updateTaskForUser(userId, editingTask.taskId, payload);
        setTasks((prev) => prev.map((t) => (t.taskId === editingTask.taskId ? updated : t)));
        toast.success({ title: "Task updated" });
      } else {
        const created = await createTaskForUser(userId, payload);
        setTasks((prev) => [created, ...prev]);
        toast.success({ title: "Task created" });
      }
    } catch (err) {
      toast.error({ title: "Save failed", message: err.message });
      throw err;
    }
  };

  const askDelete = (task) => {
    setTaskToDelete(task);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!userId || !taskToDelete) return;

    const id = taskToDelete.taskId;

    setConfirmOpen(false);
    setRemovingIds((prev) => new Set(prev).add(id));

    window.setTimeout(async () => {
      try {
        await deleteTaskForUser(userId, id);
        setTasks((prev) => prev.filter((t) => t.taskId !== id));
        toast.success({ title: "Task deleted" });
      } catch (err) {
        toast.error({ title: "Delete failed", message: err.message });
        setRemovingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    }, 160);
  };

  const toggleComplete = async (task) => {
    if (!userId) return;

    const nextStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";

    try {
      const updated = await updateTaskForUser(userId, task.taskId, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t.taskId === task.taskId ? updated : t)));
      toast.success({ title: nextStatus === "COMPLETED" ? "Completed" : "Reopened" });
    } catch (err) {
      toast.error({ title: "Update failed", message: err.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-text dark:text-textDark">Tasks</h1>
          <p className="text-muted dark:text-mutedDark mt-2">Search, filter and ship.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-muted dark:text-mutedDark" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full sm:w-72 pl-10 pr-4 py-3 rounded-xl border-2 border-border dark:border-borderDark bg-white dark:bg-surfaceDark text-text dark:text-textDark focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="px-4 py-3 rounded-xl bg-primary text-white font-bold shadow-md hover:bg-primary/90 transition-colors"
          >
            + New task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 rounded-xl border-2 border-border dark:border-borderDark bg-white dark:bg-surfaceDark text-text dark:text-textDark"
        >
          <option value="all">All status</option>
          <option value="PENDING">Todo</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-3 rounded-xl border-2 border-border dark:border-borderDark bg-white dark:bg-surfaceDark text-text dark:text-textDark"
        >
          <option value="all">All priority</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-3 rounded-xl border-2 border-border dark:border-borderDark bg-white dark:bg-surfaceDark text-text dark:text-textDark"
        >
          <option value="updatedAt">Sort: recently updated</option>
          <option value="dueDate">Sort: due date</option>
          <option value="priority">Sort: priority</option>
          <option value="title">Sort: title</option>
          <option value="status">Sort: status</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <TaskCardSkeleton key={idx} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-surfaceDark border border-border dark:border-borderDark rounded-2xl shadow-sm p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
            </svg>
          </div>
          <h3 className="mt-4 text-xl font-bold text-text dark:text-textDark">No tasks found</h3>
          <p className="mt-2 text-muted dark:text-mutedDark">Create your first task and start moving.</p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-6 px-5 py-3 rounded-xl bg-primary text-white font-bold shadow-md hover:bg-primary/90 transition-colors"
          >
            Create a task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filtered.map((task) => (
            <TaskCard
              key={task.taskId}
              task={task}
              removing={removingIds.has(task.taskId)}
              onEdit={() => openEdit(task)}
              onDelete={() => askDelete(task)}
              onToggleComplete={() => toggleComplete(task)}
            />
          ))}
        </div>
      )}

      <TaskModal
        open={modalOpen}
        mode={modalMode}
        task={editingTask}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitTask}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete task?"
        description={taskToDelete ? `This will permanently delete “${taskToDelete.title}”.` : ""}
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

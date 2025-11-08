import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  createTask,
  getTasksByUser,
  deleteTask,
  updateTask,
} from "../api/tasks";
import AddTaskModal from "./AddTaskModal";
import EditTaskModal from "./EditTaskModal";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [taskBeingEdited, setTaskBeingEdited] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication and fetch tasks when component mounts
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    console.log("Dashboard mounted, userId:", userId);

    if (!userId) {
      // No user logged in, redirect to login
      console.log("No userId found, redirecting to login");
      navigate("/login");
      return;
    }

    console.log("User authenticated, fetching tasks");
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      console.log("Fetching tasks for userId:", userId);
      const data = await getTasksByUser(userId);
      console.log("Tasks fetched:", data);
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const newTask = await createTask(taskData);
      setTasks([...tasks, newTask]);
      setShowAddModal(false);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      const userId = localStorage.getItem("userId");
      await deleteTask(userId, taskId);
      setTasks(tasks.filter((task) => task.taskId !== taskId));
    } catch (error) {
      alert("Failed to delete task");
    }
  };

  const openEdit = (task) => {
    setTaskBeingEdited(task);
    setShowEditModal(true);
  };

  const handleSaveEdits = async (updatedFields) => {
    const userId = localStorage.getItem("userId");
    const taskId = taskBeingEdited.taskId;
    // Call API
    const updated = await updateTask(userId, taskId, updatedFields);
    // Update list locally
    setTasks((prev) =>
      prev.map((t) => (t.taskId === taskId ? { ...t, ...updated } : t))
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    navigate("/login");
  };

  // Filter tasks based on active tab
  const getFilteredTasks = () => {
    if (activeTab === "all") return tasks;
    if (activeTab === "pending")
      return tasks.filter((task) => task.status === "PENDING");
    if (activeTab === "inprogress")
      return tasks.filter((task) => task.status === "IN_PROGRESS");
    if (activeTab === "completed")
      return tasks.filter((task) => task.status === "COMPLETED");
    return tasks;
  };

  const filteredTasks = getFilteredTasks();

  // Get tab title for display
  const getTabTitle = () => {
    if (activeTab === "all") return "All Tasks";
    if (activeTab === "pending") return "Pending Tasks";
    if (activeTab === "inprogress") return "In Progress Tasks";
    if (activeTab === "completed") return "Completed Tasks";
    return "Tasks";
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6">
          {/* User Profile Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-3">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-text">
              {localStorage.getItem("username") || "User"}
            </h3>
            <p className="text-sm text-muted">
              {localStorage.getItem("username")
                ? `@${localStorage.getItem("username")}`
                : "user@example.com"}
            </p>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                activeTab === "all"
                  ? "bg-primary/10 text-primary"
                  : "text-text hover:bg-surface"
              }`}
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              All Tasks
            </button>

            <button
              onClick={() => setActiveTab("pending")}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                activeTab === "pending"
                  ? "bg-primary/10 text-primary"
                  : "text-text hover:bg-surface"
              }`}
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Pending
            </button>

            <button
              onClick={() => setActiveTab("inprogress")}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                activeTab === "inprogress"
                  ? "bg-primary/10 text-primary"
                  : "text-text hover:bg-surface"
              }`}
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              In Progress
            </button>

            <button
              onClick={() => setActiveTab("completed")}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                activeTab === "completed"
                  ? "bg-primary/10 text-primary"
                  : "text-text hover:bg-surface"
              }`}
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Completed
            </button>

            <div className="pt-4 mt-4 border-t border-border">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-danger hover:bg-danger/10 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <h1 className="text-2xl font-bold text-text">Task Manager</h1>
              <p className="text-sm text-muted mt-1">
                Manage your tasks efficiently
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-md"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add New Task
            </button>
          </div>
        </header>

        {/* Task Content Area */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Total Tasks</p>
                  <p className="text-2xl font-bold text-text mt-1">
                    {tasks.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Pending</p>
                  <p className="text-2xl font-bold text-pending mt-1">
                    {tasks.filter((t) => t.status === "PENDING").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-pending/10 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-pending"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">In Progress</p>
                  <p className="text-2xl font-bold text-inProgress mt-1">
                    {tasks.filter((t) => t.status === "IN_PROGRESS").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-inProgress/10 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-inProgress"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Completed</p>
                  <p className="text-2xl font-bold text-completed mt-1">
                    {tasks.filter((t) => t.status === "COMPLETED").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-completed/10 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-completed"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-text mb-4">
              {getTabTitle()}
            </h2>
            <div className="space-y-4">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <div
                    key={task.taskId}
                    className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-text">
                            {task.title}
                          </h3>
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              task.status === "PENDING"
                                ? "bg-pending/20 text-pending"
                                : task.status === "IN_PROGRESS"
                                ? "bg-inProgress/20 text-inProgress"
                                : task.status === "COMPLETED"
                                ? "bg-completed/20 text-completed"
                                : "bg-muted/20 text-muted"
                            }`}
                          >
                            {task.status === "IN_PROGRESS"
                              ? "In Progress"
                              : task.status.charAt(0) +
                                task.status.slice(1).toLowerCase()}
                          </span>
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              task.priority === "HIGH"
                                ? "bg-danger/20 text-danger"
                                : task.priority === "MEDIUM"
                                ? "bg-warning/20 text-warning"
                                : "bg-accent/20 text-accent"
                            }`}
                          >
                            {task.priority.charAt(0) +
                              task.priority.slice(1).toLowerCase()}
                          </span>
                        </div>
                        <p className="text-sm text-muted mb-3">
                          {task.description || "No description"}
                        </p>
                        {task.dueDate && (
                          <div className="flex items-center text-sm text-muted">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => openEdit(task)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.taskId)}
                          className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 text-muted mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="text-muted">
                    {activeTab === "all"
                      ? "No tasks found. Create your first task!"
                      : `No ${
                          activeTab === "inprogress" ? "in progress" : activeTab
                        } tasks.`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onTaskCreated={handleCreateTask}
      />
      <EditTaskModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        task={taskBeingEdited}
        onSave={handleSaveEdits}
      />
    </div>
  );
}

export default Dashboard;

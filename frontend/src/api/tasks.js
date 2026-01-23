import axios from "axios";

const API_BASE_URL = "http://localhost:8088/api";

// Create a new task
export const createTask = async (taskData) => {
  try {
    console.log("Creating task with data:", taskData);

    // Transform data to match backend CreateTaskRequest DTO
    const payload = {
      title: taskData.title,
      description: taskData.description || null,
      status: taskData.status || "PENDING",
      priority: taskData.priority || "LOW",
      dueDate: taskData.dueDate || null, // Send as yyyy-MM-dd or null
    };

    console.log("Sending payload:", payload);

    // POST to /api/users/{userId}/tasks
    const response = await axios.post(
      `${API_BASE_URL}/users/${taskData.userId}/tasks`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Task created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating task:", error);
    console.error("Error response:", error.response);
    console.error("Error message:", error.message);

    if (error.code === "ERR_NETWORK") {
      throw new Error(
        "Cannot connect to server. Please check if backend is running on http://localhost:8088"
      );
    }

    throw error;
  }
};

// Update an existing task (status, priority, dueDate)
export const updateTask = async (userId, taskId, taskData) => {
  try {
    console.log(`Updating task ${taskId} for user ${userId}:`, taskData);

    // Only send fields that need updating
    const payload = {};
    if (taskData.status !== undefined) payload.status = taskData.status;
    if (taskData.priority !== undefined) payload.priority = taskData.priority;
    if (taskData.dueDate !== undefined) payload.dueDate = taskData.dueDate;
    if (taskData.title !== undefined) payload.title = taskData.title;
    if (taskData.description !== undefined)
      payload.description = taskData.description;

    console.log("Update payload:", payload);

    const response = await axios.put(
      `${API_BASE_URL}/users/${userId}/tasks/${taskId}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Task updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating task:", error);
    if (error.code === "ERR_NETWORK") {
      throw new Error(
        "Cannot connect to server. Please check if backend is running."
      );
    }
    throw error;
  }
};

// Delete a task
export const deleteTask = async (userId, taskId) => {
  try {
    console.log(`Deleting task ${taskId} for user ${userId}`);
    const response = await axios.delete(
      `${API_BASE_URL}/users/${userId}/tasks/${taskId}`
    );
    console.log("Task deleted successfully");
    return response.data;
  } catch (error) {
    console.error("Error deleting task:", error);
    if (error.code === "ERR_NETWORK") {
      throw new Error(
        "Cannot connect to server. Please check if backend is running."
      );
    }
    throw error;
  }
};

// Get all tasks for a user
export const getTasksByUser = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}/tasks`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

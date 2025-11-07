import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

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
        "Cannot connect to server. Please check if backend is running on http://localhost:8080"
      );
    }

    throw error;
  }
};

// Get all tasks for a user
export const getTasksByUser = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

// Update a task
export const updateTask = async (taskId, taskData) => {
  try {
    const response = await axios.put(`${API_URL}/${taskId}`, taskData);
    return response.data;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (taskId) => {
  try {
    await axios.delete(`${API_URL}/${taskId}`);
    return true;
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

import { apiClient } from "./apiClient";

export async function getTasksByUser(userId) {
  const res = await apiClient.get(`/users/${userId}/tasks`);
  return res.data;
}

export async function createTaskForUser(userId, taskData) {
  const payload = {
    title: taskData.title,
    description: taskData.description || null,
    status: taskData.status || "PENDING",
    priority: taskData.priority || "LOW",
    dueDate: taskData.dueDate || null,
  };

  const res = await apiClient.post(`/users/${userId}/tasks`, payload);
  return res.data;
}

export async function updateTaskForUser(userId, taskId, taskData) {
  const payload = {};
  if (taskData.title !== undefined) payload.title = taskData.title;
  if (taskData.description !== undefined) payload.description = taskData.description;
  if (taskData.status !== undefined) payload.status = taskData.status;
  if (taskData.priority !== undefined) payload.priority = taskData.priority;
  if (taskData.dueDate !== undefined) payload.dueDate = taskData.dueDate;

  const res = await apiClient.put(`/users/${userId}/tasks/${taskId}`, payload);
  return res.data;
}

export async function deleteTaskForUser(userId, taskId) {
  const res = await apiClient.delete(`/users/${userId}/tasks/${taskId}`);
  return res.data;
}

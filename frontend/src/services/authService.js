import { apiClient } from "./apiClient";

export async function login({ username, password }) {
  const res = await apiClient.post("/auth/login", { username, password });
  return res.data;
}

export async function signup({ username, password }) {
  const res = await apiClient.post("/auth/signup", { username, password });
  return res.data;
}

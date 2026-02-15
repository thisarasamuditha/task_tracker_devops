import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.code === "ERR_NETWORK") {
      return Promise.reject(
        new Error(
          "Cannot connect to server. Check backend and proxy configuration."
        )
      );
    }
    return Promise.reject(error);
  }
);

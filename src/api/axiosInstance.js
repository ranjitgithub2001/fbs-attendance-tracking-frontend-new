import axios from "axios";
import { API_BASE, isUnauthenticatedApiCall } from "./apiBase";

const axiosInstance = axios.create({
  baseURL: API_BASE,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";
    if (
      status === 401 &&
      !isUnauthenticatedApiCall(url) &&
      !isUnauthenticatedApiCall(error?.config?.baseURL + url)
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/student")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

import axios from "axios";
import { API_BASE, isUnauthenticatedApiCall } from "./apiBase";

const studentAxios = axios.create({
  baseURL: API_BASE,
});

studentAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("studentToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

studentAxios.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";
    const fullUrl = `${error?.config?.baseURL || ""}${url}`;
    if (
      (status === 401 || status === 403) &&
      !isUnauthenticatedApiCall(url) &&
      !isUnauthenticatedApiCall(fullUrl)
    ) {
      localStorage.removeItem("studentToken");
      localStorage.removeItem("studentFrn");
      if (typeof window !== "undefined") {
        window.location.href = "/student/login";
      }
    }
    return Promise.reject(error);
  }
);

export default studentAxios;

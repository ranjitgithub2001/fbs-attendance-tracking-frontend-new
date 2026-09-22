export const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export function isUnauthenticatedApiCall(url = "") {
  const path = String(url);
  return (
    path.includes("/auth/") ||
    path.includes("/public/phone") ||
    path.includes("/public/otp/") ||
    path.includes("/trainer-requests/public/")
  );
}

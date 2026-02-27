const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "")
  .trim()
  .replace(/\/$/, "");

const fallbackProductionApiBaseUrl =
  "https://sathyabama-arrear-notification-system.onrender.com";

const isLocalDevelopmentHost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

const apiBaseUrl =
  configuredApiBaseUrl ||
  (isLocalDevelopmentHost ? "" : fallbackProductionApiBaseUrl);

export function apiUrl(path: string) {
  if (!path) {
    return apiBaseUrl || "/";
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return apiBaseUrl ? `${apiBaseUrl}${normalizedPath}` : normalizedPath;
}
import { sessionStorageKey, tokenStorageKey, adminViewStorageKey  } from './constants'
import type { AdminSession, AdminView } from "./types";

export const readStoredSession = () => {
  const storedSession = sessionStorage.getItem(sessionStorageKey)

  if (!storedSession) {
    const legacyToken = sessionStorage.getItem(tokenStorageKey)

    return legacyToken ? { role: 'admin' as const, token: legacyToken } : null
  }

  try {
    return JSON.parse(storedSession) as AdminSession
  } catch {
    sessionStorage.removeItem(sessionStorageKey)
    return null
  }
}

export const readStoredAdminView = (): AdminView => {
  const storedView = localStorage.getItem(adminViewStorageKey);

  if (
    storedView === "schedule" ||
    storedView === "availability" ||
    storedView === "clients" ||
    storedView === "barbers"
  ) {
    return storedView;
  }

  return "schedule";
};

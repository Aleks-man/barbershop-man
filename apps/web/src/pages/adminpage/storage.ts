import { sessionStorageKey, tokenStorageKey } from './constants'
import type { AdminSession } from './types'

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

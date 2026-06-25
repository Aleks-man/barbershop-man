export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

export const apiUrl = (path: string) =>
  `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`

export const apiFetch = (path: string, init?: RequestInit) => fetch(apiUrl(path), init)

export const mediaUrl = (path?: string | null) => {
  if (!path) {
    return ''
  }

  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) {
    return path
  }

  return apiUrl(path)
}

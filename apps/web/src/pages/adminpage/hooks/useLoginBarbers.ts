import { useCallback, useEffect, useMemo, useState } from 'react'
import type { AdminBarber } from '../../../api/admin'
import { apiFetch } from '../../../api/client'

const emptyBarbersMessage = 'В базе пока нет активных мастеров.'
const failedBarbersMessage =
  'Не удалось загрузить мастеров из базы. Проверьте, что backend запущен.'

export function useLoginBarbers(isSessionActive: boolean) {
  const [isLoadingLoginBarbers, setIsLoadingLoginBarbers] = useState(false)
  const [loginBarbersMessage, setLoginBarbersMessage] = useState('')
  const [loginBarbers, setLoginBarbers] = useState<AdminBarber[]>([])
  const [loginBarberId, setLoginBarberId] = useState('')

  const applyLoginBarbers = useCallback((barbers: AdminBarber[]) => {
    setLoginBarbers(barbers)
    setLoginBarberId(
      (currentBarberId) => currentBarberId || barbers[0]?.id || '',
    )
    setLoginBarbersMessage(barbers.length === 0 ? emptyBarbersMessage : '')
  }, [])

  const loadLoginBarbers = useCallback(() => {
    setIsLoadingLoginBarbers(true)
    setLoginBarbersMessage('')

    apiFetch('/api/barbers')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load barbers')
        }

        return response.json() as Promise<{ barbers: AdminBarber[] }>
      })
      .then((data) => {
        applyLoginBarbers(data.barbers)
      })
      .catch(() => {
        setLoginBarbers([])
        setLoginBarberId('')
        setLoginBarbersMessage(failedBarbersMessage)
      })
      .finally(() => {
        setIsLoadingLoginBarbers(false)
      })
  }, [applyLoginBarbers])

  useEffect(() => {
    if (isSessionActive) {
      return
    }

    let isMounted = true

    apiFetch('/api/barbers')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load barbers')
        }

        return response.json() as Promise<{ barbers: AdminBarber[] }>
      })
      .then((data) => {
        if (isMounted) {
          applyLoginBarbers(data.barbers)
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoginBarbers([])
          setLoginBarberId('')
          setLoginBarbersMessage(failedBarbersMessage)
        }
      })

    return () => {
      isMounted = false
    }
  }, [applyLoginBarbers, isSessionActive])

  const loginBarberOptions = useMemo(
    () =>
      loginBarbers.map((barber) => ({
        label: barber.name,
        value: barber.id,
      })),
    [loginBarbers],
  )

  return {
    isLoadingLoginBarbers,
    loadLoginBarbers,
    loginBarberId,
    loginBarberOptions,
    loginBarbersMessage,
    setLoginBarberId,
  }
}

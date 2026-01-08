import { useEffect, useState } from 'react'
import { storageService } from '../services/storageService'
import { STORAGE_KEYS } from '../constants/storageKeys'

export function useEmailPreference() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    storageService
      .get<boolean>(STORAGE_KEYS.EMAIL_ENABLED)
      .then(v => v !== null && setEnabled(v))
  }, [])

  const toggle = async () => {
    const value = !enabled
    setEnabled(value)
    await storageService.set(STORAGE_KEYS.EMAIL_ENABLED, value)
  }

  return { enabled, toggle }
}

import { useEffect, useState } from 'react'
import { Category } from '../types/category'
import { storageService } from '../services/storageService'
import { STORAGE_KEYS } from '../constants/storageKeys'
import { v4 as uuid } from 'uuid'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    storageService.get<Category[]>(STORAGE_KEYS.CATEGORIES)
      .then(data => data && setCategories(data))
  }, [])

  const persist = (data: Category[]) => {
    setCategories(data)
    storageService.set(STORAGE_KEYS.CATEGORIES, data)
  }

  const addCategory = (name: string) => {
    persist([...categories, { id: uuid(), name }])
  }

  return { categories, addCategory }
}

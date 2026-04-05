import * as SecureStore from 'expo-secure-store'
import type { StateStorage } from 'zustand/middleware'

export const nativeStorage: StateStorage = {
  getItem: async (name: string) => {
    try {
      return await SecureStore.getItemAsync(name)
    } catch {
      return null
    }
  },
  setItem: async (name: string, value: string) => {
    try {
      await SecureStore.setItemAsync(name, value)
    } catch {
      // Storage unavailable
    }
  },
  removeItem: async (name: string) => {
    try {
      await SecureStore.deleteItemAsync(name)
    } catch {
      // Ignore
    }
  },
}

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { onAuthStateChange, signOutUser, type AuthUser } from '../services/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const isLoading = ref(true)

  // Computed properties
  const isAuthenticated = computed(() => !!user.value)
  const userEmail = computed(() => user.value?.email || '')
  const userDisplayName = computed(() => user.value?.displayName || '')

  // Initialize auth state listener
  const initAuth = () => {
    onAuthStateChange((authUser: AuthUser | null) => {
      user.value = authUser
      isLoading.value = false
    })
  }

  // Sign out
  const signOut = async () => {
    try {
      await signOutUser()
      user.value = null
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    userEmail,
    userDisplayName,
    initAuth,
    signOut
  }
})

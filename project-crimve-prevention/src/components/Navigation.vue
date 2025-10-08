<template>
  <div class="bg-white  ">
    <!-- Top Header Bar -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <!-- Left Side - Application Title and Logo -->
        <div class="flex items-center">
          <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z">
              </path>
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900">Crime Prevention Analytics</h1>
            <p class="text-sm text-gray-600">Lubao Municipality , Province of Pampanga</p>
          </div>
        </div>
        
        <!-- Right Side - System Status and User Actions -->
        <div class="flex items-center space-x-3">
          <!-- System Status -->
          <div class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            System Online
          </div>
          
          <!-- Settings Dropdown -->
          <div class="relative">
            <router-link to="/settings"  class="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">
                </path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Settings

            </router-link>
            
          </div>
          
          <!-- Logout Button -->
          <button @click="showLogoutModal = true" class="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1">
              </path>
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>

    <!-- Main Navigation Tabs -->
    <div class="border-t border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav class="flex space-x-8">
          <router-link
            v-for="item in navigationItems"
            :key="item.name"
            :to="item.href"
            :class="[
              'flex items-center px-3 py-4 text-sm font-medium border-b-2 transition duration-200',
              $route.name === item.routeName
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            ]"
          >
            <!-- Dashboard Icon -->
            <svg v-if="item.name === 'Dashboard'" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"></path>
            </svg>
            <!-- Search Icon -->
            <svg v-else-if="item.name === 'Crime Search'" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <!-- Map Icon -->
            <svg v-else-if="item.name === 'Incident Map'" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <!-- Predictive Icon -->
            <svg v-else-if="item.name === 'Predictive'" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <!-- Prescriptive Icon -->
            <svg v-else-if="item.name === 'Prescriptive'" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {{ item.name }}
          </router-link>
        </nav>
      </div>
    </div>

    <!-- Logout Confirmation Modal -->
    <div v-if="showLogoutModal" class="fixed inset-0 z-50 overflow-y-auto" @click="closeModal">
      <!-- Transparent backdrop -->
      <div class="fixed inset-0 bg-gray-500/20 bg-opacity-50 transition-opacity backdrop-blur-xs"></div>
      
      <!-- Modal content -->
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg" @click.stop>
          <!-- Modal header -->
          <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <!-- Warning icon -->
              <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              
              <!-- Modal content -->
              <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 class="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                  Confirm Logout
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Are you sure you want to logout? You will need to sign in again to access the system.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Modal footer -->
          <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              @click="confirmLogout"
              :disabled="isLoggingOut"
              class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isLoggingOut" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging out...
              </span>
              <span v-else>Logout</span>
            </button>
            <button
              @click="closeModal"
              :disabled="isLoggingOut"
              class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Modal state
const showLogoutModal = ref(false)
const isLoggingOut = ref(false)

// Settings dropdown state
const showSettingsDropdown = ref(false)

// Navigation items
const navigationItems = [
  {
    name: 'Dashboard',
    href: '/analytics',
    routeName: 'analytics'
  },
  {
    name: 'Crime Search',
    href: '/crime-search',
    routeName: 'crime-search'
  },
  {
    name: 'Incident Map',
    href: '/incident-map',
    routeName: 'incident-map'
  },
  {
    name: 'Predictive',
    href: '/predictive',
    routeName: 'predictive'
  },
  {
    name: 'Prescriptive',
    href: '/prescriptive',
    routeName: 'prescriptive'
  }
]

// Modal methods
const closeModal = () => {
  if (!isLoggingOut.value) {
    showLogoutModal.value = false
  }
}

const confirmLogout = async () => {
  isLoggingOut.value = true
  
  try {
    await authStore.signOut()
    showLogoutModal.value = false
    router.push('/signin')
  } catch (error) {
    console.error('Error signing out:', error)
    // You could add a toast notification here for error feedback
  } finally {
    isLoggingOut.value = false
  }
}

// Close dropdown when navigating
const closeDropdown = () => {
  showSettingsDropdown.value = false
}

// Handle escape key to close modal and dropdown
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    if (showLogoutModal.value) {
      closeModal()
    }
    if (showSettingsDropdown.value) {
      showSettingsDropdown.value = false
    }
  }
}

// Handle click outside to close dropdown
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showSettingsDropdown.value = false
  }
}

// Add event listeners
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('click', handleClickOutside)
}

// Watch for modal state changes to manage body scroll
watch(showLogoutModal, (isOpen) => {
  if (typeof document !== 'undefined') {
    if (isOpen) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
  }
})

// Cleanup event listeners and body class on component unmount
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('click', handleClickOutside)
  }
  if (typeof document !== 'undefined') {
    document.body.classList.remove('modal-open')
  }
})
</script>


<style scoped>
/* Modal backdrop animation */
.fixed.inset-0.bg-black.bg-opacity-50 {
  animation: fadeIn 0.2s ease-out;
}

/* Modal content animation */
.relative.transform.overflow-hidden.rounded-lg.bg-white {
  animation: slideIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Prevent body scroll when modal is open */
body.modal-open {
  overflow: hidden;
}

/* Focus styles for accessibility */
button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Smooth transitions for button states */
button {
  transition: all 0.2s ease-in-out;
}

/* Loading spinner animation */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

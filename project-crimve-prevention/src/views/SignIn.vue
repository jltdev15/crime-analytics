<template>
  <div class="min-h-screen bg-blue-50 flex flex-col justify-center">
    <section class="container mx-auto flex border-2 border-blue-500/20 p-32 border-solid rounded-2xl">
      <!-- Left Side - Information Panel -->
      <div class="flex-1 flex flex-col justify-center px-12 py-8">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z">
                </path>
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Crime Prevention Analytics</h1>
              <p class="text-gray-600">Management System</p>
            </div>
          </div>
        </div>

        <!-- Welcome Section -->
        <div class="mb-12">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Welcome to Crime Prevention Portal</h2>
          <p class="text-lg text-gray-600 leading-relaxed">
            Monitor crime statistics and safety metrics for community protection. Analyze incident patterns,
            track response times, and manage safety initiatives efficiently across all districts and neighborhoods.
          </p>
        </div>

        <!-- Key Features -->
        <div class="grid grid-cols-1 gap-6 mb-12">
          <div class="flex items-start">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-1">Incident Mapping</h3>
              <p class="text-gray-600">Real-time incident tracking and geographical analysis</p>
            </div>
          </div>

          <div class="flex items-start">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-1">Response Analytics</h3>
              <p class="text-gray-600">Monitor emergency response times and efficiency</p>
            </div>
          </div>

          <div class="flex items-start">
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z">
                </path>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-1">Risk Assessment</h3>
              <p class="text-gray-600">Advanced analytics for crime prevention strategies</p>
            </div>
          </div>
        </div>

        <!-- Statistics -->
        <div class="grid grid-cols-3 gap-8">
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600 mb-1">1,247</div>
            <div class="text-gray-600">Incidents Tracked</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600 mb-1">85%</div>
            <div class="text-gray-600">Prevention Rate</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-600 mb-1">44</div>
            <div class="text-gray-600">Barangays</div>
          </div>
        </div>
      </div>

      <!-- Right Side - Sign In Form -->
      <div class="w-96 bg-white shadow-xl flex flex-col justify-center px-8 py-12">
        <div class="w-full max-w-sm mx-auto">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Sign In</h2>
          <p class="text-gray-600 mb-8">Enter your credentials to access the analytics portal</p>

          <!-- Error Message -->
          <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {{ errorMessage }}
          </div>

          <!-- Success Message -->
          <div v-if="successMessage" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {{ successMessage }}
          </div>

          <form @submit.prevent="handleSignIn" class="space-y-6">
            <!-- Email Field -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input id="email" v-model="form.email" type="email" placeholder="Enter your email address"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required />
            </div>

            <!-- Password Field -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input id="password" v-model="form.password" type="password" placeholder="Enter your password"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required />
            </div>

            <!-- Remember Me & Forgot Password -->
            <div class="flex items-center justify-between">
              <label class="flex items-center">
                <input v-model="form.rememberMe" type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span class="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <button type="button" @click="handleForgotPassword" 
                class="text-sm text-blue-600 hover:text-blue-500 focus:outline-none">
                Forgot password?
              </button>
            </div>

            <!-- Sign In Button -->
            <button type="submit" :disabled="isLoading"
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
              <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isLoading ? 'Signing In...' : 'Sign In' }}
            </button>

            <!-- Demo Account Link -->
            <div class="text-center">
              <span class="text-gray-500 text-sm">or</span>
              <br />
              <button type="button" @click="handleDemoAccount" 
                class="text-blue-600 hover:text-blue-500 text-sm focus:outline-none">
                Try Demo Account
              </button>
            </div>
          </form>

          <!-- Access Request -->
          <div class="mt-8 text-center">
            <a href="#" class="text-blue-600 hover:text-blue-500 text-sm">Need access? Request Access</a>
          </div>

          <!-- Security Footer -->
          <div class="mt-8 text-center">
            <p class="text-xs text-gray-500">Protected by Crime Prevention IT Security</p>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { signIn, resetPassword, onAuthStateChange, type AuthUser } from '../services/auth'

const router = useRouter()

const form = ref({
  email: '',
  password: '',
  rememberMe: false
})

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Check if user is already authenticated
onMounted(() => {
  onAuthStateChange((user: AuthUser | null) => {
    if (user) {
      // User is already signed in, redirect to dashboard
      router.push('/dashboard')
    }
  })
})

const handleSignIn = async () => {
  if (!form.value.email || !form.value.password) {
    errorMessage.value = 'Please fill in all fields'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await signIn({
      email: form.value.email,
      password: form.value.password
    })
    
    successMessage.value = 'Sign in successful! Redirecting...'
    
    // Redirect to dashboard after successful sign in
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
    
  } catch (error: any) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

const handleForgotPassword = async () => {
  if (!form.value.email) {
    errorMessage.value = 'Please enter your email address first'
    return
  }

  try {
    await resetPassword(form.value.email)
    successMessage.value = 'Password reset email sent! Check your inbox.'
    errorMessage.value = ''
  } catch (error: any) {
    errorMessage.value = error.message
  }
}

const handleDemoAccount = () => {
  // For demo purposes, you can set demo credentials
  form.value.email = 'demo@crimeprevention.com'
  form.value.password = 'demo123'
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>

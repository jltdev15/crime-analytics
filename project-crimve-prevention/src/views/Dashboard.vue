<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Component -->
    <Navigation />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="border-4 border-dashed border-gray-200 rounded-lg p-8">
          <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
            <p class="text-gray-600 mb-6">Welcome to the Crime Prevention Analytics Dashboard</p>
            
            <!-- User Info -->
            <div class="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
              <div class="space-y-2 text-left">
                <p><span class="font-medium">Email:</span> {{ user?.email }}</p>
                <p><span class="font-medium">Display Name:</span> {{ user?.displayName || 'Not set' }}</p>
                <p><span class="font-medium">User ID:</span> {{ user?.uid }}</p>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div class="bg-blue-50 p-4 rounded-lg">
                <h4 class="font-semibold text-blue-900">Incident Reports</h4>
                <p class="text-blue-700 text-sm">View and manage incident reports</p>
              </div>
              <div class="bg-green-50 p-4 rounded-lg">
                <h4 class="font-semibold text-green-900">Analytics</h4>
                <p class="text-green-700 text-sm">Crime statistics and trends</p>
              </div>
              <div class="bg-orange-50 p-4 rounded-lg">
                <h4 class="font-semibold text-orange-900">Settings</h4>
                <p class="text-orange-700 text-sm">Account and system settings</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { onAuthStateChange, type AuthUser } from '../services/auth'
// @ts-ignore
import Navigation from '../components/Navigation.vue'

const router = useRouter()
const user = ref<AuthUser | null>(null)

onMounted(() => {
  onAuthStateChange((authUser: AuthUser | null) => {
    if (authUser) {
      user.value = authUser
    } else {
      // User is not authenticated, redirect to sign in
      router.push('/signin')
    }
  })
})
</script>

<style scoped>
/* Additional custom styles if needed */
</style>

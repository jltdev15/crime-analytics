<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Component -->
    <Navigation />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Incident Map</h1>
          <p class="text-gray-600 mt-2">Interactive map showing crime incidents across San Miguel Municipality</p>
        </div>

        <!-- Map Controls -->
        <div class="bg-white rounded-lg shadow p-4 mb-6">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <!-- Map Controls -->
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-gray-700">Show:</label>
                <div class="flex items-center space-x-2">
                  <input type="checkbox" id="theft" checked class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <label for="theft" class="text-sm text-gray-600">Theft</label>
                </div>
                <div class="flex items-center space-x-2">
                  <input type="checkbox" id="assault" checked class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <label for="assault" class="text-sm text-gray-600">Assault</label>
                </div>
                <div class="flex items-center space-x-2">
                  <input type="checkbox" id="burglary" checked class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <label for="burglary" class="text-sm text-gray-600">Burglary</label>
                </div>
              </div>
            </div>

            <!-- Time Filter -->
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-700">Time Range:</label>
              <select class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Last 24 hours</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 3 months</option>
              </select>
            </div>

            <!-- Map Actions -->
            <div class="flex items-center space-x-2">
              <button class="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                Refresh Map
              </button>
              <button class="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                Export Data
              </button>
            </div>
          </div>
        </div>

        <!-- Map Container -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="h-96 bg-gray-100 flex items-center justify-center">
            <div class="text-center">
              <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <p class="text-gray-500 text-lg font-medium">Interactive Map</p>
              <p class="text-gray-400 text-sm">Map integration placeholder - Connect to Google Maps or similar service</p>
            </div>
          </div>
        </div>

        <!-- Map Legend -->
        <div class="mt-6 bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Map Legend</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="flex items-center">
              <div class="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
              <span class="text-sm text-gray-600">High Risk Areas</span>
            </div>
            <div class="flex items-center">
              <div class="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
              <span class="text-sm text-gray-600">Medium Risk Areas</span>
            </div>
            <div class="flex items-center">
              <div class="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
              <span class="text-sm text-gray-600">Low Risk Areas</span>
            </div>
          </div>
        </div>

        <!-- Statistics Summary -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white rounded-lg shadow p-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-red-600">23</div>
              <div class="text-sm text-gray-600">High Risk Incidents</div>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow p-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-yellow-600">156</div>
              <div class="text-sm text-gray-600">Medium Risk Incidents</div>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow p-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">1,068</div>
              <div class="text-sm text-gray-600">Low Risk Incidents</div>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow p-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">44</div>
              <div class="text-sm text-gray-600">Active Barangays</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { onAuthStateChange } from '../services/auth'
import Navigation from '../components/Navigation.vue'

const router = useRouter()

onMounted(() => {
  onAuthStateChange((user) => {
    if (!user) {
      router.push('/signin')
    }
  })
})
</script>

<style scoped>
/* Additional custom styles if needed */
</style>

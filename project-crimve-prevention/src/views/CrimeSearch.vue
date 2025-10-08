<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Component -->
    <Navigation />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Crime Search</h1>
          <p class="text-gray-600 mt-2">Search and filter crime incidents across Lubao Municipality</p>
        </div>

        <!-- Search and Filter Section -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Search Input -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Search Incidents</label>
              <div class="relative">
                <input 
                  v-model="searchQuery"
                  type="text" 
                  placeholder="Search by location, type, or status..."
                  class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  @keyup.enter="searchCrimes"
                >
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Crime Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Crime Type</label>
              <select 
                v-model="filters.type"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                @change="searchCrimes"
              >
                <option value="">All Types</option>
                <option v-for="type in crimeTypes" :key="type" :value="type">{{ type }}</option>
              </select>
            </div>

            <!-- Status -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select 
                v-model="filters.status"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                @change="searchCrimes"
              >
                <option value="">All Status</option>
                <option v-for="status in crimeStatuses" :key="status" :value="status">{{ status }}</option>
              </select>
            </div>
          </div>

          <!-- Search Button -->
          <div class="mt-4 flex gap-2">
            <button 
              @click="searchCrimes"
              :disabled="loading"
              class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading">Searching...</span>
              <span v-else>Search Incidents</span>
            </button>
            <button 
              @click="clearFilters"
              class="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <!-- Results Section -->
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Search Results</h3>
            <p class="text-sm text-gray-600">
              <span v-if="loading">Loading...</span>
              <span v-else>Found {{ pagination.total }} incidents matching your criteria</span>
            </p>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="px-6 py-8 text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="mt-2 text-gray-600">Loading crimes...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="px-6 py-8 text-center">
            <div class="text-red-600 mb-2">
              <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p class="text-red-600 font-medium">Error loading crimes</p>
            <p class="text-gray-600 text-sm mt-1">{{ error }}</p>
            <button @click="searchCrimes" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Try Again
            </button>
          </div>

          <!-- Results Table -->
          <div v-else-if="crimes.length > 0" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case ID</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="crime in crimes" :key="crime._id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ crime.caseId || crime._id.slice(-8) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(crime.confinementDate) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {{ crime.type }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ crime.barangay }}, {{ crime.municipality }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusClass(crime.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ crime.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button @click="viewCrimeDetails(crime)" class="text-blue-600 hover:text-blue-900">
                      View Details
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- No Results -->
          <div v-else class="px-6 py-8 text-center">
            <div class="text-gray-400 mb-2">
              <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.291A7.962 7.962 0 0012 4c-2.34 0-4.29 1.009-5.824 2.709"></path>
              </svg>
            </div>
            <p class="text-gray-600 font-medium">No crimes found</p>
            <p class="text-gray-500 text-sm mt-1">Try adjusting your search criteria</p>
          </div>

          <!-- Pagination -->
          <div v-if="crimes.length > 0" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div class="text-sm text-gray-700">
              Showing <span class="font-medium">{{ (pagination.page - 1) * pagination.limit + 1 }}</span> 
              to <span class="font-medium">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span> 
              of <span class="font-medium">{{ pagination.total }}</span> results
            </div>
            <div class="flex space-x-2">
              <button 
                @click="changePage(pagination.page - 1)"
                :disabled="pagination.page <= 1"
                class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button 
                v-for="page in visiblePages" 
                :key="page"
                @click="changePage(page)"
                :class="[
                  'px-3 py-1 text-sm rounded-md',
                  page === pagination.page 
                    ? 'bg-blue-600 text-white' 
                    : 'border border-gray-300 hover:bg-gray-50'
                ]"
              >
                {{ page }}
              </button>
              <button 
                @click="changePage(pagination.page + 1)"
                :disabled="pagination.page >= pagination.pages"
                class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { onAuthStateChange } from '../services/auth'
// @ts-ignore
import Navigation from '../components/Navigation.vue'
import axios from 'axios'

// @ts-ignore
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

const router = useRouter()

// Reactive data
const loading = ref(false)
const error = ref('')
const crimes = ref<any[]>([])
const searchQuery = ref('')
const crimeTypes = ref<string[]>([])
const crimeStatuses = ref<string[]>([])

const filters = reactive({
  type: '',
  status: '',
  barangay: '',
  municipality: ''
})

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0
})

// Computed properties
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, pagination.page - 2)
  const end = Math.min(pagination.pages, pagination.page + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Methods
const searchCrimes = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const params: any = {
      page: pagination.page,
      limit: pagination.limit
    }

    // Add search query to appropriate filter
    if (searchQuery.value.trim()) {
      // Try to match against different fields
      const query = searchQuery.value.trim()
      if (query.match(/^[A-Z\s]+$/)) {
        // If it looks like a location (all caps), search in barangay
        params.barangay = query
      } else {
        // Otherwise search in type or status
        params.type = query
      }
    }

    // Add filters
    if (filters.type) params.type = filters.type
    if (filters.status) params.status = filters.status
    if (filters.barangay) params.barangay = filters.barangay
    if (filters.municipality) params.municipality = filters.municipality

    const response = await axios.get(`${API_BASE}/crimes`, { params })
    
    crimes.value = response.data.crimes
    Object.assign(pagination, response.data.pagination)
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to fetch crimes'
    console.error('Error fetching crimes:', err)
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  filters.type = ''
  filters.status = ''
  filters.barangay = ''
  filters.municipality = ''
  pagination.page = 1
  searchCrimes()
}

const changePage = (page: number) => {
  if (page >= 1 && page <= pagination.pages) {
    pagination.page = page
    searchCrimes()
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getStatusClass = (status: string) => {
  const statusLower = status?.toLowerCase() || ''
  if (statusLower.includes('resolved') || statusLower.includes('closed')) {
    return 'bg-green-100 text-green-800'
  } else if (statusLower.includes('pending') || statusLower.includes('investigating')) {
    return 'bg-yellow-100 text-yellow-800'
  } else if (statusLower.includes('open') || statusLower.includes('active')) {
    return 'bg-red-100 text-red-800'
  }
  return 'bg-gray-100 text-gray-800'
}

const viewCrimeDetails = (crime: any) => {
  // TODO: Implement crime details modal or navigation
  console.log('View crime details:', crime)
  alert(`Crime Details:\nType: ${crime.type}\nLocation: ${crime.barangay}, ${crime.municipality}\nDate: ${formatDate(crime.confinementDate)}\nStatus: ${crime.status}`)
}

const loadFilterOptions = async () => {
  try {
    // Load crime types and statuses from the API
    const [typesResponse, statusesResponse] = await Promise.all([
      axios.get(`${API_BASE}/analytics/descriptive/types/distribution`),
      axios.get(`${API_BASE}/crimes?limit=1000`) // Get all crimes to extract unique statuses
    ])
    
    crimeTypes.value = typesResponse.data.map((item: any) => item.type)
    
    // Extract unique statuses from crimes
    const statuses = new Set<string>()
    statusesResponse.data.crimes.forEach((crime: any) => {
      if (crime.status) statuses.add(crime.status)
    })
    crimeStatuses.value = Array.from(statuses).sort()
  } catch (err) {
    console.error('Error loading filter options:', err)
  }
}

onMounted(() => {
  onAuthStateChange((user) => {
    if (!user) {
      router.push('/signin')
    } else {
      // Load initial data and filter options
      loadFilterOptions()
      searchCrimes()
    }
  })
})
</script>

<style scoped>
/* Additional custom styles if needed */
</style>

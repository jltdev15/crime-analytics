<template>
  <div class="min-h-screen bg-gray-50">
    <Navigation />

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0 space-y-6">
        <!-- Page Header -->
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Prescriptive Analytics</h1>
            <p class="text-gray-600 mt-2">AI-driven recommendations and action plans for crime prevention</p>
            <div class="mt-3 flex items-center gap-4">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-sm text-gray-500">Recommendations:</span>
                <span class="text-sm font-medium text-gray-700">{{ totalRecommendations }} Active</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-sm text-gray-500">Last Updated:</span>
                <span class="text-sm font-medium text-gray-700">{{ lastUpdated }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <!-- Total Recommendations -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6">
            <div class="flex items-start justify-between">
              <p class="text-sm font-medium text-gray-600">Total Recommendations</p>
              <span class="text-blue-500">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </span>
            </div>
            <p class="mt-4 text-4xl font-semibold text-gray-900">{{ totalRecommendations }}</p>
            <p class="mt-1 text-sm text-gray-500">Action items</p>
          </div>

          <!-- High Priority -->
          <div class="bg-red-500 rounded-2xl border border-gray-200 p-6">
            <div class="flex items-start justify-between">
              <p class="text-sm font-medium text-white">High Priority</p>
              <span class="text-white">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </span>
            </div>
            <p class="mt-4 text-4xl font-semibold text-white">{{ priorityCounts.high }}</p>
            <p class="mt-1 text-sm text-white">Urgent actions</p>
          </div>

          <!-- Implemented -->
          <div class="bg-green-500 rounded-2xl border border-gray-200 p-6">
            <div class="flex items-start justify-between">
              <p class="text-sm font-medium text-white">Implemented</p>
              <span class="text-white">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </span>
            </div>
            <p class="mt-4 text-4xl font-semibold text-white">{{ statusCounts.implemented }}</p>
            <p class="mt-1 text-sm text-white">Completed</p>
          </div>

          <!-- Success Rate -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6">
            <div class="flex items-start justify-between">
              <p class="text-sm font-medium text-gray-600">Success Rate</p>
              <span class="text-green-500">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </span>
            </div>
            <p class="mt-4 text-4xl font-semibold text-gray-900">{{ successRate }}%</p>
            <p class="mt-1 text-sm text-gray-500">Implementation rate</p>
          </div>
        </div>

        <!-- Filter and Search -->
        <div class="bg-white rounded-2xl border border-gray-200 p-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select v-model="filters.priority" @change="fetchRecommendations" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select v-model="filters.category" @change="fetchRecommendations"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Categories</option>
                <option value="patrol">Patrol</option>
                <option value="community">Community</option>
                <option value="investigation">Investigation</option>
                <option value="prevention">Prevention</option>
                <option value="infrastructure">Infrastructure</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select v-model="filters.status" @change="fetchRecommendations"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="implemented">Implemented</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Barangay</label>
              <input v-model="filters.barangay" @input="fetchRecommendations" type="text" 
                     placeholder="Search barangay..." 
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
        </div>

        <!-- Recommendations List -->
        <div class="bg-white rounded-2xl border border-gray-200 p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Recommendations</h3>
            <button @click="fetchRecommendations" :disabled="loading"
                    class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              <span v-if="loading">Loading...</span>
              <span v-else>Refresh</span>
            </button>
          </div>

          <div class="flex items-center gap-3 mb-4">
            <button @click="generateRecommendations" :disabled="loading"
                    class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50">
              <span v-if="loading">Generating...</span>
              <span v-else>Generate Recommendations</span>
            </button>
            <p class="text-sm text-gray-500">Runs AI on current descriptive data and updates the list below.</p>
          </div>
          <div class="flex items-center justify-between mb-4">
            <div></div>
            <label class="inline-flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" v-model="groupByPrediction" @change="onGroupingChange" class="rounded border-gray-300" />
              Group by Prediction
            </label>
          </div>

          <div v-if="loading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="mt-2 text-gray-600">Loading recommendations...</p>
          </div>

          <div v-else-if="(recommendations || []).length === 0" class="text-center py-8">
            <div class="text-gray-400 mb-2">
              <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.291A7.962 7.962 0 0012 4c-2.34 0-4.29-1.009-5.824 2.709"></path>
              </svg>
            </div>
            <p class="text-gray-600 font-medium">No recommendations found</p>
            <p class="text-gray-500 text-sm mt-1">Try adjusting your filters or generate new recommendations</p>
          </div>

          <div v-else class="space-y-4">
            <template v-if="groupByPrediction">
              <div v-for="group in predictionGroups" :key="group.prediction._id" class="border border-gray-200 rounded-lg p-5">
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <div class="flex items-center gap-2">
                      <h4 class="text-lg font-semibold text-gray-900">{{ group.prediction.barangay }}, {{ group.prediction.municipality }}</h4>
                      <span class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{{ group.prediction.crimeType }}</span>
                      <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="group.prediction.riskLevel === 'High' ? 'bg-red-100 text-red-800' : (group.prediction.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800')">
                        {{ group.prediction.riskLevel }} Risk
                      </span>
                    </div>
                    <div class="text-sm text-gray-500">Probability: {{ Math.round(group.prediction.probability * 100) }}% • Confidence: {{ Math.round(group.prediction.confidence * 100) }}%</div>
                  </div>
                  <div class="text-sm text-gray-500">{{ (group.recommendations || []).length }} recommendation(s)</div>
                </div>

                <div v-if="(group.recommendations || []).length === 0" class="text-sm text-gray-500">No recommendations for this prediction with current filters.</div>

                <div v-else class="space-y-4">
                  <div v-for="rec in (group.recommendations || [])" :key="rec._id" class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-start justify-between mb-3">
                      <div class="flex-1">
                        <div class="flex items-center gap-3 mb-1">
                          <h5 class="text-md font-semibold text-gray-900">{{ rec.title }}</h5>
                          <span :class="getPriorityBadgeClass(rec.priority)" class="px-2 py-1 text-xs font-semibold rounded-full">{{ rec.priority }}</span>
                          <span :class="getStatusBadgeClass(rec.status)" class="px-2 py-1 text-xs font-semibold rounded-full">{{ rec.status }}</span>
                        </div>
                        <p class="text-sm text-gray-700">{{ rec.description }}</p>
                      </div>
                      <div class="ml-4 text-right">
                        <div class="text-xs text-gray-500">Confidence</div>
                        <div class="text-sm font-semibold text-gray-900">{{ Math.round(rec.confidence * 100) }}%</div>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <div class="text-xs font-medium text-gray-700">Category</div>
                        <div class="text-xs text-gray-600 capitalize">{{ rec.category }}</div>
                      </div>
                      <div>
                        <div class="text-xs font-medium text-gray-700">Cost</div>
                        <div class="text-xs text-gray-600">{{ rec.implementationCost }}</div>
                      </div>
                      <div>
                        <div class="text-xs font-medium text-gray-700">Timeframe</div>
                        <div class="text-xs text-gray-600">{{ rec.timeframe }}</div>
                      </div>
                    </div>

                    <div class="mb-3">
                      <div class="text-xs font-medium text-gray-700 mb-0.5">Expected Impact</div>
                      <div class="text-xs text-gray-600">{{ rec.expectedImpact }}</div>
                    </div>

                    <div class="mb-3">
                      <div class="text-xs font-medium text-gray-700 mb-0.5">Rationale</div>
                      <div class="text-xs text-gray-600">{{ rec.rationale }}</div>
                    </div>

                    <div v-if="rec.successMetrics && Array.isArray(rec.successMetrics) && rec.successMetrics.length > 0" class="mb-3">
                      <div class="text-xs font-medium text-gray-700 mb-1">Success Metrics</div>
                      <div class="flex flex-wrap gap-2">
                        <span v-for="metric in rec.successMetrics" :key="metric" class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{{ metric }}</span>
                      </div>
                    </div>

                    <div class="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div class="text-xs text-gray-500">Created: {{ formatDate(rec.createdAt) }}</div>
                      <div class="flex gap-2">
                        <button v-if="rec.status === 'pending'" @click="updateStatus(rec._id, 'approved')" class="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">Approve</button>
                        <button v-if="rec.status === 'approved'" @click="updateStatus(rec._id, 'implemented')" class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">Mark Implemented</button>
                        <button @click="viewDetails(rec)" class="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700">View Details</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <!-- original flat list preserved above -->
            </template>
          </div>

          <!-- Pagination -->
          <div v-if="(recommendations || []).length > 0" class="mt-6 flex items-center justify-between">
            <div class="text-sm text-gray-700">
              Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to 
              {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of 
              {{ pagination.total }} results
            </div>
            <div class="flex space-x-2">
              <button @click="changePage(pagination.page - 1)" :disabled="pagination.page <= 1"
                      class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
                Previous
              </button>
              <button @click="changePage(pagination.page + 1)" :disabled="pagination.page >= pagination.pages"
                      class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
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
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
// @ts-ignore
import Navigation from '../components/Navigation.vue'
import { onAuthStateChange } from '../services/auth'
import axios from 'axios';
// @ts-ignore
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

const router = useRouter()

// Reactive data
const loading = ref(false)
const recommendations = ref<any[]>([])
const totalRecommendations = ref(0)
const lastUpdated = ref('')

const priorityCounts = reactive({
  high: 0,
  medium: 0,
  low: 0,
  critical: 0
})

const statusCounts = reactive({
  pending: 0,
  approved: 0,
  implemented: 0,
  rejected: 0
})

const successRate = ref(0)

const filters = reactive({
  priority: '',
  category: '',
  status: '',
  barangay: ''
})

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0
})

// Grouping state
const groupByPrediction = ref(true)
const predictionGroups = ref<any[]>([])

// Methods
const fetchRecommendations = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      limit: pagination.limit
    }

    if (filters.priority) params.priority = filters.priority
    if (filters.category) params.category = filters.category
    if (filters.status) params.status = filters.status
    if (filters.barangay) params.barangay = filters.barangay

    if (!groupByPrediction.value) {
      const response = await axios.get(`${API_BASE}/predict/recommendations`, { params })
      recommendations.value = response.data.recommendations || []
      predictionGroups.value = []
      Object.assign(pagination, response.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 })
      totalRecommendations.value = response.data.pagination?.total || 0
      calculateCounts()
      lastUpdated.value = new Date().toLocaleDateString()
    } else {
      // Grouped by prediction: use optimized endpoint that returns predictions with recommendations
      const params: any = { page: pagination.page, limit: pagination.limit }
      if (filters.barangay) params.barangay = filters.barangay
      if (filters.category) params.category = filters.category
      if (filters.priority) params.priority = filters.priority
      if (filters.status) params.status = filters.status

      const response = await axios.get(`${API_BASE}/predict/predictions-with-recommendations`, { params })
      
      predictionGroups.value = response.data.predictions || []
      recommendations.value = predictionGroups.value.reduce((acc, curr) => {
        return acc.concat(curr.recommendations || []);
      }, []) || [];

      // Derive totals and pagination
      totalRecommendations.value = recommendations.value.length
      Object.assign(pagination, response.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 })
      calculateCounts()
      lastUpdated.value = new Date().toLocaleDateString()
    }
  } catch (error) {
    console.error('Error fetching recommendations:', error)
  } finally {
    loading.value = false
  }
}

const calculateCounts = () => {
  // Reset counts
  Object.keys(priorityCounts).forEach(key => priorityCounts[key as keyof typeof priorityCounts] = 0)
  Object.keys(statusCounts).forEach(key => statusCounts[key as keyof typeof statusCounts] = 0)
  
  // Ensure recommendations.value is an array before iterating
  const recs = recommendations.value || []
  recs.forEach(rec => {
    // Skip if rec is undefined or null
    if (!rec) return
    
    // Priority counts
    if (rec.priority && rec.priority in priorityCounts) {
      priorityCounts[rec.priority as keyof typeof priorityCounts]++
    }
    
    // Status counts
    if (rec.status && rec.status in statusCounts) {
      statusCounts[rec.status as keyof typeof statusCounts]++
    }
  })
  
  // Calculate success rate
  const total = statusCounts.pending + statusCounts.approved + statusCounts.implemented + statusCounts.rejected
  successRate.value = total > 0 ? Math.round((statusCounts.implemented / total) * 100) : 0
}

const changePage = (page: number) => {
  if (page >= 1 && page <= pagination.pages) {
    pagination.page = page
    fetchRecommendations()
  }
}

const onGroupingChange = () => {
  pagination.page = 1
  fetchRecommendations()
}

const generateRecommendations = async () => {
  loading.value = true
  try {
    await axios.post(`${API_BASE}/predict/generate/recommendations`)
    await fetchRecommendations()
  } catch (error) {
    console.error('Error generating recommendations:', error)
  } finally {
    loading.value = false
  }
}

const updateStatus = async (id: string, status: string) => {
  try {
    await axios.put(`${API_BASE}/predict/recommendations/${id}`, { status })
    await fetchRecommendations()
  } catch (error) {
    console.error('Error updating status:', error)
  }
}

const viewDetails = (recommendation: any) => {
  // TODO: Implement detailed view modal
  alert(`Recommendation Details:\n\nTitle: ${recommendation.title}\nDescription: ${recommendation.description}\nRationale: ${recommendation.rationale}\nExpected Impact: ${recommendation.expectedImpact}`)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getPriorityBadgeClass = (priority: string) => {
  switch (priority) {
    case 'Critical':
      return 'bg-red-100 text-red-800'
    case 'High':
      return 'bg-orange-100 text-orange-800'
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'Low':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'implemented':
      return 'bg-green-100 text-green-800'
    case 'approved':
      return 'bg-blue-100 text-blue-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

onMounted(async () => {
  onAuthStateChange((user) => {
    if (!user) router.push('/signin')
  })
  
  // Set page title
  document.title = 'Prescriptive Analytics - Crime Prevention System'
  
  await fetchRecommendations()
})
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
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
            <p class="mt-1 text-sm text-gray-500">Total recommendations</p>
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

          <div class="flex items-center gap-3 mb-4 flex-wrap">
            <button @click="generateRecommendations" :disabled="loading"
                    class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              <span v-if="loading">Generating...</span>
              <span v-else>Generate Recommendations</span>
            </button>
            <button @click="generatePDFReport" :disabled="loading || recommendations.length === 0"
                    class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Generate Report
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
                  <div v-for="rec in (group.recommendations || [])" :key="rec._id" class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div class="flex items-start justify-between mb-3">
                      <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2 flex-wrap">
                          <h5 class="text-md font-semibold text-gray-900">{{ rec.title }}</h5>
                          <span :class="getPriorityBadgeClass(rec.priority)" class="px-2 py-1 text-xs font-semibold rounded-full">{{ rec.priority }}</span>
                          <span :class="getStatusBadgeClass(rec.status)" class="px-2 py-1 text-xs font-semibold rounded-full capitalize">{{ rec.status }}</span>
                          <span class="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 capitalize">{{ rec.category }}</span>
                        </div>
                        <p class="text-sm text-gray-700 mb-2">{{ rec.description }}</p>
                        <div class="bg-blue-50 border-l-4 border-blue-400 p-2 mb-2">
                          <p class="text-xs font-medium text-blue-800 mb-1">Rationale:</p>
                          <p class="text-xs text-blue-700">{{ rec.rationale }}</p>
                        </div>
                      </div>
                      <div class="ml-4 text-right">
                        <div class="text-xs text-gray-500 mb-1">Confidence</div>
                        <div class="text-sm font-semibold text-gray-900">{{ Math.round(rec.confidence * 100) }}%</div>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div class="bg-gray-50 rounded-lg p-2">
                        <div class="text-xs font-medium text-gray-700 mb-1">Implementation Cost</div>
                        <div class="text-xs font-semibold" :class="getCostClass(rec.implementationCost)">{{ rec.implementationCost }}</div>
                      </div>
                      <div class="bg-gray-50 rounded-lg p-2">
                        <div class="text-xs font-medium text-gray-700 mb-1">Timeframe</div>
                        <div class="text-xs font-semibold text-gray-900">{{ rec.timeframe }}</div>
                      </div>
                      <div class="bg-gray-50 rounded-lg p-2">
                        <div class="text-xs font-medium text-gray-700 mb-1">Category</div>
                        <div class="text-xs font-semibold text-gray-900 capitalize">{{ rec.category }}</div>
                      </div>
                    </div>

                    <div class="mb-3 bg-green-50 border-l-4 border-green-400 p-2">
                      <div class="text-xs font-medium text-green-800 mb-1">Expected Impact</div>
                      <div class="text-xs text-green-700">{{ rec.expectedImpact }}</div>
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
                        <button v-if="rec.status === 'pending' || rec.status === 'approved'" @click="updateStatus(rec._id, 'implemented')" class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">Mark as Implemented</button>
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

    <!-- Recommendation Details Modal -->
    <div v-if="selectedRecommendation" 
         @click.self="closeModal"
         @keydown.esc="closeModal"
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div @click.stop class="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <!-- Modal Header -->
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-gray-900">Recommendation Details</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Modal Content -->
          <div class="space-y-6">
            <!-- Title and Status -->
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h4 class="text-xl font-semibold text-gray-900 mb-2">{{ selectedRecommendation.title }}</h4>
                <div class="flex items-center gap-3">
                  <span :class="getPriorityBadgeClass(selectedRecommendation.priority)" 
                        class="px-3 py-1 text-sm font-semibold rounded-full">
                    {{ selectedRecommendation.priority }}
                  </span>
                  <span :class="getStatusBadgeClass(selectedRecommendation.status)" 
                        class="px-3 py-1 text-sm font-semibold rounded-full">
                    {{ selectedRecommendation.status }}
                  </span>
                  <span class="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                    {{ Math.round(selectedRecommendation.confidence * 100) }}% Confidence
                  </span>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div>
              <h5 class="text-lg font-semibold text-gray-900 mb-2">Description</h5>
              <p class="text-gray-700 leading-relaxed">{{ selectedRecommendation.description }}</p>
            </div>

            <!-- Key Information Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 class="text-lg font-semibold text-gray-900 mb-3">Implementation Details</h5>
                <div class="space-y-3">
                  <div>
                    <span class="text-sm font-medium text-gray-700">Category:</span>
                    <span class="ml-2 text-sm text-gray-600 capitalize">{{ selectedRecommendation.category }}</span>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-700">Cost:</span>
                    <span class="ml-2 text-sm text-gray-600">{{ selectedRecommendation.implementationCost }}</span>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-700">Timeframe:</span>
                    <span class="ml-2 text-sm text-gray-600">{{ selectedRecommendation.timeframe }}</span>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-700">Created:</span>
                    <span class="ml-2 text-sm text-gray-600">{{ formatDate(selectedRecommendation.createdAt) }}</span>
                  </div>
                </div>
              </div>

              <div>
                <h5 class="text-lg font-semibold text-gray-900 mb-3">Impact & Rationale</h5>
                <div class="space-y-3">
                  <div>
                    <span class="text-sm font-medium text-gray-700">Expected Impact:</span>
                    <p class="text-sm text-gray-600 mt-1">{{ selectedRecommendation.expectedImpact }}</p>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-700">Rationale:</span>
                    <p class="text-sm text-gray-600 mt-1">{{ selectedRecommendation.rationale }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Success Metrics -->
            <div v-if="selectedRecommendation.successMetrics && Array.isArray(selectedRecommendation.successMetrics) && selectedRecommendation.successMetrics.length > 0">
              <h5 class="text-lg font-semibold text-gray-900 mb-3">Success Metrics</h5>
              <div class="flex flex-wrap gap-2">
                <span v-for="metric in selectedRecommendation.successMetrics" :key="metric" 
                      class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {{ metric }}
                </span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-between pt-6 border-t border-gray-200">
              <div class="text-sm text-gray-500">
                Last updated: {{ formatDate(selectedRecommendation.updatedAt || selectedRecommendation.createdAt) }}
              </div>
              <div class="flex gap-3">
                <button v-if="selectedRecommendation.status === 'pending' || selectedRecommendation.status === 'approved'" 
                        @click="updateStatus(selectedRecommendation._id, 'implemented')" 
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Mark as Implemented
                </button>
                <button @click="closeModal" 
                        class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
const selectedRecommendation = ref<any>(null)

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

      // Get total recommendation count from a separate call
      try {
        const totalResponse = await axios.get(`${API_BASE}/predict/recommendations`, { 
          params: { page: 1, limit: 1 } // Just get the total count
        })
        totalRecommendations.value = totalResponse.data.pagination?.total || 0
      } catch (error) {
        console.error('Error getting total recommendations count:', error)
        totalRecommendations.value = recommendations.value.length
      }
      
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
    // Close modal after successful update
    closeModal()
  } catch (error) {
    console.error('Error updating status:', error)
  }
}

const viewDetails = (recommendation: any) => {
  selectedRecommendation.value = recommendation
}

const closeModal = () => {
  selectedRecommendation.value = null
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

const getCostClass = (cost: string) => {
  switch (cost) {
    case 'Low':
      return 'text-green-600'
    case 'Medium':
      return 'text-yellow-600'
    case 'High':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

const generatePDFReport = () => {
  try {
    // Get all recommendations (flatten if grouped)
    const allRecommendations = groupByPrediction.value
      ? predictionGroups.value.reduce((acc: any[], group: any) => {
          const recs = (group.recommendations || []).map((rec: any) => ({
            ...rec,
            barangay: group.prediction.barangay,
            municipality: group.prediction.municipality,
            crimeType: group.prediction.crimeType,
            riskLevel: group.prediction.riskLevel,
            probability: group.prediction.probability,
            confidence: group.prediction.confidence
          }))
          return acc.concat(recs)
        }, [])
      : recommendations.value

    // Filter by current filters
    let filteredRecs = allRecommendations.filter((rec: any) => {
      if (filters.priority && rec.priority !== filters.priority) return false
      if (filters.category && rec.category !== filters.category) return false
      if (filters.status && rec.status !== filters.status) return false
      if (filters.barangay && !rec.barangay?.toLowerCase().includes(filters.barangay.toLowerCase())) return false
      return true
    })

    // Calculate additional statistics
    const categoryBreakdown: Record<string, number> = {}
    const barangayBreakdown: Record<string, number> = {}
    const costBreakdown: Record<string, number> = {}
    let totalConfidence = 0
    let avgConfidence = 0

    filteredRecs.forEach((rec: any) => {
      // Category breakdown
      const cat = rec.category || 'Other'
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1
      
      // Barangay breakdown
      const brgy = rec.barangay || 'Unknown'
      barangayBreakdown[brgy] = (barangayBreakdown[brgy] || 0) + 1
      
      // Cost breakdown
      const cost = rec.implementationCost || 'Unknown'
      costBreakdown[cost] = (costBreakdown[cost] || 0) + 1
      
      // Average confidence
      if (rec.confidence) {
        totalConfidence += rec.confidence
      }
    })

    avgConfidence = filteredRecs.length > 0 ? Math.round((totalConfidence / filteredRecs.length) * 100) : 0

    // Get top barangays
    const topBarangays = Object.entries(barangayBreakdown)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    // Create print window
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Please allow popups to generate PDF report')
      return
    }

    // Generate HTML content with compact monochrome styling
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Prescriptive Analytics Report - ${new Date().toLocaleDateString()}</title>
  <style>
    @media print {
      @page { 
        margin: 0.5cm;
        size: legal;
      }
      body { margin: 0; }
      .page-break { page-break-before: always; }
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      padding: 0;
      margin: 0;
      color: #000000;
      line-height: 1.4;
      background: #ffffff;
      font-size: 11px;
    }
    .report-container {
      max-width: 216mm;
      margin: 0 auto;
      padding: 10mm;
      background: white;
    }
    .header {
      background: #000000;
      color: #ffffff;
      padding: 15px 20px;
      margin: -10mm -10mm 15px -10mm;
      border-bottom: 2px solid #000000;
    }
    .header h1 {
      margin: 0 0 5px 0;
      font-size: 20px;
      font-weight: 700;
    }
    .header-subtitle {
      font-size: 11px;
      margin: 3px 0;
      color: #cccccc;
    }
    .header-meta {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #666666;
      font-size: 10px;
    }
    .executive-summary {
      background: #f5f5f5;
      padding: 15px;
      margin-bottom: 20px;
      border: 1px solid #cccccc;
    }
    .executive-summary h2 {
      color: #000000;
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 700;
      border-bottom: 2px solid #000000;
      padding-bottom: 5px;
    }
    .stats-section {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-top: 12px;
    }
    .stat-box {
      background: white;
      padding: 10px;
      border: 1px solid #cccccc;
    }
    .stat-box h3 {
      margin: 0 0 8px 0;
      font-size: 10px;
      color: #000000;
      text-transform: uppercase;
      font-weight: 700;
      border-bottom: 1px solid #000000;
      padding-bottom: 3px;
    }
    .stat-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .stat-list li {
      padding: 4px 0;
      border-bottom: 1px solid #e5e5e5;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
    }
    .stat-list li:last-child {
      border-bottom: none;
    }
    .stat-label {
      color: #666666;
    }
    .stat-value {
      font-weight: 700;
      color: #000000;
    }
    .section-header {
      margin: 20px 0 12px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #000000;
    }
    .section-header h2 {
      margin: 0;
      font-size: 14px;
      color: #000000;
      font-weight: 700;
    }
    .recommendation {
      page-break-inside: avoid;
      background: white;
      border: 1px solid #cccccc;
      padding: 12px;
      margin-bottom: 15px;
      position: relative;
    }
    .recommendation::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: #000000;
    }
    .recommendation-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #cccccc;
    }
    .recommendation-title {
      font-size: 12px;
      font-weight: 700;
      color: #000000;
      margin-bottom: 6px;
      line-height: 1.3;
    }
    .recommendation-number {
      display: inline-block;
      background: #000000;
      color: white;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      text-align: center;
      line-height: 20px;
      font-weight: 700;
      font-size: 10px;
      margin-right: 6px;
      vertical-align: middle;
    }
    .badge-container {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 6px;
      align-items: center;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border: 1px solid #666666;
      font-size: 9px;
      font-weight: 600;
      text-transform: uppercase;
      background: #f5f5f5;
      color: #000000;
    }
    .confidence-badge {
      text-align: center;
      padding: 8px;
      background: #f5f5f5;
      border: 1px solid #cccccc;
      min-width: 60px;
    }
    .confidence-value {
      font-size: 16px;
      font-weight: 700;
      color: #000000;
      line-height: 1;
    }
    .confidence-label {
      font-size: 8px;
      color: #666666;
      text-transform: uppercase;
      margin-top: 3px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin: 10px 0;
    }
    .info-item {
      background: #f5f5f5;
      padding: 8px;
      border: 1px solid #cccccc;
    }
    .info-label {
      font-size: 8px;
      color: #666666;
      text-transform: uppercase;
      margin-bottom: 4px;
      font-weight: 600;
    }
    .info-value {
      font-size: 11px;
      font-weight: 700;
      color: #000000;
    }
    .section {
      margin: 10px 0;
    }
    .section-title {
      font-size: 10px;
      font-weight: 700;
      color: #000000;
      margin-bottom: 6px;
      text-transform: uppercase;
      border-bottom: 1px solid #cccccc;
      padding-bottom: 3px;
    }
    .section-content {
      font-size: 10px;
      color: #333333;
      line-height: 1.5;
      background: #f9f9f9;
      padding: 8px;
      border-left: 2px solid #666666;
    }
    .metrics {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 6px;
    }
    .metric-tag {
      background: #f5f5f5;
      color: #000000;
      padding: 4px 8px;
      border: 1px solid #cccccc;
      font-size: 9px;
      font-weight: 600;
    }
    .risk-factors {
      background: #f5f5f5;
      border-left: 2px solid #666666;
      padding: 8px;
    }
    .risk-factors .section-content {
      background: transparent;
      border: none;
      padding: 0;
      color: #000000;
    }
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 2px solid #000000;
      text-align: center;
      color: #666666;
      font-size: 9px;
    }
    .footer-logo {
      font-size: 11px;
      font-weight: 700;
      color: #000000;
      margin-bottom: 5px;
    }
    .analysis-section {
      background: #f5f5f5;
      padding: 12px;
      margin: 15px 0;
      border: 1px solid #cccccc;
    }
    .analysis-section h3 {
      margin: 0 0 10px 0;
      color: #000000;
      font-size: 11px;
      font-weight: 700;
      border-bottom: 1px solid #000000;
      padding-bottom: 3px;
    }
    .analysis-section h4 {
      margin: 0 0 6px 0;
      color: #000000;
      font-size: 10px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="header">
      <h1>Prescriptive Analytics Report</h1>
      <div class="header-subtitle">Crime Prevention Recommendations & Strategic Action Plans</div>
      <div class="header-subtitle">AI-Powered Analysis & Recommendations System</div>
      <div class="header-meta">
        <div><strong>Report Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <div><strong>Generated:</strong> ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    </div>

    <div class="executive-summary">
      <h2>Executive Summary</h2>
      <div class="stats-section">
        <div class="stat-box">
          <h3>Priority Distribution</h3>
          <ul class="stat-list">
            <li><span class="stat-label">Critical:</span> <span class="stat-value">${priorityCounts.critical}</span></li>
            <li><span class="stat-label">High:</span> <span class="stat-value">${priorityCounts.high}</span></li>
            <li><span class="stat-label">Medium:</span> <span class="stat-value">${priorityCounts.medium}</span></li>
            <li><span class="stat-label">Low:</span> <span class="stat-value">${priorityCounts.low}</span></li>
          </ul>
        </div>
        <div class="stat-box">
          <h3>Status Distribution</h3>
          <ul class="stat-list">
            <li><span class="stat-label">Pending:</span> <span class="stat-value">${statusCounts.pending}</span></li>
            <li><span class="stat-label">Approved:</span> <span class="stat-value">${statusCounts.approved}</span></li>
            <li><span class="stat-label">Implemented:</span> <span class="stat-value">${statusCounts.implemented}</span></li>
            <li><span class="stat-label">Rejected:</span> <span class="stat-value">${statusCounts.rejected}</span></li>
          </ul>
        </div>
      </div>

      <div class="analysis-section">
        <h3>Key Insights</h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 10px;">
          <div>
            <h4>Category Breakdown</h4>
            <ul class="stat-list">
              ${Object.entries(categoryBreakdown).map(([cat, count]) => `
                <li><span class="stat-label">${cat.charAt(0).toUpperCase() + cat.slice(1)}:</span> <span class="stat-value">${count}</span></li>
              `).join('')}
            </ul>
          </div>
          <div>
            <h4>Implementation Cost Distribution</h4>
            <ul class="stat-list">
              ${Object.entries(costBreakdown).map(([cost, count]) => `
                <li><span class="stat-label">${cost}:</span> <span class="stat-value">${count}</span></li>
              `).join('')}
            </ul>
          </div>
        </div>
        ${topBarangays.length > 0 ? `
          <div style="margin-top: 12px;">
            <h4>Top Barangays by Recommendations</h4>
            <ul class="stat-list">
              ${topBarangays.map(brgy => `
                <li><span class="stat-label">${brgy.name}:</span> <span class="stat-value">${brgy.count} recommendation(s)</span></li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
        <div style="margin-top: 12px; padding: 8px; background: white; border: 1px solid #cccccc; border-left: 3px solid #000000;">
          <strong>Average Confidence Level:</strong> 
          <span style="font-size: 14px; font-weight: 700; margin-left: 8px;">${avgConfidence}%</span>
        </div>
      </div>
    </div>

    <div class="section-header">
      <h2>Detailed Recommendations</h2>
    </div>
  
    ${filteredRecs.map((rec: any, index: number) => `
      <div class="recommendation">
        <div class="recommendation-header">
          <div style="flex: 1;">
            <div class="recommendation-title">
              <span class="recommendation-number">${index + 1}</span>
              ${rec.title || 'Untitled Recommendation'}
            </div>
            <div class="badge-container">
              <span class="badge">${rec.priority || 'Medium'} Priority</span>
              <span class="badge">${(rec.status || 'pending').charAt(0).toUpperCase() + (rec.status || 'pending').slice(1)}</span>
              <span class="badge">${(rec.category || '').charAt(0).toUpperCase() + (rec.category || '').slice(1)}</span>
              ${rec.barangay ? `<span class="badge">${rec.barangay}, ${rec.municipality}</span>` : ''}
              ${rec.riskLevel ? `<span class="badge">${rec.riskLevel} Risk</span>` : ''}
            </div>
          </div>
          <div class="confidence-badge">
            <div class="confidence-value">${rec.confidence ? Math.round(rec.confidence * 100) : 0}%</div>
            <div class="confidence-label">Confidence</div>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Implementation Cost</div>
            <div class="info-value">${rec.implementationCost || 'N/A'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Timeframe</div>
            <div class="info-value">${rec.timeframe || 'N/A'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Crime Type</div>
            <div class="info-value">${rec.crimeType || 'N/A'}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Description</div>
          <div class="section-content">${rec.description || 'No description provided.'}</div>
        </div>

        <div class="section">
          <div class="section-title">Rationale & Analysis</div>
          <div class="section-content">${rec.rationale || 'No rationale provided.'}</div>
        </div>

        <div class="section">
          <div class="section-title">Expected Impact</div>
          <div class="section-content">${rec.expectedImpact || 'No impact assessment provided.'}</div>
        </div>

        ${rec.successMetrics && rec.successMetrics.length > 0 ? `
          <div class="section">
            <div class="section-title">Success Metrics & KPIs</div>
            <div class="metrics">
              ${rec.successMetrics.map((metric: string) => `<span class="metric-tag">${metric}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        ${rec.riskFactors && rec.riskFactors.length > 0 ? `
          <div class="section">
            <div class="section-title">Risk Factors & Considerations</div>
            <div class="risk-factors">
              <div class="section-content">
                ${rec.riskFactors.map((factor: string) => factor).join(', ')}
              </div>
            </div>
          </div>
        ` : ''}

        ${rec.createdAt ? `
          <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #cccccc; display: flex; justify-content: space-between; font-size: 9px; color: #666666;">
            <span><strong>Created:</strong> ${formatDate(rec.createdAt)}</span>
            ${rec.updatedAt && rec.updatedAt !== rec.createdAt ? `<span><strong>Last Updated:</strong> ${formatDate(rec.updatedAt)}</span>` : ''}
          </div>
        ` : ''}
      </div>
    `).join('')}

    <div class="footer">
      <div class="footer-logo">Crime Prevention Analytics System</div>
      <p>This report was generated by the AI-Powered Crime Prevention Analytics System</p>
      <p><strong>Report Period:</strong> ${new Date().toLocaleDateString()} | <strong>Total Recommendations Analyzed:</strong> ${filteredRecs.length}</p>
      <p style="margin-top: 8px; font-size: 9px;">For questions or additional information, please contact the system administrator.</p>
    </div>
  </div>
</body>
</html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()

    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print()
    }, 250)
  } catch (error) {
    console.error('Error generating PDF report:', error)
    alert('Failed to generate PDF report. Please try again.')
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

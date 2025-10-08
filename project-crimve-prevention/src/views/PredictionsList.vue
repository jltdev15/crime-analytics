<template>
  <div class="min-h-screen bg-gray-50">
    <Navigation />
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-2xl font-bold text-gray-900">All Predictions</h1>
          <div class="flex gap-2">
            <input v-model="query" type="text" placeholder="Search barangay or crime type..." 
                   class="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button @click="fetchPredictions" class="bg-blue-600 text-white px-3 py-2 rounded-md text-sm">Search</button>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barangay</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crime Type</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probability</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="p in predictions" :key="p._id">
                <td class="px-4 py-3 text-sm text-gray-900">{{ p.barangay }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ p.crimeType }}</td>
                <td class="px-4 py-3 text-sm">
                  <span :class="getRiskBadgeClass(p.riskLevel)" class="px-2 py-1 rounded-full text-xs font-semibold">{{ p.riskLevel }}</span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ Math.round(p.probability * 100) }}%</td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ Math.round(p.confidence * 100) }}%</td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ p.forecast && p.forecast[0]?.method === 'neural-network' ? 'Neural Network' : 'Statistical' }}</td>
              </tr>
              <tr v-if="predictions.length === 0">
                <td colspan="6" class="px-4 py-6 text-center text-gray-500 text-sm">No predictions found</td>
              </tr>
            </tbody>
          </table>

          <div class="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <button :disabled="page <= 1" @click="prevPage" class="px-3 py-1 rounded-md border text-sm disabled:opacity-50">Previous</button>
            <div class="text-sm text-gray-600">Page {{ page }} of {{ pages }}</div>
            <button :disabled="page >= pages" @click="nextPage" class="px-3 py-1 rounded-md border text-sm disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </main>
  </div>
  
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
// @ts-ignore
import Navigation from '../components/Navigation.vue'
// @ts-ignore
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api'

const predictions = ref<any[]>([])
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const query = ref('')

const pages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)))

const getRiskBadgeClass = (riskLevel: string) => {
  switch (riskLevel) {
    case 'High': return 'bg-red-100 text-red-800'
    case 'Medium': return 'bg-yellow-100 text-yellow-800'
    case 'Low': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const fetchPredictions = async () => {
  const params: any = { page: page.value, limit: limit.value }
  if (query.value) params.barangay = query.value
  try {
    const { data } = await axios.get(`${API_BASE}/predict/predictions`, { params })
    predictions.value = data.predictions || []
    total.value = data.pagination?.total || 0
  } catch (e) {
    predictions.value = []
    total.value = 0
  }
}

const nextPage = async () => { if (page.value < pages.value) { page.value++; await fetchPredictions() } }
const prevPage = async () => { if (page.value > 1) { page.value--; await fetchPredictions() } }

onMounted(fetchPredictions)
</script>

<style scoped>
</style>



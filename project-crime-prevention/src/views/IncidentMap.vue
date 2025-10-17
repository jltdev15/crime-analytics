<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Component -->
    <Navigation />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Global Error State -->
        <div v-if="error && !loading" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div class="flex-1">
              <h3 class="text-sm font-medium text-red-800">Failed to load map data</h3>
              <p class="text-sm text-red-700 mt-1">{{ error }}</p>
            </div>
            <button @click="fetchMapData" class="ml-4 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors">
              Retry
            </button>
          </div>
        </div>

        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Incident Map</h1>
          <p class="text-gray-600 mt-2">Interactive map showing crime incidents across Lubao Municipality</p>
        </div>

        <!-- Map Controls -->
        <div class="bg-white rounded-lg shadow p-4 mb-6">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <!-- Map Actions -->
            <div class="flex items-center space-x-2">
              <button 
                @click="refreshMap" 
                :disabled="loading"
                class="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {{ loading ? 'Loading...' : 'Refresh Map' }}
              </button>
            </div>

            <!-- Statistics -->
            <div v-if="loading" class="flex items-center space-x-4 text-sm text-gray-600">
              <div class="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div class="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div class="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div class="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div v-else-if="error" class="flex items-center space-x-4 text-sm text-red-600">
              <span>Failed to load statistics</span>
            </div>
            <div v-else class="flex items-center space-x-4 text-sm text-gray-600">
              <span>Total Barangays: {{ mapData.length }}</span>
              <span>High Risk: {{ highRiskCount }}</span>
              <span>Medium Risk: {{ mediumRiskCount }}</span>
              <span>Low Risk: {{ lowRiskCount }}</span>
            </div>
          </div>
        </div>

        <!-- Map Container -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <!-- Loading State -->
          <div v-if="loading" class="h-96 w-full flex items-center justify-center bg-gray-100">
            <div class="text-center">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p class="text-gray-600">Loading map data...</p>
            </div>
          </div>
          
          <!-- Error State -->
          <div v-else-if="error" class="h-96 w-full flex items-center justify-center bg-red-50">
            <div class="text-center">
              <svg class="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-red-600 mb-2">Failed to load map</p>
              <p class="text-sm text-red-500 mb-4">{{ error }}</p>
              <button @click="fetchMapData" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Retry
              </button>
            </div>
          </div>
          
          <!-- Empty Data State -->
          <div v-else-if="!mapData || mapData.length === 0" class="h-96 w-full flex items-center justify-center bg-gray-50">
            <div class="text-center">
              <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
              </svg>
              <p class="text-gray-600 mb-2">No map data available</p>
              <p class="text-sm text-gray-500">No barangay data found for mapping</p>
            </div>
          </div>
          
          <!-- Map Display -->
          <div v-else id="map" class="h-96 w-full"></div>
        </div>

        <!-- Map Legend -->
        <div class="mt-6 bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Map Legend</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="flex items-center">
              <div class="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
              <span class="text-sm text-gray-600">High Risk Areas (Crime Rate > 10 per 1000)</span>
            </div>
            <div class="flex items-center">
              <div class="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
              <span class="text-sm text-gray-600">Medium Risk Areas (5-10 per 1000)</span>
            </div>
            <div class="flex items-center">
              <div class="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
              <span class="text-sm text-gray-600">Low Risk Areas (< 5 per 1000)</span>
            </div>
          </div>
        </div>

        <!-- Statistics Summary -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Loading State -->
          <template v-if="loading">
            <div v-for="i in 4" :key="i" class="bg-white rounded-lg shadow p-4">
              <div class="text-center">
                <div class="h-8 w-12 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
                <div class="h-4 w-24 bg-gray-200 rounded animate-pulse mx-auto"></div>
              </div>
            </div>
          </template>
          
          <!-- Error State -->
          <template v-else-if="error">
            <div class="bg-white rounded-lg shadow p-4 md:col-span-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-red-600">Error</div>
                <div class="text-sm text-gray-600">Failed to load statistics</div>
              </div>
            </div>
          </template>
          
          <!-- Empty Data State -->
          <template v-else-if="!mapData || mapData.length === 0">
            <div class="bg-white rounded-lg shadow p-4 md:col-span-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-gray-400">0</div>
                <div class="text-sm text-gray-600">No data available</div>
              </div>
            </div>
          </template>
          
          <!-- Data State -->
          <template v-else>
            <div class="bg-white rounded-lg shadow p-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-red-600">{{ highRiskCount }}</div>
                <div class="text-sm text-gray-600">High Risk Barangays</div>
              </div>
            </div>
            <div class="bg-white rounded-lg shadow p-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-yellow-600">{{ mediumRiskCount }}</div>
                <div class="text-sm text-gray-600">Medium Risk Barangays</div>
              </div>
            </div>
            <div class="bg-white rounded-lg shadow p-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600">{{ lowRiskCount }}</div>
                <div class="text-sm text-gray-600">Low Risk Barangays</div>
              </div>
            </div>
            <div class="bg-white rounded-lg shadow p-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">{{ mapData.length }}</div>
                <div class="text-sm text-gray-600">Total Barangays</div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { onAuthStateChange } from '../services/auth'
import { analyticsAPI } from '../services/api'
// @ts-ignore
import Navigation from '../components/Navigation.vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const router = useRouter()

// Reactive state
const mapData = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const map = ref<L.Map | null>(null)
const markers = ref<L.Layer[]>([])

// Interface for map data
interface MapDataItem {
  barangay: string
  municipality: string
  province: string
  crimeCount: number
  population: number
  latitude: number
  longitude: number
  crimeRate: number | null
}

// Computed properties for statistics
const highRiskCount = computed(() => 
  mapData.value.filter(item => item.crimeRate !== null && item.crimeRate > 10).length
)

const mediumRiskCount = computed(() => 
  mapData.value.filter(item => item.crimeRate !== null && item.crimeRate >= 5 && item.crimeRate <= 10).length
)

const lowRiskCount = computed(() => 
  mapData.value.filter(item => item.crimeRate !== null && item.crimeRate < 5).length
)

// Fetch map data from API
const fetchMapData = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await analyticsAPI.getMapData()
    mapData.value = response.data
    
    // Wait for DOM to be ready and initialize map
    await nextTick()
    setTimeout(() => {
      initMap()
      addMarkers()
    }, 100) // Small delay to ensure DOM is ready
    
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to load map data'
    console.error('Error fetching map data:', err)
  } finally {
    loading.value = false
  }
}

// Initialize Leaflet map
const initMap = () => {
  try {
    // Check if map container exists
    const mapContainer = document.getElementById('map')
    if (!mapContainer) {
      throw new Error('Map container not found')
    }
    
    if (map.value) {
      map.value.remove()
    }
    
    // Center on Lubao, Pampanga
    map.value = L.map('map').setView([14.9333, 120.6000], 12)
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.value as L.Map)
  } catch (err: any) {
    console.error('Error initializing map:', err)
    error.value = 'Failed to initialize map: ' + err.message
  }
}

// Calculate risk level based on crime rate
const calculateRiskLevel = (crimeRate: number | null): 'high' | 'medium' | 'low' => {
  if (crimeRate === null) return 'low'
  if (crimeRate > 10) return 'high'
  if (crimeRate >= 5) return 'medium'
  return 'low'
}

// Get marker color based on risk level
const getMarkerColor = (riskLevel: 'high' | 'medium' | 'low'): string => {
  switch (riskLevel) {
    case 'high': return '#ef4444' // red-500
    case 'medium': return '#eab308' // yellow-500
    case 'low': return '#22c55e' // green-500
    default: return '#6b7280' // gray-500
  }
}

// Add markers to map
const addMarkers = () => {
  if (!map.value) return
  
  // Clear existing markers and pulse intervals
  markers.value.forEach(marker => {
    if (map.value) {
      map.value.removeLayer(marker as L.Layer)
    }
    // Clear pulse intervals for high risk markers
    if ((marker as any).pulseInterval) {
      clearInterval((marker as any).pulseInterval)
    }
  })
  markers.value = []
  
  mapData.value.forEach((item: MapDataItem) => {
    if (!item.latitude || !item.longitude) return
    
    const riskLevel = calculateRiskLevel(item.crimeRate)
    const color = getMarkerColor(riskLevel)
    
    // Create custom marker
    const marker = L.circleMarker([item.latitude, item.longitude], {
      radius: 8,
      fillColor: color,
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    })
    
    // Add pulse effect for high risk areas
    if (riskLevel === 'high') {
      // Create pulsing circle for high risk areas
      const pulseCircle = L.circle([item.latitude, item.longitude], {
        radius: 200, // Start with larger radius
        color: color,
        weight: 2,
        opacity: 0.6,
        fillColor: color,
        fillOpacity: 0.1
      })
      
      // Add pulsing animation
      let pulseRadius = 200
      let growing = true
      
      const pulseAnimation = () => {
        if (growing) {
          pulseRadius += 20
          if (pulseRadius >= 400) growing = false
        } else {
          pulseRadius -= 20
          if (pulseRadius <= 200) growing = true
        }
        
        pulseCircle.setRadius(pulseRadius)
        pulseCircle.setStyle({
          opacity: 0.6 - (pulseRadius - 200) / 1000,
          fillOpacity: 0.1 - (pulseRadius - 200) / 2000
        })
      }
      
      // Start pulsing animation
      const pulseInterval = setInterval(pulseAnimation, 100)
      
      // Store interval for cleanup
      ;(marker as any).pulseInterval = pulseInterval
      
      // Add pulse circle to map
      pulseCircle.addTo(map.value as L.Map)
      markers.value.push(pulseCircle as L.Layer)
    }
    
    // Create popup content
    const popupContent = `
      <div class="p-2">
        <h3 class="font-semibold text-gray-900">${item.barangay}</h3>
        <p class="text-sm text-gray-600">${item.municipality}, ${item.province}</p>
        <div class="mt-2 space-y-1">
          <p class="text-sm"><strong>Crime Count:</strong> ${item.crimeCount}</p>
          <p class="text-sm"><strong>Population:</strong> ${item.population?.toLocaleString() || 'N/A'}</p>
          <p class="text-sm"><strong>Crime Rate:</strong> ${item.crimeRate ? item.crimeRate.toFixed(2) + ' per 1000' : 'N/A'}</p>
          <p class="text-sm"><strong>Risk Level:</strong> <span class="font-semibold" style="color: ${color}">${riskLevel.toUpperCase()}</span></p>
        </div>
      </div>
    `
    
    marker.bindPopup(popupContent)
    marker.addTo(map.value as L.Map)
    markers.value.push(marker as L.Layer)
  })
}

// Refresh map data
const refreshMap = () => {
  fetchMapData()
}

onMounted(() => {
  onAuthStateChange((user) => {
    if (!user) {
      router.push('/signin')
    } else {
      // Load map data when user is authenticated
      fetchMapData()
    }
  })
})
</script>

<style scoped>
/* Additional custom styles if needed */
</style>

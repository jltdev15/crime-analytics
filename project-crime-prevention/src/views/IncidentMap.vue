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
            <div v-else class="flex items-center space-x-6 text-sm">
              <div class="flex items-center space-x-2">
                <span class="text-gray-600">Total Barangays:</span>
                <span class="font-semibold text-gray-900">{{ mapData.length }}</span>
              </div>
              
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span class="text-gray-600">High Risk:</span>
                <span class="font-semibold text-red-600">{{ highRiskCount }}</span>
              </div>
              
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" style="animation-delay: 0.5s;"></div>
                <span class="text-gray-600">Medium Risk:</span>
                <span class="font-semibold text-yellow-600">{{ mediumRiskCount }}</span>
              </div>
              
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse" style="animation-delay: 1s;"></div>
                <span class="text-gray-600">Low Risk:</span>
                <span class="font-semibold text-green-600">{{ lowRiskCount }}</span>
              </div>
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
          <div v-else class="relative">
            <div id="map" class="h-96 w-full min-h-[384px] bg-gray-100 rounded-lg"></div>
          </div>
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
    console.log('Fetching map data...')
    loading.value = true
    error.value = null
    
    const response = await analyticsAPI.getMapData()
    console.log('API response:', response)
    mapData.value = response.data
    console.log('Map data set:', mapData.value.length, 'items')
    
    // Wait for DOM to be ready and initialize map
    await nextTick()
    console.log('DOM ready, initializing map...')
    setTimeout(() => {
      initMap()
      addMarkers()
    }, 100) // Small delay to ensure DOM is ready
    
  } catch (err: any) {
    console.error('Error fetching map data:', err)
    error.value = err.response?.data?.error || 'Failed to load map data'
    
    // Initialize map even if data fails to load
    await nextTick()
    setTimeout(() => {
      initMap()
    }, 100)
  } finally {
    loading.value = false
  }
}

// Initialize Leaflet map
const initMap = () => {
  try {
    console.log('Initializing map...')
    
    // Check if map container exists
    const mapContainer = document.getElementById('map')
    if (!mapContainer) {
      throw new Error('Map container not found')
    }
    
    console.log('Map container found:', mapContainer)
    
    // Remove existing map if it exists
    if (map.value) {
      map.value.remove()
      map.value = null
    }
    
    // Create new map instance
    map.value = L.map('map', {
      center: [14.9333, 120.6000],
      zoom: 12,
      zoomControl: true
    })
    
    console.log('Map created:', map.value)
    
    // Add OpenStreetMap tiles
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    })
    
    if (map.value) {
      tileLayer.addTo(map.value as L.Map)
    }
    console.log('Tile layer added')
    
    // Force map to resize after a short delay
    setTimeout(() => {
      if (map.value) {
        map.value.invalidateSize()
        console.log('Map invalidated and resized')
      }
    }, 100)
    
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

// Get pulse configuration based on risk level
const getPulseConfig = (riskLevel: 'high' | 'medium' | 'low') => {
  switch (riskLevel) {
    case 'high':
      return {
        startRadius: 150,
        maxRadius: 400,
        speed: 25,
        interval: 80, // Fastest pulse
        weight: 3,
        opacity: 0.8,
        fillOpacity: 0.15,
        opacityDecay: 800,
        fillOpacityDecay: 1600
      }
    case 'medium':
      return {
        startRadius: 100,
        maxRadius: 250,
        speed: 15,
        interval: 120, // Medium speed
        weight: 2,
        opacity: 0.6,
        fillOpacity: 0.1,
        opacityDecay: 1000,
        fillOpacityDecay: 2000
      }
    case 'low':
      return {
        startRadius: 80,
        maxRadius: 180,
        speed: 10,
        interval: 200, // Slowest pulse
        weight: 1,
        opacity: 0.4,
        fillOpacity: 0.05,
        opacityDecay: 1200,
        fillOpacityDecay: 2400
      }
    default:
      return {
        startRadius: 80,
        maxRadius: 180,
        speed: 10,
        interval: 200,
        weight: 1,
        opacity: 0.4,
        fillOpacity: 0.05,
        opacityDecay: 1200,
        fillOpacityDecay: 2400
      }
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
    // Clear pulse intervals for all markers
    if ((marker as any).pulseInterval) {
      clearInterval((marker as any).pulseInterval)
    }
  })
  markers.value = []
  
  mapData.value.forEach((item: MapDataItem) => {
    if (!item.latitude || !item.longitude) return
    
    const riskLevel = calculateRiskLevel(item.crimeRate)
    const color = getMarkerColor(riskLevel)
    
    // Create custom marker with different sizes based on risk level
    const markerRadius = riskLevel === 'high' ? 10 : riskLevel === 'medium' ? 8 : 6
    const marker = L.circleMarker([item.latitude, item.longitude], {
      radius: markerRadius,
      fillColor: color,
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    })
    
    // Add pulse effect for ALL risk levels with different intensities
    const pulseConfig = getPulseConfig(riskLevel)
    const pulseCircle = L.circle([item.latitude, item.longitude], {
      radius: pulseConfig.startRadius,
      color: color,
      weight: pulseConfig.weight,
      opacity: pulseConfig.opacity,
      fillColor: color,
      fillOpacity: pulseConfig.fillOpacity
    })
    
    // Add pulsing animation with different speeds and intensities
    let pulseRadius = pulseConfig.startRadius
    let growing = true
    
    const pulseAnimation = () => {
      if (growing) {
        pulseRadius += pulseConfig.speed
        if (pulseRadius >= pulseConfig.maxRadius) growing = false
      } else {
        pulseRadius -= pulseConfig.speed
        if (pulseRadius <= pulseConfig.startRadius) growing = true
      }
      
      pulseCircle.setRadius(pulseRadius)
      pulseCircle.setStyle({
        opacity: pulseConfig.opacity - (pulseRadius - pulseConfig.startRadius) / pulseConfig.opacityDecay,
        fillOpacity: pulseConfig.fillOpacity - (pulseRadius - pulseConfig.startRadius) / pulseConfig.fillOpacityDecay
      })
    }
    
    // Start pulsing animation with different intervals
    const pulseInterval = setInterval(pulseAnimation, pulseConfig.interval)
    
    // Store interval for cleanup
    ;(marker as any).pulseInterval = pulseInterval
    
    // Add pulse circle to map
    pulseCircle.addTo(map.value as L.Map)
    markers.value.push(pulseCircle as L.Layer)
    
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
/* Map container styles */
#map {
  height: 384px !important;
  width: 100% !important;
  min-height: 384px !important;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

/* Ensure Leaflet map takes full container */
.leaflet-container {
  height: 100% !important;
  width: 100% !important;
  border-radius: 0.5rem;
}

/* Risk level indicator styles */
.risk-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.risk-high {
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.risk-medium {
  background-color: #fffbeb;
  color: #d97706;
  border: 1px solid #fed7aa;
}

.risk-low {
  background-color: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

/* Pulse animation keyframes */
@keyframes pulse-high {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.6;
  }
}

@keyframes pulse-medium {
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.4;
  }
}

@keyframes pulse-low {
  0%, 100% {
    transform: scale(1);
    opacity: 0.4;
  }
  50% {
    transform: scale(1.02);
    opacity: 0.2;
  }
}

/* Enhanced marker styles */
.leaflet-marker-icon {
  animation: pulse-high 2s ease-in-out infinite;
}

/* Custom popup styles */
.leaflet-popup-content {
  font-family: 'Inter', sans-serif;
}

.leaflet-popup-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.leaflet-popup-content p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
}

/* Loading animation */
.loading-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Map controls styling */
.map-controls {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.map-controls button {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.map-controls button:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

/* Statistics panel styling */
.stats-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* Risk level badges */
.risk-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.risk-badge.high {
  background-color: #fef2f2;
  color: #dc2626;
}

.risk-badge.medium {
  background-color: #fffbeb;
  color: #d97706;
}

.risk-badge.low {
  background-color: #f0fdf4;
  color: #16a34a;
}
</style>

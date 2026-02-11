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
            <div id="map" class=" w-full min-h-[500px] bg-gray-100 rounded-lg"></div>
          </div>
        </div>

        <!-- Map Legend -->
        <div class="mt-6 bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Map Legend</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="flex items-center">
              <svg class="w-5 h-6 flex-shrink-0 mr-3" viewBox="0 0 24 34" fill="#ef4444" stroke="#fff" stroke-width="1">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 22 12 22s12-13 12-22C24 5.373 18.627 0 12 0z"/>
              </svg>
              <span class="text-sm text-gray-600">High Risk Areas (Crime Rate > 10 per 1000)</span>
            </div>
            <div class="flex items-center">
              <svg class="w-5 h-6 flex-shrink-0 mr-3" viewBox="0 0 24 34" fill="#eab308" stroke="#fff" stroke-width="1">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 22 12 22s12-13 12-22C24 5.373 18.627 0 12 0z"/>
              </svg>
              <span class="text-sm text-gray-600">Medium Risk Areas (5-10 per 1000)</span>
            </div>
            <div class="flex items-center">
              <svg class="w-5 h-6 flex-shrink-0 mr-3" viewBox="0 0 24 34" fill="#22c55e" stroke="#fff" stroke-width="1">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 22 12 22s12-13 12-22C24 5.373 18.627 0 12 0z"/>
              </svg>
              <span class="text-sm text-gray-600">Low Risk Areas (< 5 per 1000)</span>
            </div>
            <div class="flex items-center">
              <div class="w-4 h-4 border-2 border-blue-700 bg-blue-500 bg-opacity-10 mr-3"></div>
              <span class="text-sm text-gray-600">Lubao Municipality Boundary</span>
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

    <!-- Side Panel for Detailed Information - X/Twitter Style -->
    <div 
      v-if="isPanelOpen"
      class="fixed inset-0 z-50 overflow-hidden"
      @click.self="closePanel"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40 transition-opacity"></div>
      
      <!-- Panel -->
      <div 
        class="absolute right-0 top-0 h-full w-full md:max-w-xl bg-white transform transition-transform duration-200 ease-out overflow-y-auto"
        :class="{ 'translate-x-0': isPanelOpen, 'translate-x-full': !isPanelOpen }"
      >
        <!-- Header - X Style -->
        <div class="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-4 py-3 flex items-center justify-between z-10">
          <h2 class="text-xl font-bold text-gray-900">Barangay Details</h2>
          <button 
            @click="closePanel"
            class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="px-4 py-3" v-if="selectedBarangay">
          <!-- Loading State -->
          <div v-if="loadingPanelData" class="flex items-center justify-center py-16">
            <div class="text-center">
              <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-900 mb-3"></div>
              <p class="text-sm text-gray-500">Loading...</p>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="panelError" class="px-4 py-3 mb-4 border border-red-200/50 rounded-2xl bg-red-50/50">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-sm text-red-700">{{ panelError }}</p>
            </div>
          </div>

          <!-- Content -->
          <template v-else>
            <!-- Barangay Header - X Style -->
            <div class="pb-4 border-b border-gray-200/50 mb-4">
              <h3 class="text-xl font-bold text-gray-900 mb-1 leading-tight">{{ selectedBarangay.barangay }}</h3>
              <p class="text-sm text-gray-500 mb-3">{{ selectedBarangay.municipality }}, {{ selectedBarangay.province }}</p>
              <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" 
                   :style="{ 
                     color: getMarkerColor(calculateRiskLevel(selectedBarangay.crimeRate)),
                     backgroundColor: getMarkerColor(calculateRiskLevel(selectedBarangay.crimeRate)) + '15'
                   }">
                {{ calculateRiskLevel(selectedBarangay.crimeRate).toUpperCase() }} RISK
              </div>
            </div>

            <!-- Statistics - X Style Compact Cards -->
            <div class="grid grid-cols-2 gap-2 mb-4">
              <div class="px-3 py-2.5 border border-gray-200/50 rounded-2xl hover:bg-gray-50/50 transition-colors">
                <p class="text-xs text-gray-500 mb-0.5">Crimes</p>
                <p class="text-lg font-bold text-gray-900">{{ selectedBarangay.crimeCount }}</p>
              </div>
              <div class="px-3 py-2.5 border border-gray-200/50 rounded-2xl hover:bg-gray-50/50 transition-colors">
                <p class="text-xs text-gray-500 mb-0.5">Population</p>
                <p class="text-lg font-bold text-gray-900">{{ selectedBarangay.population?.toLocaleString() || 'N/A' }}</p>
              </div>
              <div class="px-3 py-2.5 border border-gray-200/50 rounded-2xl hover:bg-gray-50/50 transition-colors">
                <p class="text-xs text-gray-500 mb-0.5">Crime Rate</p>
                <p class="text-lg font-bold text-gray-900">
                  {{ selectedBarangay.crimeRate ? selectedBarangay.crimeRate.toFixed(1) : 'N/A' }}
                  <span class="text-xs font-normal text-gray-500">/1k</span>
                </p>
              </div>
              <div class="px-3 py-2.5 border border-gray-200/50 rounded-2xl hover:bg-gray-50/50 transition-colors">
                <p class="text-xs text-gray-500 mb-0.5">Risk</p>
                <p class="text-lg font-bold" 
                   :style="{ color: getMarkerColor(calculateRiskLevel(selectedBarangay.crimeRate)) }">
                  {{ calculateRiskLevel(selectedBarangay.crimeRate).toUpperCase() }}
                </p>
              </div>
            </div>

            <!-- Crime Type Distribution - X Style -->
            <div class="mb-4" v-if="crimeTypeDistribution.length > 0">
              <h4 class="text-sm font-bold text-gray-900 mb-3 px-1">Crime Types</h4>
              <div class="space-y-0.5">
                <div 
                  v-for="(crimeType, index) in crimeTypeDistribution" 
                  :key="index"
                  class="px-4 py-3 border border-gray-200/50 rounded-2xl hover:bg-gray-50/50 transition-colors"
                >
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-semibold text-gray-900">{{ crimeType.type }}</span>
                    <span class="text-sm font-bold text-gray-900">{{ crimeType.count }}</span>
                  </div>
                  <div class="w-full bg-gray-200/50 rounded-full h-1.5 overflow-hidden">
                    <div 
                      class="h-1.5 rounded-full transition-all duration-500"
                      :style="{ 
                        width: `${crimeTypeDistribution.length > 0 && crimeTypeDistribution[0] ? (crimeType.count / crimeTypeDistribution[0].count) * 100 : 0}%`,
                        backgroundColor: getMarkerColor(calculateRiskLevel(selectedBarangay.crimeRate))
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Crimes - X Style Timeline -->
            <div class="mb-4" v-if="recentCrimes.length > 0">
              <h4 class="text-sm font-bold text-gray-900 mb-3 px-1">Recent Crimes</h4>
              <div class="space-y-0.5">
                <div 
                  v-for="(crime, index) in recentCrimes" 
                  :key="crime._id || index"
                  class="px-4 py-3 border border-gray-200/50 rounded-2xl hover:bg-gray-50/50 transition-colors cursor-pointer"
                >
                  <div class="flex items-start gap-3">
                    <div class="flex-shrink-0 w-1 h-1 rounded-full mt-2"
                         :style="{ 
                           backgroundColor: crime.type?.toLowerCase().includes('murder') || crime.type?.toLowerCase().includes('homicide') ? '#ef4444' : 
                                         crime.type?.toLowerCase().includes('theft') || crime.type?.toLowerCase().includes('robbery') ? '#eab308' : '#3b82f6'
                         }"></div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-start justify-between gap-2 mb-1">
                        <p class="text-sm font-semibold text-gray-900 leading-tight">{{ crime.type || 'Unknown Crime Type' }}</p>
                        <span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full flex-shrink-0">
                          {{ crime.status || 'Unknown' }}
                        </span>
                      </div>
                      <p class="text-xs text-gray-500 mb-1">
                        {{ crime.confinementDate ? new Date(crime.confinementDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date not available' }}
                      </p>
                      <p v-if="crime.description" class="text-sm text-gray-600 mt-1.5 line-clamp-2 leading-relaxed">
                        {{ crime.description }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty States - X Style -->
            <div v-if="crimeTypeDistribution.length === 0 && recentCrimes.length === 0" class="text-center py-12 px-4">
              <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <p class="text-sm text-gray-500">No additional details available</p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { onAuthStateChange } from '../services/auth'
import { analyticsAPI, crimesAPI } from '../services/api'
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
const geoJsonLayer = ref<L.GeoJSON | null>(null)
const maskLayer = ref<L.Rectangle | null>(null)

// Side panel state
const isPanelOpen = ref(false)
const selectedBarangay = ref<MapDataItem | null>(null)
const crimeTypeDistribution = ref<Array<{ type: string; count: number }>>([])
const recentCrimes = ref<any[]>([])
const loadingPanelData = ref(false)
const panelError = ref<string | null>(null)

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
      // Clear GeoJSON layer before removing map
      if (geoJsonLayer.value) {
        map.value.removeLayer(geoJsonLayer.value as unknown as L.Layer)
        geoJsonLayer.value = null
      }
      // Clear mask layer
      if (maskLayer.value) {
        map.value.removeLayer(maskLayer.value as unknown as L.Layer)
        maskLayer.value = null
      }
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
    
    // Load Lubao boundary
    loadLubaoBoundary()
    
  } catch (err: any) {
    console.error('Error initializing map:', err)
    error.value = 'Failed to initialize map: ' + err.message
  }
}

// Load Lubao boundary from GeoJSON
const loadLubaoBoundary = async () => {
  if (!map.value) return
  
  try {
    console.log('Loading Lubao boundary...')
    
    // Remove existing GeoJSON layer if it exists
    if (geoJsonLayer.value) {
      map.value.removeLayer(geoJsonLayer.value as unknown as L.Layer)
      geoJsonLayer.value = null
    }
    
    // Fetch GeoJSON file from public folder
    const response = await fetch('/Lubao.geojson')
    if (!response.ok) {
      throw new Error(`Failed to fetch GeoJSON: ${response.statusText}`)
    }
    
    const geoJsonData = await response.json()
    console.log('GeoJSON data loaded:', geoJsonData)
    
    // Create GeoJSON layer with styling (non-interactive to allow marker clicks)
    geoJsonLayer.value = L.geoJSON(geoJsonData, {
      style: {
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        color: '#1e40af',
        weight: 2,
        opacity: 0.8
      },
      interactive: false, // Make boundary non-interactive so markers can be clicked
      onEachFeature: (feature, layer) => {
        // No popup needed for boundary - it's just visual
      }
    })
    
    // Add layer to map
    if (geoJsonLayer.value && map.value) {
      geoJsonLayer.value.addTo(map.value as L.Map)
      console.log('Lubao boundary added to map')
      
      // Get boundary bounds and set maxBounds to restrict panning
      const boundaryBounds = geoJsonLayer.value.getBounds()
      if (boundaryBounds.isValid()) {
        // Set maxBounds to restrict panning to boundary area (with small padding)
        const paddedBounds = L.latLngBounds(
          boundaryBounds.getSouthWest(),
          boundaryBounds.getNorthEast()
        ).pad(0.1) // 10% padding
        
        map.value.setMaxBounds(paddedBounds)
        console.log('Map maxBounds set to boundary area')
        
        // Create mask overlay to darken areas outside boundary
        createMaskOverlay(boundaryBounds)
      }
      
      // Fit map bounds to show boundary and markers after a short delay
      setTimeout(() => {
        fitMapBounds()
      }, 200)
    }
    
  } catch (err: any) {
    console.error('Error loading Lubao boundary:', err)
    // Don't set error state - boundary is optional, map should still work
  }
}

// Create mask overlay to darken areas outside the boundary
const createMaskOverlay = (boundaryBounds: L.LatLngBounds) => {
  if (!map.value || !geoJsonLayer.value) return
  
  try {
    // Remove existing mask if it exists
    if (maskLayer.value) {
      map.value.removeLayer(maskLayer.value as unknown as L.Layer)
      maskLayer.value = null
    }
    
    // Create SVG overlay for masking
    // This will be handled via CSS clip-path on the map container
    // The maxBounds already restricts panning, so the visual crop is handled by fitting to boundary
    
    console.log('Map view restricted to boundary area via maxBounds')
    
  } catch (err: any) {
    console.error('Error creating mask overlay:', err)
  }
}

// Fit map bounds to show both boundary and markers
const fitMapBounds = () => {
  if (!map.value) return
  
  try {
    // Prioritize boundary bounds - only show area within boundary
    if (geoJsonLayer.value) {
      const boundaryBounds = geoJsonLayer.value.getBounds()
      if (boundaryBounds.isValid()) {
        // Fit to boundary with small padding
        map.value.fitBounds(boundaryBounds, {
          padding: [30, 30] // Small padding for better visibility
        })
        console.log('Map bounds fitted to boundary area')
        return
      }
    }
    
    // Fallback: if no boundary, use marker bounds
    if (markers.value.length > 0) {
      const markerBounds = L.latLngBounds(
        mapData.value
          .filter((item: MapDataItem) => item.latitude && item.longitude)
          .map((item: MapDataItem) => [item.latitude, item.longitude] as L.LatLngTuple)
      )
      if (markerBounds.isValid()) {
        map.value.fitBounds(markerBounds, {
          padding: [50, 50]
        })
        console.log('Map bounds fitted to markers')
      }
    }
  } catch (err: any) {
    console.error('Error fitting map bounds:', err)
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

// Create pin icon for markers
const createPinIcon = (color: string, size: number = 28) => {
  const iconWidth = size
  const iconHeight = size * 1.4
  const iconSize: L.PointTuple = [iconWidth, iconHeight]
  const iconAnchor: L.PointTuple = [size / 2, iconHeight]
  
  const pinSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 34" width="${iconWidth}" height="${iconHeight}">
      <path fill="${color}" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round" 
        d="M12 0C5.373 0 0 5.373 0 12c0 9 12 22 12 22s12-13 12-22C24 5.373 18.627 0 12 0z"/>
      <circle cx="12" cy="10" r="4" fill="rgba(255,255,255,0.9)"/>
    </svg>
  `
  
  return L.divIcon({
    html: pinSvg,
    className: 'pin-marker-icon',
    iconSize,
    iconAnchor,
    popupAnchor: [0, -iconHeight] as L.PointTuple
  })
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
  
  // Note: GeoJSON layer is not cleared here as it should persist
  // It will be cleared when map is reinitialized
  
  mapData.value.forEach((item: MapDataItem) => {
    if (!item.latitude || !item.longitude) return
    
    const riskLevel = calculateRiskLevel(item.crimeRate)
    const color = getMarkerColor(riskLevel)
    
    // Create pin marker with different sizes based on risk level
    const pinSize = riskLevel === 'high' ? 32 : riskLevel === 'medium' ? 28 : 24
    const marker = L.marker([item.latitude, item.longitude], {
      icon: createPinIcon(color, pinSize),
      interactive: true,
      bubblingMouseEvents: false
    })
    
    // Add pulse effect for ALL risk levels with different intensities
    const pulseConfig = getPulseConfig(riskLevel)
    const pulseCircle = L.circle([item.latitude, item.longitude], {
      radius: pulseConfig.startRadius,
      color: color,
      weight: pulseConfig.weight,
      opacity: pulseConfig.opacity,
      fillColor: color,
      fillOpacity: pulseConfig.fillOpacity,
      interactive: false, // Pulse circle should not intercept clicks
      bubblingMouseEvents: false
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
    
    // Create enhanced popup content with crime type breakdown
    const createPopupContent = async (barangayItem: MapDataItem) => {
      // Fetch crime type distribution for this barangay
      let crimeTypes: Array<{ type: string; count: number }> = []
      try {
        const response = await analyticsAPI.getCrimeTypeDistribution({
          barangay: barangayItem.barangay,
          municipality: barangayItem.municipality,
          province: barangayItem.province
        })
        crimeTypes = response.data || []
      } catch (err) {
        console.error('Error fetching crime types for popup:', err)
      }
      
      // Get top 5 crime types
      const topCrimeTypes = crimeTypes.slice(0, 3)
      const crimeTypesHtml = topCrimeTypes.length > 0
        ? `
          <div class="mt-1.5 pt-1.5 border-t border-gray-200">
            <p class="text-xs font-semibold text-gray-700 mb-1">Top Crimes:</p>
            <div class="space-y-0.5">
              ${topCrimeTypes.map(ct => `
                <div class="flex justify-between items-center text-xs">
                  <span class="text-gray-600 truncate" style="max-width: 120px;" title="${ct.type}">${ct.type.length > 15 ? ct.type.substring(0, 15) + '...' : ct.type}</span>
                  <span class="font-semibold text-gray-900 ml-1">${ct.count}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `
        : ''
      
      // Create unique ID for this barangay's button
      const buttonId = `view-details-${barangayItem.barangay.replace(/\s+/g, '-')}-${Date.now()}`
      
      return `
        <div class="p-2 min-w-[200px] max-w-[220px]">
          <h3 class="font-semibold text-gray-900 text-sm mb-0.5 leading-tight">${barangayItem.barangay}</h3>
          <p class="text-xs text-gray-500 mb-2 leading-tight">${barangayItem.municipality}</p>
          <div class="grid grid-cols-2 gap-x-3 gap-y-1 mb-2 text-xs">
            <div class="flex justify-between">
              <span class="text-gray-500">Crimes:</span>
              <span class="font-semibold text-gray-900">${barangayItem.crimeCount}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Pop:</span>
              <span class="font-semibold text-gray-900">${barangayItem.population ? (barangayItem.population / 1000).toFixed(1) + 'k' : 'N/A'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Rate:</span>
              <span class="font-semibold text-gray-900">${barangayItem.crimeRate ? barangayItem.crimeRate.toFixed(1) : 'N/A'}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500">Risk:</span>
              <span class="text-xs font-semibold px-1.5 py-0.5 rounded" style="color: ${color}; background-color: ${color}20">${riskLevel.toUpperCase()}</span>
            </div>
          </div>
          ${crimeTypesHtml}
          <button 
            id="${buttonId}"
            data-barangay='${JSON.stringify(barangayItem)}'
            class="view-details-btn mt-2 w-full px-2 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
          >
            View Details
          </button>
        </div>
      `
    }
    
    // Bind popup with async content loading
    marker.bindPopup('Loading...', {
      maxWidth: 220,
      className: 'compact-popup'
    })
    
    // Load popup content when opened
    marker.on('popupopen', async () => {
      const content = await createPopupContent(item)
      marker.setPopupContent(content)
      
      // Add click handler to the button after popup is rendered
      setTimeout(() => {
        const popupElement = marker.getPopup()?.getElement()
        if (popupElement) {
          const button = popupElement.querySelector('.view-details-btn')
          if (button) {
            button.addEventListener('click', () => {
              const barangayData = JSON.parse(button.getAttribute('data-barangay') || '{}')
              openPanel(barangayData)
              if (map.value) {
                map.value.closePopup()
              }
            })
          }
        }
      }, 100)
    })
    
    marker.addTo(map.value as L.Map)
    markers.value.push(marker as L.Layer)
  })
  
  // Don't refit bounds after adding markers - keep view restricted to boundary
  // The boundary bounds are already set via maxBounds
}

// Refresh map data
const refreshMap = () => {
  fetchMapData()
}

// Fetch crime type distribution for a barangay
const fetchCrimeTypeDistribution = async (barangay: MapDataItem) => {
  try {
    const response = await analyticsAPI.getCrimeTypeDistribution({
      barangay: barangay.barangay,
      municipality: barangay.municipality,
      province: barangay.province
    })
    return response.data || []
  } catch (err: any) {
    console.error('Error fetching crime type distribution:', err)
    return []
  }
}

// Fetch recent crimes for a barangay
const fetchRecentCrimes = async (barangay: MapDataItem) => {
  try {
    const response = await crimesAPI.getCrimes({
      barangay: barangay.barangay,
      municipality: barangay.municipality,
      province: barangay.province,
      limit: 10,
      page: 1
    })
    return response.data?.crimes || []
  } catch (err: any) {
    console.error('Error fetching recent crimes:', err)
    return []
  }
}

// Open side panel with barangay details
const openPanel = async (barangay: MapDataItem) => {
  selectedBarangay.value = barangay
  isPanelOpen.value = true
  loadingPanelData.value = true
  panelError.value = null
  crimeTypeDistribution.value = []
  recentCrimes.value = []
  
  try {
    // Fetch both data sources in parallel
    const [crimeTypes, crimes] = await Promise.all([
      fetchCrimeTypeDistribution(barangay),
      fetchRecentCrimes(barangay)
    ])
    
    crimeTypeDistribution.value = crimeTypes
    recentCrimes.value = crimes
  } catch (err: any) {
    console.error('Error loading panel data:', err)
    panelError.value = 'Failed to load detailed information'
  } finally {
    loadingPanelData.value = false
  }
}

// Close side panel
const closePanel = () => {
  isPanelOpen.value = false
  selectedBarangay.value = null
  crimeTypeDistribution.value = []
  recentCrimes.value = []
  panelError.value = null
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

/* Pin marker styles - override Leaflet default */
.pin-marker-icon {
  background: transparent !important;
  border: none !important;
}

.pin-marker-icon svg {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.pin-marker-icon svg:hover {
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.4));
}

/* Pin markers don't need pulse - the expanding circles provide that effect */
.pin-marker-icon.leaflet-marker-icon {
  animation: none;
}

/* Custom popup styles */
.leaflet-popup-content {
  font-family: 'Inter', sans-serif;
  margin: 0;
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

/* Compact popup styling */
.leaflet-popup.compact-popup {
  margin-bottom: 20px;
}

.leaflet-popup.compact-popup .leaflet-popup-content-wrapper {
  padding: 0;
  border-radius: 6px;
}

.leaflet-popup.compact-popup .leaflet-popup-content {
  margin: 0;
  padding: 0;
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

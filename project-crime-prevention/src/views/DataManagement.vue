<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between">
          <div>
            <nav class="text-sm text-gray-500 mb-1">
              <router-link to="/analytics" class="hover:text-gray-700">Analytics</router-link>
              <span class="mx-2">/</span>
              <span class="text-gray-700">Data Management</span>
            </nav>
            <h1 class="text-3xl font-bold text-gray-900">Data Management</h1>
            <p class="mt-2 text-sm text-gray-600">
              Upload new crime data, monitor system health, and manage your dataset
            </p>
          </div>
          <div class="flex space-x-3">
            <button
              @click="refreshData"
              :disabled="loading"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Data Import Section -->
        <div class="bg-white overflow-hidden shadow rounded-lg mb-6">
          <div class="px-4 py-5 sm:p-6">
            <DataImport />
          </div>
        </div>

        <!-- Legacy Data Upload Section (Hidden for now) -->
        <div class="bg-white overflow-hidden shadow rounded-lg mb-6" style="display: none;">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              Upload New Crime Data
            </h3>
            
            <!-- File Upload -->
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div class="text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <div class="mt-4">
                  <label for="file-upload" class="cursor-pointer">
                    <span class="mt-2 block text-sm font-medium text-gray-900">
                      Drop your Excel file here, or click to browse
                    </span>
                    <input
                      id="file-upload"
                      ref="fileInput"
                      type="file"
                      accept=".xlsx,.xls"
                      @change="handleFileSelect"
                      class="sr-only"
                    />
                  </label>
                  <p class="mt-1 text-xs text-gray-500">
                    Excel files only (.xlsx, .xls)
                  </p>
                </div>
              </div>
            </div>

            <!-- Selected File Info -->
            <div v-if="selectedFile" class="mt-4 p-4 bg-blue-50 rounded-lg">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div class="flex-1">
                  <p class="text-sm font-medium text-blue-900">{{ selectedFile.name }}</p>
                  <p class="text-sm text-blue-700">{{ formatFileSize(selectedFile.size) }}</p>
                </div>
                <button
                  @click="clearFile"
                  class="text-blue-400 hover:text-blue-600"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Upload Button -->
            <div class="mt-6">
              <button
                @click="uploadFile"
                :disabled="!selectedFile || uploading"
                class="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="uploading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {{ uploading ? 'Uploading...' : 'Upload and Import Data' }}
              </button>
            </div>
          </div>
        </div>

        <!-- System Health Section -->
        <!-- <div class="bg-white overflow-hidden shadow rounded-lg mb-6">
          <div class="px-4 py-5 sm:p-6"> -->
            <!-- <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              System Health
            </h3> -->
            
            <!-- Health Cards -->
            <!-- <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div class="bg-green-50 p-4 rounded-lg">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-8 w-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-green-800">Total Crimes</p>
                    <p class="text-2xl font-semibold text-green-900">{{ systemHealth.totalCrimes || 0 }}</p>
                  </div>
                </div>
              </div>

              <div class="bg-blue-50 p-4 rounded-lg">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-8 w-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-blue-800">Total Barangays</p>
                    <p class="text-2xl font-semibold text-blue-900">{{ systemHealth.totalBarangays || 0 }}</p>
                  </div>
                </div>
              </div>

              <div class="bg-purple-50 p-4 rounded-lg">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-8 w-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-purple-800">AI Model Status</p>
                    <p class="text-sm font-semibold" :class="modelStatusColor">
                      {{ systemHealth.modelStatus || 'Unknown' }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="bg-yellow-50 p-4 rounded-lg">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-8 w-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-yellow-800">Last Updated</p>
                    <p class="text-sm font-semibold text-yellow-900">
                      {{ formatDate(systemHealth.lastUpdated) }}
                    </p>
                  </div>
                </div>
              </div>
            </div> -->

            <!-- Health Details -->
            <!-- <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 class="text-sm font-medium text-gray-900 mb-3">Data Quality</h4>
                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Overall Health</span>
                    <span class="font-medium" :class="healthColor">{{ systemHealth.overallHealth || 'Unknown' }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Data Completeness</span>
                    <span class="font-medium">{{ systemHealth.dataCompleteness || '0' }}%</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Missing Records</span>
                    <span class="font-medium text-red-600">{{ systemHealth.missingRecords || 0 }}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 class="text-sm font-medium text-gray-900 mb-3">Model Performance</h4>
                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Training Status</span>
                    <span class="font-medium" :class="trainingStatusColor">
                      {{ systemHealth.trainingStatus || 'Unknown' }}
                    </span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Confidence Level</span>
                    <span class="font-medium">{{ systemHealth.confidenceLevel || '0' }}%</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Predictions Generated</span>
                    <span class="font-medium">{{ systemHealth.totalPredictions || 0 }}</span>
                  </div>
                </div>
              </div>
            </div> -->
          <!-- </div>
        </div> -->


      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center">
      <div class="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mt-2">Upload Successful!</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">{{ successMessage }}</p>
          </div>
          <div class="items-center px-4 py-3">
            <button
              @click="closeSuccessModal"
              class="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Modal -->
    <div v-if="showErrorModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mt-2">Upload Failed</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">{{ errorMessage }}</p>
          </div>
          <div class="items-center px-4 py-3">
            <button
              @click="closeErrorModal"
              class="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import axios from 'axios';
import DataImport from '../components/DataImport.vue';

// Reactive data
const selectedFile = ref<File | null>(null);
const uploading = ref(false);
const loading = ref(false);
const showSuccessModal = ref(false);
const showErrorModal = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const systemHealth = reactive({
  totalCrimes: 0,
  totalBarangays: 0,
  modelStatus: 'Unknown',
  lastUpdated: null,
  overallHealth: 'Unknown',
  dataCompleteness: 0,
  missingRecords: 0,
  trainingStatus: 'Unknown',
  confidenceLevel: 0,
  totalPredictions: 0
});

const recentActivity = ref([
  {
    message: 'System initialized',
    timestamp: new Date(),
    icon: 'svg',
    iconBg: 'bg-blue-500',
    iconColor: 'text-white'
  }
]);

// Computed properties
const modelStatusColor = computed(() => {
  switch (systemHealth.modelStatus) {
    case 'Trained': return 'text-green-600';
    case 'Training': return 'text-yellow-600';
    case 'Failed': return 'text-red-600';
    default: return 'text-gray-600';
  }
});

const healthColor = computed(() => {
  switch (systemHealth.overallHealth) {
    case 'Excellent': return 'text-green-600';
    case 'Good': return 'text-blue-600';
    case 'Fair': return 'text-yellow-600';
    case 'Poor': return 'text-orange-600';
    case 'Critical': return 'text-red-600';
    default: return 'text-gray-600';
  }
});

const trainingStatusColor = computed(() => {
  switch (systemHealth.trainingStatus) {
    case 'Completed': return 'text-green-600';
    case 'In Progress': return 'text-yellow-600';
    case 'Failed': return 'text-red-600';
    default: return 'text-gray-600';
  }
});

// Methods
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
  }
};

const clearFile = () => {
  selectedFile.value = null;
  const fileInput = document.getElementById('file-upload') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (date: Date | string | null): string => {
  if (!date) return 'Never';
  const d = new Date(date);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
};

const uploadFile = async () => {
  if (!selectedFile.value) return;

  uploading.value = true;
  
  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);

    const response = await axios.post('/api/data/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.success) {
      successMessage.value = response.data.message;
      showSuccessModal.value = true;
      
      // Add to recent activity
      recentActivity.value.unshift({
        message: `Uploaded ${selectedFile.value.name} - ${response.data.data.newRecords} new ${response.data.data.fileType} records`,
        timestamp: new Date(),
        icon: 'svg',
        iconBg: 'bg-green-500',
        iconColor: 'text-white'
      });
      
      // Clear file and refresh data
      clearFile();
      await refreshData();
    } else {
      throw new Error(response.data.message || 'Upload failed');
    }
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || error.message || 'Upload failed';
    showErrorModal.value = true;
  } finally {
    uploading.value = false;
  }
};

const refreshData = async () => {
  loading.value = true;
  
  try {
    // Fetch system health
    const healthResponse = await axios.get('/api/data/health');
    if (healthResponse.data.success) {
      Object.assign(systemHealth, healthResponse.data.data);
    }
    
    // Add to recent activity
    recentActivity.value.unshift({
      message: 'System health refreshed',
      timestamp: new Date(),
      icon: 'svg',
      iconBg: 'bg-blue-500',
      iconColor: 'text-white'
    });
  } catch (error) {
    console.error('Failed to refresh data:', error);
  } finally {
    loading.value = false;
  }
};


const closeSuccessModal = () => {
  showSuccessModal.value = false;
  successMessage.value = '';
};

const closeErrorModal = () => {
  showErrorModal.value = false;
  errorMessage.value = '';
};

// Lifecycle
onMounted(async () => {
  await refreshData();
});
</script>

<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-xl font-semibold text-gray-900">Data Import</h3>
        <p class="text-sm text-gray-600 mt-1">Upload new crime data and population data to train the AI model</p>
      </div>
      <!-- <div class="flex space-x-3">
        <button
          @click="downloadTemplate('crime')"
          class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Crime Template
        </button>
        <button
          @click="downloadTemplate('population')"
          class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Population Template
        </button>
      </div> -->
    </div>

    <!-- Import Tabs -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-8">
        <button
          @click="activeTab = 'crime'"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm',
            activeTab === 'crime'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          Crime Data Import
        </button>
        <button
          @click="activeTab = 'population'"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm',
            activeTab === 'population'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          Population Data Import
        </button>
        <button
          @click="activeTab = 'history'"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm',
            activeTab === 'history'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          Import History
        </button>
      </nav>
    </div>

    <!-- Crime Data Import Tab -->
    <div v-if="activeTab === 'crime'" class="space-y-6">
      <!-- File Upload Area -->
      <div class="border-2 border-dashed border-gray-300 rounded-lg p-8">
        <div class="text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <div class="mt-4">
            <label for="crime-file-upload" class="cursor-pointer">
              <span class="mt-2 block text-sm font-medium text-gray-900">
                Drop your crime data file here, or click to browse
              </span>
              <span class="mt-1 block text-sm text-gray-500">
                Supports Excel (.xlsx, .xls), CSV, and JSON files up to 10MB
              </span>
            </label>
            <input
              id="crime-file-upload"
              ref="crimeFileInput"
              type="file"
              class="sr-only"
              accept=".xlsx,.xls,.csv,.json"
              @change="handleCrimeFileSelect"
            />
          </div>
        </div>
      </div>

      <!-- Selected File Info -->
      <div v-if="selectedCrimeFile" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div class="flex-1">
            <p class="text-sm font-medium text-blue-900">{{ selectedCrimeFile.name }}</p>
            <p class="text-sm text-blue-700">{{ formatFileSize(selectedCrimeFile.size) }}</p>
          </div>
          <button
            @click="clearCrimeFile"
            class="text-blue-400 hover:text-blue-600"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Import Options -->
      <div v-if="selectedCrimeFile" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Import Mode</label>
          <div class="space-y-2">
            <label class="flex items-center">
              <input
                v-model="importMode"
                type="radio"
                value="append"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span class="ml-2 text-sm text-gray-700">Append to existing data</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="importMode"
                type="radio"
                value="replace"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span class="ml-2 text-sm text-gray-700">Replace all existing data</span>
            </label>
          </div>
        </div>

        <button
          @click="importCrimeData"
          :disabled="importing"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <svg v-if="importing" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ importing ? 'Importing...' : 'Import Crime Data' }}
        </button>
      </div>
    </div>

    <!-- Population Data Import Tab -->
    <div v-if="activeTab === 'population'" class="space-y-6">
      <!-- File Upload Area -->
      <div class="border-2 border-dashed border-gray-300 rounded-lg p-8">
        <div class="text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <div class="mt-4">
            <label for="population-file-upload" class="cursor-pointer">
              <span class="mt-2 block text-sm font-medium text-gray-900">
                Drop your population data file here, or click to browse
              </span>
              <span class="mt-1 block text-sm text-gray-500">
                Supports Excel (.xlsx, .xls), CSV, and JSON files up to 10MB
              </span>
            </label>
            <input
              id="population-file-upload"
              ref="populationFileInput"
              type="file"
              class="sr-only"
              accept=".xlsx,.xls,.csv,.json"
              @change="handlePopulationFileSelect"
            />
          </div>
        </div>
      </div>

      <!-- Selected File Info -->
      <div v-if="selectedPopulationFile" class="bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div class="flex-1">
            <p class="text-sm font-medium text-green-900">{{ selectedPopulationFile.name }}</p>
            <p class="text-sm text-green-700">{{ formatFileSize(selectedPopulationFile.size) }}</p>
          </div>
          <button
            @click="clearPopulationFile"
            class="text-green-400 hover:text-green-600"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Import Button -->
      <div v-if="selectedPopulationFile">
        <button
          @click="importPopulationData"
          :disabled="importing"
          class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <svg v-if="importing" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ importing ? 'Importing...' : 'Import Population Data' }}
        </button>
      </div>
    </div>

    <!-- Import History Tab -->
    <div v-if="activeTab === 'history'" class="space-y-4">
      <div v-if="importHistory.length === 0" class="text-center py-8">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p class="mt-2 text-sm text-gray-500">No import history available</p>
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="item in importHistory"
          :key="item.id"
          class="border border-gray-200 rounded-lg p-4"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  item.status === 'completed' ? 'bg-green-100' : 'bg-red-100'
                ]">
                  <svg v-if="item.status === 'completed'" class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <svg v-else class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-900">{{ item.filename }}</p>
                <p class="text-sm text-gray-500">{{ item.type }} • {{ item.importedCount }} records</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">{{ formatDate(item.importedAt) }}</p>
              <p v-if="item.retrainedAI" class="text-xs text-green-600">AI Retrained</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Import Results Modal -->
    <div v-if="importResult" 
         @click.self="closeImportResult"
         @keydown.esc="closeImportResult"
         class="fixed inset-0 bg-gray-900/10 backdrop-blur-sm transition-opacity duration-300 flex items-center justify-center z-50 p-4">
      <div @click.stop class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="p-6">
          <!-- Modal Header -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full flex items-center justify-center" 
                   :class="importResult.success ? 'bg-green-100' : 'bg-red-100'">
                <svg v-if="importResult.success" class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 class="text-2xl font-bold text-gray-900">
                  {{ importResult.success ? 'Import Successful' : 'Import Failed' }}
                </h3>
                <p class="text-sm text-gray-600 mt-1">{{ importResult.message }}</p>
              </div>
            </div>
            <button @click="closeImportResult" class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Import Statistics -->
          <div v-if="importResult.data" class="space-y-6">
            <!-- Summary Cards -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="bg-blue-50 rounded-xl p-4">
                <div class="text-2xl font-bold text-blue-600">{{ importResult.data.totalRows || 0 }}</div>
                <div class="text-sm text-blue-700">Total Rows</div>
              </div>
              <div class="bg-green-50 rounded-xl p-4">
                <div class="text-2xl font-bold text-green-600">
                  {{ importResult.data.importedCount ?? ((importResult.data.upsertedCount || 0) + (importResult.data.modifiedCount || 0)) }}
                </div>
                <div class="text-sm text-green-700">Imported</div>
              </div>
              <div v-if="importResult.data.upsertedCount !== undefined" class="bg-yellow-50 rounded-xl p-4">
                <div class="text-2xl font-bold text-yellow-600">{{ importResult.data.upsertedCount }}</div>
                <div class="text-sm text-yellow-700">Upserted</div>
              </div>
              <div v-if="importResult.data.skippedCount > 0" class="bg-red-50 rounded-xl p-4">
                <div class="text-2xl font-bold text-red-600">{{ importResult.data.skippedCount }}</div>
                <div class="text-sm text-red-700">Skipped</div>
              </div>
            </div>

            <!-- Detailed Breakdown -->
            <div class="bg-gray-50 rounded-xl p-6">
              <h4 class="text-lg font-semibold text-gray-900 mb-4">Import Details</h4>
              <div class="space-y-3">
                <div class="flex justify-between items-center py-2 border-b border-gray-200">
                  <span class="text-sm font-medium text-gray-700">Total Rows Processed</span>
                  <span class="text-sm text-gray-900 font-semibold">{{ importResult.data.totalRows || 0 }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-200">
                  <span class="text-sm font-medium text-gray-700">Successfully Imported</span>
                  <span class="text-sm text-green-600 font-semibold">
                    {{ importResult.data.importedCount ?? ((importResult.data.upsertedCount || 0) + (importResult.data.modifiedCount || 0)) }}
                  </span>
                </div>
                <div v-if="importResult.data.upsertedCount !== undefined" class="flex justify-between items-center py-2 border-b border-gray-200">
                  <span class="text-sm font-medium text-gray-700">Upserted Records</span>
                  <span class="text-sm text-yellow-600 font-semibold">{{ importResult.data.upsertedCount }}</span>
                </div>
                <div v-if="importResult.data.modifiedCount !== undefined" class="flex justify-between items-center py-2 border-b border-gray-200">
                  <span class="text-sm font-medium text-gray-700">Modified Records</span>
                  <span class="text-sm text-blue-600 font-semibold">{{ importResult.data.modifiedCount }}</span>
                </div>
                <div v-if="importResult.data.skippedCount > 0" class="flex justify-between items-center py-2">
                  <span class="text-sm font-medium text-gray-700">Skipped Records</span>
                  <span class="text-sm text-red-600 font-semibold">{{ importResult.data.skippedCount }}</span>
                </div>
              </div>
            </div>

            <!-- AI Retraining Status -->
            <div v-if="importResult.data.aiRetraining" 
                 class="rounded-xl p-4" 
                 :class="importResult.data.aiRetraining.success ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center" 
                     :class="importResult.data.aiRetraining.success ? 'bg-green-100' : 'bg-yellow-100'">
                  <svg v-if="importResult.data.aiRetraining.success" class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <svg v-else class="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h5 class="text-sm font-semibold" 
                      :class="importResult.data.aiRetraining.success ? 'text-green-800' : 'text-yellow-800'">
                    AI Model Retraining
                  </h5>
                  <p class="text-xs mt-1" 
                     :class="importResult.data.aiRetraining.success ? 'text-green-700' : 'text-yellow-700'">
                    {{ importResult.data.aiRetraining.message }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
            <button @click="closeImportResult" 
                    class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium">
              Close
            </button>
            <button v-if="importResult.success" 
                    @click="fetchImportHistory(); closeImportResult()" 
                    class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              View History
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

// @ts-ignore
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

// Reactive data
const activeTab = ref('crime');
const selectedCrimeFile = ref<File | null>(null);
const selectedPopulationFile = ref<File | null>(null);
const importMode = ref('append');
const importing = ref(false);
const importResult = ref<any>(null);
const importHistory = ref<any[]>([]);

// File input refs
const crimeFileInput = ref<HTMLInputElement | null>(null);
const populationFileInput = ref<HTMLInputElement | null>(null);

// Methods
const handleCrimeFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedCrimeFile.value = target.files[0];
  }
};

const handlePopulationFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedPopulationFile.value = target.files[0];
  }
};

const clearCrimeFile = () => {
  selectedCrimeFile.value = null;
  if (crimeFileInput.value) {
    crimeFileInput.value.value = '';
  }
};

const clearPopulationFile = () => {
  selectedPopulationFile.value = null;
  if (populationFileInput.value) {
    populationFileInput.value.value = '';
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const importCrimeData = async () => {
  if (!selectedCrimeFile.value) return;

  importing.value = true;
  try {
    const formData = new FormData();
    formData.append('file', selectedCrimeFile.value);
    formData.append('importType', importMode.value);

    const response = await axios.post(`${API_BASE}/import/crime-data`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    importResult.value = response.data;
    clearCrimeFile();
    
    // Refresh import history
    await fetchImportHistory();
    
  } catch (error: any) {
    console.error('Import failed:', error);
    importResult.value = {
      success: false,
      message: error.response?.data?.error || 'Import failed',
      data: error.response?.data?.details
    };
  } finally {
    importing.value = false;
  }
};

const importPopulationData = async () => {
  if (!selectedPopulationFile.value) return;

  importing.value = true;
  try {
    const formData = new FormData();
    formData.append('file', selectedPopulationFile.value);

    const response = await axios.post(`${API_BASE}/import/population-data`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    importResult.value = response.data;
    clearPopulationFile();
    
    // Refresh import history
    await fetchImportHistory();
    
  } catch (error: any) {
    console.error('Import failed:', error);
    importResult.value = {
      success: false,
      message: error.response?.data?.error || 'Import failed',
      data: error.response?.data?.details
    };
  } finally {
    importing.value = false;
  }
};

const downloadTemplate = (type: 'crime' | 'population') => {
  // Create sample data based on type
  let sampleData: any[] = [];
  let filename = '';
  
  if (type === 'crime') {
    sampleData = [
      {
        type: 'DRUGS',
        status: 'ONGOING',
        gender: 'MALE',
        age: 25,
        civilStatus: 'SINGLE',
        confinementDate: '2024-01-15',
        confinementTime: '14:30',
        barangay: 'SANTA CRUZ',
        municipality: 'LUBAO',
        province: 'PAMPANGA',
        country: 'PHILIPPINES'
      }
    ];
    filename = 'crime_data_template.xlsx';
  } else {
    sampleData = [
      {
        name: 'SANTA CRUZ',
        municipality: 'LUBAO',
        province: 'PAMPANGA',
        country: 'PHILIPPINES',
        population: 5000,
        latitude: 14.9333,
        longitude: 120.6000
      }
    ];
    filename = 'population_data_template.xlsx';
  }

  // Convert to CSV for download
  const headers = Object.keys(sampleData[0]);
  const csvContent = [
    headers.join(','),
    ...sampleData.map(row => headers.map(header => row[header]).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.replace('.xlsx', '.csv');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

const fetchImportHistory = async () => {
  try {
    const response = await axios.get(`${API_BASE}/import/history`);
    importHistory.value = response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch import history:', error);
  }
};

const closeImportResult = () => {
  importResult.value = null;
};

// Lifecycle
onMounted(() => {
  fetchImportHistory();
});
</script>

<script lang="ts">
export default {
  name: 'DataImport'
};
</script>

<style scoped>
/* Additional custom styles if needed */
</style>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navigation />

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0 space-y-6">
        <!-- Page Header -->
        <div class="flex justify-between items-center">
          <div>
          <h1 class="text-3xl font-bold text-gray-900">Predictive Analytics</h1>
            <p class="text-gray-600 mt-2">AI-powered crime forecasting and risk assessment for Lubao Municipality</p>
            <div class="mt-3 flex items-center gap-4">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <span class="text-sm text-gray-500">Forecast Period:</span>
                <span class="text-sm font-medium text-gray-700">6 Months Ahead</span>
        </div>
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-sm text-gray-500">Last Updated:</span>
                <span class="text-sm font-medium text-gray-700">{{ lastUpdated }}</span>
            </div>
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
                <span class="text-sm text-gray-500">AI Model:</span>
                <span class="text-sm font-medium text-gray-700">{{ modelInfo.neuralNetwork?.isTrained ? 'Neural Network' : 'Statistical' }}</span>
            </div>
            </div>
          </div>
          <div class="flex gap-3">
            <button @click="retrainModel" :disabled="isRetraining"
                    class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
              <svg v-if="isRetraining" class="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <span v-if="isRetraining">Training AI...</span>
              <span v-else>Retrain AI Model</span>
            </button>
            <button @click="fetchData" :disabled="loading"
                    class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh
            </button>
          </div>
        </div>

        <!-- KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <!-- Skeletons -->
          <template v-if="loading">
            <div class="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
              <div class="h-3 w-24 bg-gray-200 rounded"></div>
              <div class="h-3 w-32 bg-gray-100 rounded mt-2"></div>
              <div class="h-10 w-24 bg-gray-200 rounded mt-6"></div>
              <div class="h-3 w-20 bg-gray-100 rounded mt-2"></div>
            </div>
            <div class="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
              <div class="h-3 w-24 bg-gray-200 rounded"></div>
              <div class="h-3 w-32 bg-gray-100 rounded mt-2"></div>
              <div class="h-10 w-24 bg-gray-200 rounded mt-6"></div>
              <div class="h-3 w-20 bg-gray-100 rounded mt-2"></div>
            </div>
            <div class="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
              <div class="h-3 w-24 bg-gray-200 rounded"></div>
              <div class="h-3 w-32 bg-gray-100 rounded mt-2"></div>
              <div class="h-10 w-24 bg-gray-200 rounded mt-6"></div>
              <div class="h-3 w-20 bg-gray-100 rounded mt-2"></div>
            </div>
            <div class="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
              <div class="h-3 w-24 bg-gray-200 rounded"></div>
              <div class="h-3 w-32 bg-gray-100 rounded mt-2"></div>
              <div class="h-10 w-24 bg-gray-200 rounded mt-6"></div>
              <div class="h-3 w-20 bg-gray-100 rounded mt-2"></div>
            </div>
          </template>
          
          <!-- Real Cards -->
          <template v-else>
          <!-- Total Predictions -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer" @click="goToPredictions">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Predictions</p>
                <p class="text-xs text-gray-500 mt-1">AI-generated forecasts</p>
              </div>
              <span class="text-blue-500">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </span>
            </div>
            <p class="mt-4 text-4xl font-semibold text-gray-900">{{ summary.totalPredictions }}</p>
            <p class="mt-1 text-sm text-gray-500">Active forecasts</p>
          </div>

          <!-- AI Confidence -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">AI Confidence</p>
                <p class="text-xs text-gray-500 mt-1">Prediction accuracy</p>
              </div>
              <span class="text-green-500">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </span>
            </div>
            <p class="mt-4 text-4xl font-semibold text-gray-900">{{ Math.round(summary.avgConfidence * 100) }}%</p>
            <p class="mt-1 text-sm text-gray-500">Model accuracy</p>
          </div>

          <!-- Crime Trend -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Crime Trend</p>
                <p class="text-xs text-gray-500 mt-1">6-month forecast</p>
              </div>
              <span :class="summary.avgPredictedChange >= 0 ? 'text-red-500' : 'text-green-500'">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </span>
            </div>
            <p class="mt-4 text-4xl font-semibold" :class="summary.avgPredictedChange >= 0 ? 'text-red-600' : 'text-green-600'">
              {{ summary.avgPredictedChange >= 0 ? '+' : '' }}{{ summary.avgPredictedChange }}%
            </p>
            <p class="mt-1 text-sm text-gray-500">
              {{ summary.avgPredictedChange >= 0 ? 'Increasing' : 'Decreasing' }} trend
            </p>
          </div>

          <!-- Risk Areas Summary -->
          <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm font-medium text-white">High Risk Areas</p>
                <p class="text-xs text-red-100 mt-1">Need immediate attention</p>
              </div>
              <span class="text-white">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </span>
            </div>
            <p class="mt-4 text-4xl font-semibold text-white">{{ summary.riskDistribution.high }}</p>
            <p class="mt-1 text-sm text-red-100">
              {{ summary.riskDistribution.high === 0 ? 'No high-risk areas' : 'Areas requiring attention' }}
            </p>
          </div>
          </template>
        </div>

        <!-- Model Performance Card -->
        <div class="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-4">AI Model Performance</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Neural Network Status -->
            <div class="text-center">
              <div class="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center" 
                   :class="modelInfo.neuralNetwork?.isTrained ? 'bg-green-100' : 'bg-yellow-100'">
                <svg class="w-8 h-8" :class="modelInfo.neuralNetwork?.isTrained ? 'text-green-600' : 'text-yellow-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <h4 class="font-semibold text-gray-900">Neural Network</h4>
              <p class="text-sm text-gray-600">{{ modelInfo.neuralNetwork?.isTrained ? 'Trained & Active' : 'Training Required' }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ modelInfo.neuralNetwork?.architecture }}</p>
            </div>

            <!-- Statistical Method -->
            <div class="text-center">
              <div class="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center bg-blue-100">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h4 class="font-semibold text-gray-900">Statistical</h4>
              <p class="text-sm text-gray-600">Always Available</p>
              <p class="text-xs text-gray-500 mt-1">{{ modelInfo.statistical?.method }}</p>
              </div>

            <!-- Hybrid System -->
            <div class="text-center">
              <div class="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center bg-purple-100">
                <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h4 class="font-semibold text-gray-900">Hybrid System</h4>
              <p class="text-sm text-gray-600">Best of Both</p>
              <p class="text-xs text-gray-500 mt-1">AI + Statistical Fallback</p>
              </div>
            </div>
          </div>

        <!-- Charts and Data -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- 6-Month Forecast Chart -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-semibold text-gray-900">6-Month Incident Forecast</h3>
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-500">Method:</span>
                <span class="px-2 py-1 text-xs font-semibold rounded-full" 
                      :class="samplePredictionMethod === 'neural-network' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'">
                  {{ samplePredictionMethod === 'neural-network' ? 'Neural Network' : 'Statistical' }}
                </span>
              </div>
            </div>
            <div class="h-80">
              <div v-if="loading" class="h-full w-full animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded"></div>
              <canvas v-else ref="forecastChart"></canvas>
            </div>
          </div>

          <!-- Risk Distribution -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Risk Distribution</h3>
            <div class="h-80">
              <div v-if="loading" class="h-full w-full animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded"></div>
              <canvas v-else ref="riskChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Top Risk Barangays -->
        <div class="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Top Risk Barangays</h3>
          <div v-if="loading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="mt-2 text-gray-600">Loading predictions...</p>
          </div>
          <div v-else-if="topRiskBarangays.length === 0" class="text-center py-8">
            <p class="text-gray-500">No high-risk predictions available</p>
              </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="barangay in topRiskBarangays" :key="`${barangay.barangay}-${barangay.crimeType}`" 
                 class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-semibold text-gray-900">{{ barangay.barangay }}</h4>
                <span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                  {{ barangay.riskProbability }}% Risk
                </span>
              </div>
              <p class="text-sm text-gray-600 mb-2">{{ barangay.crimeType }}</p>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-500">Confidence:</span>
                <span class="font-medium">{{ barangay.confidence }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Prediction Alerts -->
        <div class="bg-white rounded-2xl border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-gray-900">Crime Prediction Alerts</h3>
            <div class="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
              {{ predictions.length }} predictions generated
            </div>
          </div>
          
          <!-- Explanation Box -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-3">
                <h4 class="text-sm font-medium text-blue-800">How to Read These Predictions</h4>
                <p class="text-sm text-blue-700 mt-1">
                  These are AI-powered forecasts showing expected crime incidents for the next 6 months. 
                  <strong>Risk Level</strong> indicates the severity, <strong>Probability</strong> shows likelihood of occurrence, 
                  and <strong>Confidence</strong> indicates prediction accuracy.
                </p>
              </div>
            </div>
          </div>

          <div v-if="loading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="mt-2 text-gray-600">Loading prediction alerts...</p>
          </div>
          <div v-else-if="predictions.length === 0" class="text-center py-8">
            <div class="text-gray-400 mb-4">
              <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <p class="text-gray-500">No prediction alerts available</p>
            <p class="text-sm text-gray-400 mt-1">Generate predictions to see crime forecasts</p>
          </div>
          <div v-else class="space-y-4">
            <div v-for="prediction in predictions.slice(0, 5)" :key="prediction._id" 
                 class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <!-- Header -->
              <div class="flex items-center justify-between mb-3">
                <div>
                  <h4 class="font-semibold text-gray-900 text-lg">{{ prediction.barangay }}</h4>
                  <p class="text-sm text-gray-600">{{ prediction.crimeType }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <span :class="getRiskBadgeClass(prediction.riskLevel)" class="px-3 py-1 text-sm font-semibold rounded-full">
                    {{ prediction.riskLevel }} Risk
                  </span>
                  <span v-if="prediction.forecast && prediction.forecast[0]?.method" 
                        :class="prediction.forecast[0].method === 'neural-network' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'"
                        class="px-2 py-1 text-xs font-semibold rounded-full">
                    {{ prediction.forecast[0].method === 'neural-network' ? '🤖 AI' : '📊 Stats' }}
                  </span>
                </div>
              </div>

              <!-- Risk Assessment -->
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="bg-gray-50 rounded-lg p-3">
                  <div class="text-xs text-gray-500 uppercase tracking-wide">Risk Probability</div>
                  <div class="text-lg font-semibold text-gray-900">{{ Math.round(prediction.probability * 100) }}%</div>
                  <div class="text-xs text-gray-500">Likelihood of occurrence</div>
                </div>
                <div class="bg-gray-50 rounded-lg p-3">
                  <div class="text-xs text-gray-500 uppercase tracking-wide">Confidence</div>
                  <div class="text-lg font-semibold text-gray-900">{{ Math.round(prediction.confidence * 100) }}%</div>
                  <div class="text-xs text-gray-500">Prediction accuracy</div>
                </div>
              </div>

              <!-- Forecast Timeline -->
              <div class="border-t pt-4">
                <div class="text-sm font-medium text-gray-700 mb-2">6-Month Forecast</div>
                <div class="grid grid-cols-6 gap-2">
                  <div v-for="(forecast, index) in prediction.forecast.slice(0, 6)" :key="index" 
                       class="text-center">
                    <div class="text-xs text-gray-500 mb-1">{{ getMonthName(forecast.month) }}</div>
                    <div class="bg-blue-50 rounded-lg p-2">
                      <div class="text-sm font-semibold text-blue-900">{{ forecast.predicted }}</div>
                      <div class="text-xs text-blue-600">incidents</div>
                    </div>
                  </div>
                </div>
                <div class="mt-3 text-xs text-gray-500">
                  Total Expected: <strong>{{ getTotalForecast(prediction.forecast) }} incidents</strong> over 6 months
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, nextTick } from 'vue';
import { useRouter } from 'vue-router';
// @ts-ignore
import Navigation from '../components/Navigation.vue'
import { onAuthStateChange } from '../services/auth'
import axios from 'axios';
import Chart from 'chart.js/auto';
// @ts-ignore
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

const router = useRouter()

// Reactive data
const loading = ref(false)
const summary = reactive({
  totalPredictions: 0,
  riskDistribution: { high: 0, medium: 0, low: 0 },
  avgConfidence: 0,
  avgPredictedChange: 0,
  topRiskBarangays: []
})

const predictions = ref<any[]>([])
const topRiskBarangays = ref<any[]>([])
const lastUpdated = ref('')
const modelInfo = ref<any>({})
const samplePredictionMethod = ref('statistical')
const isRetraining = ref(false)

// Chart refs
const forecastChart = ref<HTMLCanvasElement | null>(null)
const riskChart = ref<HTMLCanvasElement | null>(null)
let forecastChartInstance: Chart | null = null
let riskChartInstance: Chart | null = null

// Methods
const fetchData = async () => {
  loading.value = true
  try {
    const [summaryResponse, predictionsResponse, modelResponse] = await Promise.all([
      axios.get(`${API_BASE}/predict/summary`),
      axios.get(`${API_BASE}/predict/predictions?limit=10`),
      axios.get(`${API_BASE}/predict/model/performance`)
    ])

    Object.assign(summary, summaryResponse.data)
    predictions.value = predictionsResponse.data.predictions
    topRiskBarangays.value = summaryResponse.data.topRiskBarangays || []
    modelInfo.value = modelResponse.data
    lastUpdated.value = new Date().toLocaleDateString()
    
    // Set sample prediction method for display
    if (predictions.value.length > 0 && predictions.value[0].forecast) {
      samplePredictionMethod.value = predictions.value[0].forecast[0]?.method || 'statistical'
    }
    // Ensure canvases are in DOM before (re)rendering charts
    loading.value = false
    await nextTick()
    renderCharts()
  } catch (error) {
    console.error('Error fetching predictive data:', error)
    loading.value = false
  }
}

const retrainModel = async () => {
  isRetraining.value = true
  try {
    await axios.post(`${API_BASE}/predict/generate/predictions`)
    await fetchData() // Refresh data after retraining
  } catch (error) {
    console.error('Error retraining model:', error)
  } finally {
    isRetraining.value = false
  }
}

const renderCharts = () => {
  // Destroy existing instances to avoid leaks/overlays
  if (forecastChartInstance) {
    forecastChartInstance.destroy()
    forecastChartInstance = null
  }
  if (riskChartInstance) {
    riskChartInstance.destroy()
    riskChartInstance = null
  }

  // Forecast Chart
  if (forecastChart.value && predictions.value.length > 0) {
    const samplePrediction = predictions.value[0]
    const labels = samplePrediction.forecast.map((f: any) => {
      const date = new Date(f.month + '-01')
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    })
    const predicted = samplePrediction.forecast.map((f: any) => f.predicted)
    const lower = samplePrediction.forecast.map((f: any) => f.lower)
    const upper = samplePrediction.forecast.map((f: any) => f.upper)

    forecastChartInstance = new Chart(forecastChart.value, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Predicted',
            data: predicted,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
          },
          {
            label: 'Lower Bound',
            data: lower,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderDash: [5, 5],
            tension: 0.4
          },
          {
            label: 'Upper Bound',
            data: upper,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderDash: [5, 5],
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    })
  }

  // Risk Distribution Chart
  if (riskChart.value) {
    riskChartInstance = new Chart(riskChart.value, {
      type: 'doughnut',
      data: {
        labels: ['High Risk', 'Medium Risk', 'Low Risk'],
        datasets: [{
          data: [summary.riskDistribution.high, summary.riskDistribution.medium, summary.riskDistribution.low],
          backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    })
  }
}

const goToPredictions = () => {
  router.push({ name: 'predictions-list' })
}

const getRiskBadgeClass = (riskLevel: string) => {
  switch (riskLevel) {
    case 'High':
      return 'bg-red-100 text-red-800'
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'Low':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Helper function to get month name from YYYY-MM format
const getMonthName = (monthStr: string) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const parts = monthStr.split('-')
  if (parts.length < 2 || !parts[1]) return monthStr
  const month = parseInt(parts[1]) - 1
  return monthNames[month] || monthStr
}

// Helper function to calculate total forecast
const getTotalForecast = (forecast: any[]) => {
  return forecast.slice(0, 6).reduce((total, f) => total + (f.predicted || 0), 0)
}

onMounted(async () => {
  onAuthStateChange((user) => {
    if (!user) router.push('/signin')
  })
  
  // Set page title
  document.title = 'Predictive Analytics - Crime Prevention System'
  
  await fetchData()
  renderCharts()
})
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
<template>
  <div class="min-h-screen bg-gray-50">
    <Navigation />

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0 space-y-6">
        <!-- Page Header -->
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Crime Analytics Dashboard</h1>
            <p class="text-gray-600 mt-2">Overview of crime statistics, trends, and insights for Lubao Municipality</p>
            <div class="mt-3 flex items-center gap-4">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span class="text-sm text-gray-500">Data Period:</span>
                <span class="text-sm font-medium text-gray-700">{{ summary.dateRange?.duration || '2010 - 2024' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <span class="text-sm text-gray-500">Total Records:</span>
                <span class="text-sm font-medium text-gray-700">{{ summary.totalCrimes.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <!-- Card: Total Crimes -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6">
            <div class="flex items-start justify-between">
              <p class="text-sm font-medium text-gray-600">Total Crimes</p>
              <span class="text-blue-500">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l3-3 3 3 3-3 3 3 3-3" />
                </svg>
              </span>
            </div>
            <p class="mt-4 text-4xl font-semibold text-gray-900">{{ summary.totalCrimes }}</p>
            <p class="mt-1 text-sm text-gray-500">Total incidents recorded</p>
          </div>

          <!-- Card: Avg Crimes / Barangay -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6">
            <div class="flex items-start justify-between">
              <p class="text-sm font-medium text-gray-600">Avg Crimes / Barangay</p>
              <span class="text-green-500">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12l5 5L20 7" />
                </svg>
              </span>
            </div>
            <p class="mt-4 text-4xl font-semibold text-gray-900">{{ summary.averageCrimesPerBarangay }}</p>
            <p class="mt-1 text-sm text-gray-500">Average per barangay</p>
          </div>

          <!-- Card: Highest Crime Rate -->
          <div class="bg-red-500 rounded-2xl border border-gray-200 p-6">
            <div class="flex items-start justify-between">
              <p class="text-sm font-medium text-gray-50">Highest Crime Rate</p>
              <span class="text-gray-50">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
            </div>
            <p class="mt-4 text-4xl font-semibold text-gray-50">{{ summary.highestCrimeRate?.rate ?? 0 }}</p>
            <p class="mt-1 text-sm text-gray-50">{{ summary.highestCrimeRate?.barangay }}</p>
          </div>

          <!-- Card: Low Crime Rate Count -->
          <div class="bg-green-500 rounded-2xl border border-gray-200 p-6">
            <div class="flex items-start justify-between">
              <p class="text-sm font-medium text-white">Low Crime Rate </p>
              <span class="text-white">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8c-1.657 0-3 1.343-3 3v7h6v-7c0-1.657-1.343-3-3-3z" />
                </svg>
              </span>
            </div>
            <p class="mt-4 text-4xl font-semibold text-white">{{ lowRateCount }}</p>
            <p class="mt-1 text-sm text-white">Barangays under threshold</p>
          </div>
        </div>

        <!-- Rankings -->
        <div class="grid grid-cols-2 gap-6">
          <!-- Top 5 Highest Incidents styled list -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 class="text-xl font-semibold text-gray-900">Top 5 Barangays - Highest Incidents</h3>
            <p class="text-sm text-gray-500 mb-4">Barangays requiring priority attention</p>
            <ul class="space-y-4">
              <li v-for="(row, idx) in topCount" :key="row.barangay"
                class="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div class="flex items-center gap-4">
                  <div
                    :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold', idx===0?'bg-rose-100 text-rose-600': idx===1?'bg-orange-100 text-orange-600': idx===2?'bg-yellow-100 text-yellow-700':'bg-blue-100 text-blue-600']">
                    {{ idx+1 }}</div>
                  <div>
                    <p class="text-base font-semibold text-gray-900">Barangay {{ row.barangay }}</p>
                    <p class="text-sm text-gray-500">Population: {{ row.population?.toLocaleString?.() ?? '—' }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-xl font-semibold text-gray-900">{{ row.crimeCount }}</p>
                  <p class="text-xs text-gray-500">incidents</p>
                </div>
              </li>
            </ul>
          </div>
           <!-- Charts -->
           <div class="grid">
             <div class="bg-white rounded-2xl border border-gray-200 p-6">
               <h3 class="text-xl font-semibold text-gray-900">Crime Types Distribution</h3>
               <p class="text-sm text-gray-500 mb-6">Breakdown of crime types by percentage</p>
               <div class="grid grid-cols-1  gap-6 items-center">
                 <div class="mx-auto max-w-[380px]">
                   <canvas ref="typeChart"></canvas>
                 </div>
                 <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div v-for="(item, idx) in typeLegend" :key="item.label" class="flex items-center gap-3">
                     <span :style="{ backgroundColor: item.color }" class="inline-block w-3.5 h-3.5 rounded-full"></span>
                     <span class="text-sm text-gray-700">{{ item.label }}: <span class="font-medium">{{ item.percent }}%</span></span>
                   </div>
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
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router'
// @ts-ignore
import Navigation from '../components/Navigation.vue'
import { onAuthStateChange } from '../services/auth'
import axios from 'axios';
import Chart from 'chart.js/auto';
// @ts-ignore
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

const summary = reactive({
  totalCrimes: 0,
  averageCrimesPerBarangay: 0,
  highestCrimeCount: { barangay: '', count: 0 },
  lowestCrimeCount: { barangay: '', count: 0 },
  highestCrimeRate: { barangay: '', rate: 0 },
  lowestCrimeRate: { barangay: '', rate: 0 },
  dateRange: { earliest: null, latest: null, duration: null }
});

const topCount = ref<any[]>([]);
const topRate = ref<any[]>([]);
const distribution = ref<any[]>([]);
const countChart = ref<HTMLCanvasElement | null>(null);
const topCountChart = ref<HTMLCanvasElement | null>(null);
// removed line chart for topRate
const typeChart = ref<HTMLCanvasElement | null>(null);
const typeDist = ref<any[]>([]);
const typeLegend = ref<{ label: string; percent: number; color: string }[]>([]);
const barangayCounts = reactive({ totalBarangays: 0, withPopulation: 0, withCrimes: 0 });
const LOW_RATE_THRESHOLD = 1; // crimes per 1000 residents
const lowRateCount = ref<number>(0);

async function fetchData() {
  const [s, tc, tr, dist, bc, lr, types] = await Promise.all([
    axios.get(`${API_BASE}/analytics/descriptive/summary`),
    axios.get(`${API_BASE}/analytics/descriptive/top/barangays/crime-count`),
    axios.get(`${API_BASE}/analytics/descriptive/top/barangays/crime-rate`),
    axios.get(`${API_BASE}/analytics/descriptive/distribution`),
    axios.get(`${API_BASE}/analytics/descriptive/barangays/count`),
    axios.get(`${API_BASE}/analytics/descriptive/low/barangays/crime-rate`, { params: { threshold: LOW_RATE_THRESHOLD } }),
    axios.get(`${API_BASE}/analytics/descriptive/types/distribution`)
  ]);
  Object.assign(summary, s.data);
  topCount.value = tc.data;
  topRate.value = tr.data;
  distribution.value = dist.data;
  Object.assign(barangayCounts, bc.data);
  lowRateCount.value = Array.isArray(lr.data) ? lr.data.length : 0;
  typeDist.value = (types.data || []).slice(0, 5);
}

function renderCharts() {
  if (countChart.value && distribution.value.length) {
    const labels = distribution.value.map((d: any) => d.barangay);
    const data = distribution.value.map((d: any) => d.count);
    new Chart(countChart.value, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Crimes', data, backgroundColor: '#3b82f6' }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { x: { ticks: { autoSkip: false, maxRotation: 45, minRotation: 0 } } }
      }
    });
  }

  // Doughnut for top 5 crime counts
  if (topCountChart.value && topCount.value.length) {
    const labels2 = topCount.value.map((t: any) => t.barangay);
    const data2 = topCount.value.map((t: any) => t.crimeCount);
    const colors = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6'];
    new Chart(topCountChart.value, {
      type: 'doughnut',
      data: {
        labels: labels2,
        datasets: [{ data: data2, backgroundColor: colors }]
      },
      options: { responsive: true }
    });
  }

  // removed line chart rendering

  // Pie for crime type distribution
  if (typeChart.value && typeDist.value.length) {
    const labels4 = typeDist.value.map((t: any) => t.type);
    const data4 = typeDist.value.map((t: any) => t.count);
    const total = data4.reduce((a: number, b: number) => a + b, 0) || 1;
    const colors4 = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6'];
    typeLegend.value = labels4.map((label: string, i: number) => ({
      label,
      percent: Math.round((data4[i] / total) * 100),
      color: colors4[i % colors4.length] ?? '#9ca3af'
    }));
    new Chart(typeChart.value, {
      type: 'doughnut',
      data: { labels: labels4, datasets: [{ data: data4, backgroundColor: colors4 }] },
      options: { responsive: true, cutout: '55%', plugins: { legend: { display: false } } }
    });
  }
}

const router = useRouter()

onMounted(async () => {
  // Set page title
  document.title = 'Crime Analytics Dashboard - Lubao Municipality'
  
  onAuthStateChange((user) => {
    if (!user) router.push('/signin')
  })
  await fetchData();
  renderCharts();
});
</script>

<style scoped>
</style>



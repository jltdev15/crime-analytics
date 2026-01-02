<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
    <Navigation />

    <main class="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
      <!-- Hero Section -->
      <div class="px-4 sm:px-0 mb-8">
        <div class="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl">
          <div class="absolute inset-0 bg-black opacity-10"></div>
          <div class="relative px-8 py-12 sm:px-12 sm:py-16">
            <div class="flex items-center justify-between flex-wrap gap-6">
              <div class="flex-1 min-w-0">
                <h1 class="text-4xl sm:text-5xl font-bold text-white mb-4">
                  AI Workflow
                </h1>
                <p class="text-xl text-blue-100 mb-6 max-w-2xl">
                  Interactive visualization of how LSTM neural networks learn from crime data and generate predictions
                </p>
                <div class="flex items-center gap-4 flex-wrap">
                  <div class="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <div class="w-3 h-3 rounded-full" :class="modelInfo?.neuralNetwork?.isTrained ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'"></div>
                    <span class="text-white text-sm font-medium">
                      {{ modelInfo?.neuralNetwork?.isTrained ? 'Model Trained' : 'Model Not Trained' }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                    </svg>
                    <span class="text-white text-sm font-medium">LSTM Architecture</span>
                  </div>
                </div>
              </div>
              <div class="hidden lg:block">
                <div class="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <svg class="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="px-4 sm:px-0 space-y-8">
        <!-- Architecture Overview Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span class="text-2xl font-bold text-blue-600">6</span>
                </div>
                <div class="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                  </svg>
                </div>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-1">Input Layer</h3>
              <p class="text-sm text-gray-600">6 neurons</p>
              <p class="text-xs text-gray-500 mt-2">Last 6 months of crime data</p>
            </div>
          </div>

          <div class="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span class="text-2xl font-bold text-purple-600">8</span>
                </div>
                <div class="text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                  </svg>
                </div>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-1">Hidden Layer</h3>
              <p class="text-sm text-gray-600">8 neurons</p>
              <p class="text-xs text-gray-500 mt-2">Pattern recognition</p>
            </div>
          </div>

          <div class="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span class="text-2xl font-bold text-indigo-600">4</span>
                </div>
                <div class="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                  </svg>
                </div>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-1">Context Layer</h3>
              <p class="text-sm text-gray-600">4 neurons</p>
              <p class="text-xs text-gray-500 mt-2">LSTM memory cells</p>
            </div>
          </div>

          <div class="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span class="text-2xl font-bold text-green-600">1</span>
                </div>
                <div class="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-1">Output Layer</h3>
              <p class="text-sm text-gray-600">1 neuron</p>
              <p class="text-xs text-gray-500 mt-2">Predicted crime count</p>
            </div>
          </div>
        </div>

        <!-- Model Performance Stats -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div class="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
            Model Performance
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-blue-700">Status</span>
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="text-2xl font-bold" :class="modelInfo?.neuralNetwork?.isTrained ? 'text-green-600' : 'text-yellow-600'">
                {{ modelInfo?.neuralNetwork?.isTrained ? 'Trained' : 'Not Trained' }}
              </div>
            </div>
            <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-purple-700">Architecture</span>
                <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              </div>
              <div class="text-xl font-bold text-gray-900">{{ modelInfo?.neuralNetwork?.architecture || 'LSTM (6-8-4-1)' }}</div>
            </div>
            <div class="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border border-indigo-200">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-indigo-700">Algorithm</span>
                <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <div class="text-sm font-bold text-gray-900">BPTT</div>
              <div class="text-xs text-gray-600 mt-1">Backpropagation Through Time</div>
            </div>
            <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-green-700">Library</span>
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <div class="text-xl font-bold text-gray-900">{{ modelInfo?.neuralNetwork?.library || 'Synaptic.js' }}</div>
            </div>
          </div>
        </div>

        <!-- Workflow Tabs -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div class="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4">
            <div class="flex space-x-1 bg-white rounded-lg p-1">
              <button
                @click="activeTab = 'training'; trainingStep = 1"
                :class="[
                  'px-6 py-2.5 rounded-md font-semibold text-sm transition-all duration-200 flex items-center gap-2',
                  activeTab === 'training'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                ]"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
                Training Workflow
              </button>
              <button
                @click="activeTab = 'prediction'; predictionStep = 1"
                :class="[
                  'px-6 py-2.5 rounded-md font-semibold text-sm transition-all duration-200 flex items-center gap-2',
                  activeTab === 'prediction'
                    ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                ]"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
                Prediction Workflow
              </button>
            </div>
          </div>

          <div class="p-8">
            <!-- Training Workflow -->
            <div v-if="activeTab === 'training'" class="space-y-8">
              <!-- Key Concept Explanation -->
              <div class="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 mb-6">
                <div class="flex items-start gap-4">
                  <div class="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <h4 class="text-lg font-bold text-gray-900 mb-2">Understanding the 6-Month Window</h4>
                    <div class="space-y-2 text-sm text-gray-700">
                      <p><strong>During Training:</strong> The model uses <strong>ALL historical data (2010-2024)</strong> to create 65 training samples. Each sample is a 6-month window from different time periods, allowing the model to learn patterns from the entire history.</p>
                      <p><strong>During Prediction:</strong> The model only needs the <strong>last 6 months</strong> because it has already learned patterns from all historical data. The 6-month window is the "lookback period" - the model architecture expects 6 inputs.</p>
                      <p class="text-xs text-gray-600 mt-3"><strong>Analogy:</strong> Like learning to drive - you practice with many different roads (training), but when driving (prediction), you only need to see the road ahead (last 6 months).</p>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Progress Bar -->
              <div class="mb-8">
                <div class="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <span class="font-medium">Step {{ trainingStep }} of {{ trainingSteps.length }}</span>
                  <span class="font-semibold">{{ Math.round((trainingStep / trainingSteps.length) * 100) }}% Complete</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    class="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    :style="{ width: `${(trainingStep / trainingSteps.length) * 100}%` }"
                  >
                    <div class="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>

              <!-- Step Content -->
              <div class="relative" v-if="currentTrainingStep">
                <!-- Enhanced Timeline -->
                <div class="absolute left-0 md:left-12 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-200 via-purple-200 to-indigo-200 hidden md:block rounded-full"></div>
                
                <div class="relative animate-fade-in">
                  <div class="flex gap-4 md:gap-8">
                    <!-- Step Icon Badge -->
                    <div class="hidden md:flex flex-shrink-0 relative z-10">
                      <div class="relative">
                        <div
                          class="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-xl transform hover:scale-110 transition-transform duration-300 border-4 border-white"
                          :class="getStepColorClass(trainingStep - 1, 'training')"
                        >
                          {{ currentTrainingStep.icon }}
                        </div>
                        <div class="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white">
                          {{ trainingStep }}
                        </div>
                      </div>
                    </div>

                    <!-- Main Content Card -->
                    <div class="flex-1 min-w-0">
                      <div
                        class="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300"
                        :class="getStepBorderClass(trainingStep - 1, 'training')"
                      >
                        <!-- Header Section with Gradient -->
                        <div class="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 px-6 md:px-8 py-6 border-b border-gray-200">
                          <div class="flex items-start justify-between gap-4">
                            <div class="flex-1">
                              <div class="flex items-center gap-3 mb-3">
                                <div class="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-xs font-bold shadow-md">
                                  STEP {{ trainingStep }} / {{ trainingSteps.length }}
                                </div>
                                <div class="md:hidden">
                                  <div
                                    class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md border-2 border-white"
                                    :class="getStepColorClass(trainingStep - 1, 'training')"
                                  >
                                    {{ currentTrainingStep.icon }}
                                  </div>
                                </div>
                              </div>
                              <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                                {{ currentTrainingStep.title }}
                              </h3>
                              <p class="text-gray-700 text-base md:text-lg leading-relaxed">
                                {{ currentTrainingStep.description }}
                              </p>
                            </div>
                          </div>
                        </div>

                        <!-- Content Section -->
                        <div class="p-6 md:p-8 space-y-6">
                          <!-- Details Grid -->
                          <div v-if="currentTrainingStep.details" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                              v-for="(detail, idx) in currentTrainingStep.details"
                              :key="idx"
                              class="group relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border-2 border-gray-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                            >
                              <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              <div class="flex items-start gap-3">
                                <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                  </svg>
                                </div>
                                <div class="flex-1 min-w-0">
                                  <div class="text-sm font-bold text-gray-900 mb-2 leading-tight">{{ detail.label }}</div>
                                  <div class="text-sm text-gray-600 leading-relaxed">{{ detail.value }}</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <!-- Code Block -->
                          <div v-if="currentTrainingStep.code" class="relative group">
                            <div class="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity"></div>
                            <div class="relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
                              <div class="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                                <div class="flex items-center gap-2">
                                  <div class="w-3 h-3 rounded-full bg-red-500"></div>
                                  <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                                  <div class="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <span class="text-xs text-gray-400 font-mono">TypeScript</span>
                              </div>
                              <div class="p-4 md:p-6 overflow-x-auto">
                                <pre class="text-sm md:text-base text-green-400 font-mono leading-relaxed"><code>{{ currentTrainingStep.code }}</code></pre>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Navigation Buttons -->
              <div class="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  @click="previousTrainingStep"
                  :disabled="trainingStep === 1"
                  class="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                  Previous
                </button>
                <button
                  @click="nextTrainingStep"
                  :disabled="trainingStep === trainingSteps.length"
                  class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg"
                >
                  Next
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Prediction Workflow -->
            <div v-if="activeTab === 'prediction'" class="space-y-8">
              <!-- Progress Bar -->
              <div class="mb-8">
                <div class="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <span class="font-medium">Step {{ predictionStep }} of {{ predictionSteps.length }}</span>
                  <span class="font-semibold">{{ Math.round((predictionStep / predictionSteps.length) * 100) }}% Complete</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    class="bg-gradient-to-r from-green-500 to-teal-500 h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    :style="{ width: `${(predictionStep / predictionSteps.length) * 100}%` }"
                  >
                    <div class="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>

              <!-- Step Content -->
              <div class="relative" v-if="currentPredictionStep">
                <!-- Enhanced Timeline -->
                <div class="absolute left-0 md:left-12 top-0 bottom-0 w-1 bg-gradient-to-b from-green-200 via-teal-200 to-emerald-200 hidden md:block rounded-full"></div>
                
                <div class="relative animate-fade-in">
                  <div class="flex gap-4 md:gap-8">
                    <!-- Step Icon Badge -->
                    <div class="hidden md:flex flex-shrink-0 relative z-10">
                      <div class="relative">
                        <div
                          class="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-xl transform hover:scale-110 transition-transform duration-300 border-4 border-white"
                          :class="getStepColorClass(predictionStep - 1, 'prediction')"
                        >
                          {{ currentPredictionStep.icon }}
                        </div>
                        <div class="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white">
                          {{ predictionStep }}
                        </div>
                      </div>
                    </div>

                    <!-- Main Content Card -->
                    <div class="flex-1 min-w-0">
                      <div
                        class="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300"
                        :class="getStepBorderClass(predictionStep - 1, 'prediction')"
                      >
                        <!-- Header Section with Gradient -->
                        <div class="bg-gradient-to-r from-green-50 via-teal-50 to-emerald-50 px-6 md:px-8 py-6 border-b border-gray-200">
                          <div class="flex items-start justify-between gap-4">
                            <div class="flex-1">
                              <div class="flex items-center gap-3 mb-3">
                                <div class="px-4 py-1.5 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full text-xs font-bold shadow-md">
                                  STEP {{ predictionStep }} / {{ predictionSteps.length }}
                                </div>
                                <div class="md:hidden">
                                  <div
                                    class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md border-2 border-white"
                                    :class="getStepColorClass(predictionStep - 1, 'prediction')"
                                  >
                                    {{ currentPredictionStep.icon }}
                                  </div>
                                </div>
                              </div>
                              <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                                {{ currentPredictionStep.title }}
                              </h3>
                              <p class="text-gray-700 text-base md:text-lg leading-relaxed">
                                {{ currentPredictionStep.description }}
                              </p>
                            </div>
                          </div>
                        </div>

                        <!-- Content Section -->
                        <div class="p-6 md:p-8 space-y-6">
                          <!-- Details Grid -->
                          <div v-if="currentPredictionStep.details" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                              v-for="(detail, idx) in currentPredictionStep.details"
                              :key="idx"
                              class="group relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border-2 border-gray-200 hover:border-green-400 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                            >
                              <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-500 to-teal-500 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              <div class="flex items-start gap-3">
                                <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-100 to-teal-100 rounded-lg flex items-center justify-center">
                                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                  </svg>
                                </div>
                                <div class="flex-1 min-w-0">
                                  <div class="text-sm font-bold text-gray-900 mb-2 leading-tight">{{ detail.label }}</div>
                                  <div class="text-sm text-gray-600 leading-relaxed">{{ detail.value }}</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <!-- Visualization Section -->
                          <div v-if="currentPredictionStep.visualization" class="relative group">
                            <div class="absolute -inset-0.5 bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity"></div>
                            <div class="relative bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-xl p-6 border-2 border-gray-200 shadow-lg">
                              <div class="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                </svg>
                                <span class="text-sm font-semibold text-gray-700">Visualization</span>
                              </div>
                              <div v-html="currentPredictionStep.visualization" class="overflow-x-auto"></div>
                            </div>
                          </div>

                          <!-- Code Block -->
                          <div v-if="currentPredictionStep.code" class="relative group">
                            <div class="absolute -inset-0.5 bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity"></div>
                            <div class="relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
                              <div class="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                                <div class="flex items-center gap-2">
                                  <div class="w-3 h-3 rounded-full bg-red-500"></div>
                                  <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                                  <div class="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <span class="text-xs text-gray-400 font-mono">TypeScript</span>
                              </div>
                              <div class="p-4 md:p-6 overflow-x-auto">
                                <pre class="text-sm md:text-base text-green-400 font-mono leading-relaxed"><code>{{ currentPredictionStep.code }}</code></pre>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Navigation Buttons -->
              <div class="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  @click="previousPredictionStep"
                  :disabled="predictionStep === 1"
                  class="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                  Previous
                </button>
                <button
                  @click="nextPredictionStep"
                  :disabled="predictionStep === predictionSteps.length"
                  class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:from-green-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg"
                >
                  Next
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- LSTM Details Button -->
            <div class="mt-8 pt-8 border-t border-gray-200">
              <button
                @click="showLSTMModal = true"
                class="w-full px-6 py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:via-indigo-700 hover:to-purple-800 transition-all font-semibold text-lg shadow-lg flex items-center justify-center gap-3"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                View Detailed LSTM Computation
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- LSTM Computation Modal -->
    <div
      v-if="showLSTMModal"
      @click.self="showLSTMModal = false"
      @keydown.esc="showLSTMModal = false"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
    >
      <div @click.stop class="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in modal-scrollbar-hidden">
        <div class="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-3xl z-9999">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-2xl font-bold mb-1">LSTM Neural Network Computation</h3>
              <p class="text-purple-100 text-sm">Detailed breakdown of how LSTM processes information</p>
            </div>
            <button @click="showLSTMModal = false" class="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <div class="p-8 space-y-8">
          <!-- LSTM Architecture -->
          <div>
            <h4 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div class="w-1 h-6 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full"></div>
              LSTM Cell Structure
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="(gate, idx) in lstmGates" :key="idx"
                   class="bg-gradient-to-br rounded-2xl p-6 shadow-lg border-2 transform hover:scale-105 transition-all"
                   :class="gate.bgClass">
                <div class="flex items-center justify-between mb-3">
                  <div class="text-2xl">{{ gate.icon }}</div>
                  <div class="text-xs font-semibold px-3 py-1 rounded-full bg-white/30 backdrop-blur-sm">{{ gate.name }}</div>
                </div>
                <div class="text-sm font-semibold mb-2" :class="gate.textClass">{{ gate.title }}</div>
                <div class="text-xs mb-3 opacity-90">{{ gate.description }}</div>
                <div class="bg-white/20 backdrop-blur-sm rounded-lg p-3 font-mono text-xs">{{ gate.formula }}</div>
              </div>
            </div>
          </div>

          <!-- Computation Steps -->
          <div>
            <h4 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div class="w-1 h-6 bg-gradient-to-b from-green-500 to-teal-500 rounded-full"></div>
              Step-by-Step Computation
            </h4>
            <div class="space-y-4">
              <div
                v-for="(step, index) in lstmComputationSteps"
                :key="index"
                class="bg-gradient-to-br rounded-xl p-6 shadow-md border-l-4 transform hover:scale-[1.02] transition-all"
                :class="getLSTMStepClass(step.type)"
              >
                <div class="flex items-start gap-4">
                  <div class="text-3xl flex-shrink-0">{{ step.icon }}</div>
                  <div class="flex-1">
                    <div class="text-lg font-bold text-gray-900 mb-2">{{ step.title }}</div>
                    <div class="text-gray-700 mb-3">{{ step.description }}</div>
                    <div v-if="step.example" class="bg-white/50 backdrop-blur-sm rounded-lg p-3 font-mono text-xs border border-gray-200">
                      {{ step.example }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Example Calculation -->
          <div class="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
            <h4 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div class="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
              Example: Predicting Next Month
            </h4>
            <div class="space-y-4">
              <div v-for="(example, idx) in exampleCalculation" :key="idx"
                   class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div class="text-sm font-semibold text-gray-900 mb-2">{{ example.label }}</div>
                <div class="text-sm text-gray-700 font-mono bg-gray-50 px-3 py-2 rounded">{{ example.value }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 rounded-b-3xl">
          <button
            @click="showLSTMModal = false"
            class="w-full px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all font-semibold shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { onAuthStateChange } from '../services/auth'
// @ts-ignore
import Navigation from '../components/Navigation.vue'
import { predictiveAPI } from '../services/api'

const router = useRouter()

const activeTab = ref<'training' | 'prediction'>('training')
const trainingStep = ref(1)
const predictionStep = ref(1)
const currentTrainingStep = computed(() => trainingSteps[trainingStep.value - 1] || null)
const currentPredictionStep = computed(() => predictionSteps[predictionStep.value - 1] || null)
const showLSTMModal = ref(false)
const modelInfo = ref<any>(null)

const lstmGates = [
  {
    name: 'FORGET',
    title: 'Forget Gate',
    description: 'Decides what information to discard from cell state',
    icon: '🗑️',
    formula: 'f_t = σ(W_f · [h_{t-1}, x_t] + b_f)',
    bgClass: 'from-purple-100 to-purple-200 border-purple-300',
    textClass: 'text-purple-700'
  },
  {
    name: 'INPUT',
    title: 'Input Gate',
    description: 'Decides what new information to store in cell state',
    icon: '➕',
    formula: 'i_t = σ(W_i · [h_{t-1}, x_t] + b_i)',
    bgClass: 'from-blue-100 to-blue-200 border-blue-300',
    textClass: 'text-blue-700'
  },
  {
    name: 'OUTPUT',
    title: 'Output Gate',
    description: 'Decides what parts of cell state to output',
    icon: '📤',
    formula: 'o_t = σ(W_o · [h_{t-1}, x_t] + b_o)',
    bgClass: 'from-green-100 to-green-200 border-green-300',
    textClass: 'text-green-700'
  },
  {
    name: 'CELL',
    title: 'Cell State',
    description: 'Long-term memory storage',
    icon: '💾',
    formula: 'C_t = f_t * C_{t-1} + i_t * C̃_t',
    bgClass: 'from-indigo-100 to-indigo-200 border-indigo-300',
    textClass: 'text-indigo-700'
  }
]

const exampleCalculation = [
  { label: 'Input: Last 6 months of crime data', value: '[5, 3, 7, 4, 6, 5]' },
  { label: 'Normalized Input', value: '[0.5, 0.0, 1.0, 0.25, 0.75, 0.5]' },
  { label: 'Forward Pass Through Layers', value: 'Input (6) → Hidden (8) → Context (4) → Output (1)' },
  { label: 'Network Output (Normalized)', value: '0.65' },
  { label: 'Denormalized Prediction', value: '5.2 crimes' },
  { label: 'Confidence', value: '82% (based on historical variance)' }
]

// Training steps (same as before, keeping the structure)
const trainingSteps = [
  {
    title: 'Data Collection',
    description: 'Gather ALL historical crime data from the database (2010-2024). The system collects every crime record with dates, locations, and crime types. This complete dataset is used to train the model, allowing it to learn patterns from the entire history.',
    icon: '📊',
    details: [
      { label: 'Total Records', value: '387 crime incidents' },
      { label: 'Time Period', value: '2010-2024 (all data used for training)' },
      { label: 'Time Series Length', value: '71 months of historical data' },
      { label: 'Why All Data?', value: 'Model learns patterns from entire history, not just recent months' }
    ]
  },
  {
    title: 'Data Normalization',
    description: 'Convert all input values to a 0-1 range to ensure the neural network can process data efficiently.',
    icon: '🔢',
    details: [
      { label: 'Formula', value: 'normalized = (value - min) / (max - min)' },
      { label: 'Example', value: 'If crimes range from 2-10, then 5 → (5-2)/(10-2) = 0.375' }
    ],
    code: 'normalizeInput(input: number[]): number[] {\n  const max = Math.max(...input);\n  const min = Math.min(...input);\n  const range = max - min || 1;\n  return input.map(v => (v - min) / range);\n}'
  },
  {
    title: 'Time Series Preparation',
    description: 'Create MANY 6-month sliding windows from ALL historical data (2010-2024). Each window uses 6 months as input to predict the next month. This creates 65 training samples from 71 months of data, allowing the model to learn patterns from different time periods.',
    icon: '📅',
    details: [
      { label: 'Window Size', value: '6 months input → 1 month output' },
      { label: 'Training Samples', value: '65 samples (from 71 months: 71-6=65)' },
      { label: 'Pattern', value: 'Sliding window across entire history' },
      { label: 'Example Windows', value: 'Months 1-6→7, 2-7→8, 3-8→9, ... 65-70→71' },
      { label: 'Why This Works', value: 'Model learns from patterns at different time periods in history' }
    ]
  },
  {
    title: 'Training Data Creation',
    description: 'Generate training pairs from ALL historical data using a sliding window. Each pair uses 6 months as input to predict the next month. This creates 65 training samples from 71 months, allowing the model to learn patterns from different periods (2010-2024).',
    icon: '🎯',
    details: [
      { label: 'Input Shape', value: '6 values (one per month)' },
      { label: 'Output Shape', value: '1 value (predicted month)' },
      { label: 'Total Pairs', value: '65 training samples from 71 months' },
      { label: 'Sliding Window', value: 'Months 1-6→7, 2-7→8, 3-8→9, ... 65-70→71' },
      { label: 'Key Point', value: 'Model learns from ENTIRE history, not just recent data' }
    ],
    code: '// Create training pairs from ALL historical data\nfor (let i = 6; i < timeSeries.length; i++) {\n  // Use 6 months as input (from any point in history)\n  const input = timeSeries.slice(i-6, i).map(d => d.count);\n  // Predict the next month\n  const output = [timeSeries[i]?.count || 0];\n  trainingData.push({ input, output });\n}\n// Result: 65 training samples from 71 months of data'
  },
  {
    title: 'Neural Network Training',
    description: 'Train the LSTM network using backpropagation through time. The network learns patterns from the training data.',
    icon: '🧠',
    details: [
      { label: 'Architecture', value: 'LSTM(6, 8, 4, 1)' },
      { label: 'Learning Rate', value: '0.01' },
      { label: 'Iterations', value: '1000 max' },
      { label: 'Error Threshold', value: '0.05' }
    ],
    code: 'const trainingOptions = {\n  rate: 0.01,\n  iterations: 1000,\n  error: 0.05,\n  cost: Trainer.cost.MSE\n};\nthis.trainer.train(normalizedData, trainingOptions);'
  },
  {
    title: 'Training Results',
    description: 'The network completes training when error falls below threshold or maximum iterations reached.',
    icon: '✅',
    details: [
      { label: 'Final Error', value: '~0.045 (99.9% improvement)' },
      { label: 'Iterations', value: '3-4 iterations' },
      { label: 'Status', value: 'Model trained and ready' },
      { label: 'Confidence', value: '80% accuracy' }
    ]
  }
]

// Prediction steps (same as before)
const predictionSteps = [
  {
    title: 'Input Preparation',
    description: 'Extract the LAST 6 months of crime data for prediction. Why only 6 months? The model was trained on 6-month windows, so it expects 6 inputs. The model has already learned patterns from ALL historical data (2010-2024) during training, so it only needs the most recent 6 months as context to make predictions.',
    icon: '📥',
    details: [
      { label: 'Data Source', value: 'Historical crime records (last 6 months only)' },
      { label: 'Input Size', value: '6 months (matches training window size)' },
      { label: 'Why Only 6 Months?', value: 'Model architecture expects 6 inputs; already learned from all history' },
      { label: 'Example', value: '[5, 3, 7, 4, 6, 5] crimes per month (most recent)' }
    ]
  },
  {
    title: 'Normalization',
    description: 'Normalize the input data to 0-1 range using the same method as training.',
    icon: '🔢',
    details: [
      { label: 'Input Values', value: '[5, 3, 7, 4, 6, 5]' },
      { label: 'Normalized', value: '[0.5, 0.0, 1.0, 0.25, 0.75, 0.5]' },
      { label: 'Formula', value: '(value - min) / (max - min)' }
    ],
    visualization: `
      <div class="flex items-center gap-3">
        <div class="flex gap-1">
          <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">5</div>
          <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">3</div>
          <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">7</div>
          <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">4</div>
          <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">6</div>
          <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">5</div>
        </div>
        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
        </svg>
        <div class="flex gap-1">
          <div class="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">0.5</div>
          <div class="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">0.0</div>
          <div class="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">1.0</div>
          <div class="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">0.25</div>
          <div class="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">0.75</div>
          <div class="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">0.5</div>
        </div>
      </div>
    `
  },
  {
    title: 'Forward Pass - Input Layer',
    description: 'The normalized input (6 values) enters the input layer of the neural network.',
    icon: '🔵',
    details: [
      { label: 'Layer Type', value: 'Input Layer' },
      { label: 'Neurons', value: '6 neurons' },
      { label: 'Input Values', value: '6 normalized monthly crime counts' }
    ]
  },
  {
    title: 'Forward Pass - Hidden Layer',
    description: 'The input is processed through 8 hidden neurons with LSTM memory cells. This is where pattern recognition happens.',
    icon: '🟣',
    details: [
      { label: 'Layer Type', value: 'Hidden Layer (LSTM)' },
      { label: 'Neurons', value: '8 neurons' },
      { label: 'Processing', value: 'Pattern recognition and feature extraction' }
    ]
  },
  {
    title: 'Forward Pass - Context Layer',
    description: 'The context layer maintains the LSTM memory state, remembering important patterns from previous inputs.',
    icon: '🟦',
    details: [
      { label: 'Layer Type', value: 'Context Layer (LSTM Memory)' },
      { label: 'Neurons', value: '4 neurons' },
      { label: 'Purpose', value: 'Long-term memory storage' }
    ]
  },
  {
    title: 'Forward Pass - Output Layer',
    description: 'The final layer produces a single normalized output value representing the predicted crime count.',
    icon: '🟢',
    details: [
      { label: 'Layer Type', value: 'Output Layer' },
      { label: 'Neurons', value: '1 neuron' },
      { label: 'Output', value: 'Normalized prediction (0-1 range)' }
    ]
  },
  {
    title: 'Denormalization',
    description: 'Convert the normalized output back to the original scale (actual crime count).',
    icon: '📊',
    details: [
      { label: 'Normalized Output', value: '0.65' },
      { label: 'Formula', value: 'predicted = normalized × range + min' },
      { label: 'Denormalized', value: '5.2 crimes' }
    ],
    code: 'denormalizeOutput(normalized: number): number {\n  const max = Math.max(...historicalCounts);\n  const min = Math.min(...historicalCounts);\n  const range = max - min || 1;\n  return normalized * range + min;\n}'
  },
  {
    title: 'Confidence Calculation',
    description: 'Calculate prediction confidence based on how close the prediction is to historical patterns.',
    icon: '📈',
    details: [
      { label: 'Method', value: 'Based on historical variance' },
      { label: 'Formula', value: 'confidence = 1 - (distance_from_mean / (mean × 2))' },
      { label: 'Example Confidence', value: '82%' }
    ]
  },
  {
    title: 'Sliding Window Update',
    description: 'Update the input window by removing the oldest month and adding the new prediction for the next forecast.',
    icon: '🔄',
    details: [
      { label: 'Old Window', value: '[5, 3, 7, 4, 6, 5]' },
      { label: 'New Prediction', value: '5.2' },
      { label: 'Updated Window', value: '[3, 7, 4, 6, 5, 5.2]' }
    ],
    code: 'updateSlidingWindow(currentInput: number[], newValue: number) {\n  const updated = [...currentInput];\n  updated.shift(); // Remove first\n  updated.push(newValue); // Add new\n  return updated;\n}'
  },
  {
    title: 'Final Forecast',
    description: 'Repeat the process for 6 months to generate a complete forecast. Each month uses the previous prediction as input.',
    icon: '🎯',
    details: [
      { label: 'Forecast Period', value: '6 months ahead' },
      { label: 'Method', value: 'Recursive prediction' },
      { label: 'Output', value: 'Array of 6 monthly predictions with confidence scores' }
    ]
  }
]

const lstmComputationSteps = [
  {
    type: 'forget',
    title: 'Forget Gate',
    description: 'Decides what information to discard from the cell state. Uses sigmoid activation to output values between 0 and 1.',
    icon: '🗑️',
    example: 'f_t = σ(W_f · [h_{t-1}, x_t] + b_f)\nOutput: [0.2, 0.8, 0.1, 0.9]\nMeaning: Keep 80% of memory 2, 90% of memory 4'
  },
  {
    type: 'input',
    title: 'Input Gate',
    description: 'Decides what new information to store in the cell state. Has two parts: sigmoid (what to update) and tanh (candidate values).',
    icon: '➕',
    example: 'i_t = σ(W_i · [h_{t-1}, x_t] + b_i)\nC̃_t = tanh(W_C · [h_{t-1}, x_t] + b_C)\nNew info: [0.3, 0.7, 0.2, 0.6]'
  },
  {
    type: 'cell',
    title: 'Update Cell State',
    description: 'Combine forget gate and input gate to update the cell state (long-term memory).',
    icon: '💾',
    example: 'C_t = f_t * C_{t-1} + i_t * C̃_t\nOld state: [0.5, 0.3, 0.8, 0.2]\nNew state: [0.1, 0.24, 0.16, 0.18]'
  },
  {
    type: 'output',
    title: 'Output Gate',
    description: 'Decides what parts of the cell state to output as the hidden state (short-term memory).',
    icon: '📤',
    example: 'o_t = σ(W_o · [h_{t-1}, x_t] + b_o)\nh_t = o_t * tanh(C_t)\nHidden state: [0.4, 0.6, 0.3, 0.7]'
  }
]

const getStepColorClass = (index: number, type: 'training' | 'prediction') => {
  if (type === 'training') {
    const colors = ['bg-blue-100', 'bg-purple-100', 'bg-indigo-100', 'bg-pink-100', 'bg-cyan-100', 'bg-green-100']
    return colors[index % colors.length]
  } else {
    const colors = ['bg-green-100', 'bg-teal-100', 'bg-emerald-100', 'bg-lime-100', 'bg-cyan-100', 'bg-blue-100', 'bg-indigo-100', 'bg-purple-100', 'bg-pink-100', 'bg-rose-100', 'bg-orange-100']
    return colors[index % colors.length]
  }
}

const getStepBorderClass = (index: number, type: 'training' | 'prediction') => {
  if (type === 'training') {
    return 'border-blue-200'
  } else {
    return 'border-green-200'
  }
}

const getDetailBorderClass = (index: number, type?: 'training' | 'prediction') => {
  if (type === 'prediction') {
    return 'border-green-400'
  }
  return 'border-blue-400'
}

const getLSTMStepClass = (type: string) => {
  const classes: Record<string, string> = {
    forget: 'from-purple-50 to-purple-100 border-purple-400',
    input: 'from-blue-50 to-blue-100 border-blue-400',
    output: 'from-green-50 to-green-100 border-green-400',
    cell: 'from-indigo-50 to-indigo-100 border-indigo-400'
  }
  return classes[type] || 'from-gray-50 to-gray-100 border-gray-400'
}

const nextTrainingStep = () => {
  if (trainingStep.value < trainingSteps.length) {
    trainingStep.value++
  }
}

const previousTrainingStep = () => {
  if (trainingStep.value > 1) {
    trainingStep.value--
  }
}

const nextPredictionStep = () => {
  if (predictionStep.value < predictionSteps.length) {
    predictionStep.value++
  }
}

const previousPredictionStep = () => {
  if (predictionStep.value > 1) {
    predictionStep.value--
  }
}

const fetchModelPerformance = async () => {
  try {
    const response = await predictiveAPI.getModelPerformance()
    modelInfo.value = response.data
  } catch (error) {
    console.error('Error fetching model performance:', error)
    modelInfo.value = {
      neuralNetwork: {
        isTrained: false,
        architecture: 'LSTM (6-8-4-1)',
        algorithm: 'Backpropagation Through Time',
        library: 'Synaptic.js'
      }
    }
  }
}

onMounted(async () => {
  onAuthStateChange((user) => {
    if (!user) router.push('/signin')
  })
  
  document.title = 'AI Workflow - Crime Prevention System'
  
  await fetchModelPerformance()
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

.animate-scale-in {
  animation: scaleIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Hide scrollbar for modal while keeping scroll functionality */
.modal-scrollbar-hidden {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.modal-scrollbar-hidden::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
</style>

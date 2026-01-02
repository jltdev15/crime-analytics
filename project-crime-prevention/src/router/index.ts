import { createRouter, createWebHistory } from 'vue-router'
import SignIn from '../views/SignIn.vue'
import DescriptiveAnalytics from '../views/DescriptiveAnalytics.vue'
import CrimeSearch from '../views/CrimeSearch.vue'
import IncidentMap from '../views/IncidentMap.vue'
import Predictive from '../views/Predictive.vue'
import PredictionsList from '../views/PredictionsList.vue'
import Prescriptive from '../views/Prescriptive.vue'
import AIWorkflow from '../views/AIWorkflow.vue'
import DataManagement from '../views/DataManagement.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/analytics'
    },
    {
      path: '/signin',
      name: 'signin',
      component: SignIn
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DescriptiveAnalytics,
      meta: { requiresAuth: true }
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: DescriptiveAnalytics,
      meta: { requiresAuth: true }
    },
    {
      path: '/crime-search',
      name: 'crime-search',
      component: CrimeSearch,
      meta: { requiresAuth: true }
    },
    {
      path: '/incident-map',
      name: 'incident-map',
      component: IncidentMap,
      meta: { requiresAuth: true }
    },
    {
      path: '/predictive',
      name: 'predictive',
      component: Predictive,
      meta: { requiresAuth: true }
    },
    {
      path: '/predictions',
      name: 'predictions-list',
      component: PredictionsList,
      meta: { requiresAuth: true }
    },
    {
      path: '/prescriptive',
      name: 'prescriptive',
      component: Prescriptive,
      meta: { requiresAuth: true }
    },
    {
      path: '/ai-workflow',
      name: 'ai-workflow',
      component: AIWorkflow,
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'data-management',
      component: DataManagement,
      meta: { requiresAuth: true }
    }
  ],
})

export default router

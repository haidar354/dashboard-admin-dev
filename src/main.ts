import { createApp } from 'vue'
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify'

import App from '@/App.vue'
import { registerPlugins } from '@core/utils/plugins'

// Styles
import '@core/scss/template/index.scss'
import '@styles/styles.scss'
import 'vue3-toastify/dist/index.css'

import '@/utils/apiModelClient'

// Create vue app
const app = createApp(App)

app.use(Vue3Toastify, {
  autoClose: 3000,
} as ToastContainerOptions)

// Register plugins
registerPlugins(app)

// Mount vue app
app.mount('#app')

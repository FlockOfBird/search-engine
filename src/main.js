/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

import axios from 'axios'

// Plugins
import { registerPlugins } from '@/plugins'

const app = createApp(App)
app.config.globalProperties.axios=axios
app.component('VueDatePicker', VueDatePicker);
registerPlugins(app)

app.mount('#app')

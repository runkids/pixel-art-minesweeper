import './assets/global.scss'
import 'nes.css/css/nes.min.css'

import App from './App.vue'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.mount('#app')

import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from '@/router'
import { createPinia } from 'pinia'
import Varlet from '@varlet/ui'
import {
    TextMessage
  } from './views/components/message'
  
  

  
  
import '@varlet/ui/es/style'
const app = createApp(App)
const pinia = createPinia()
app.use(ElementPlus)
app.use(pinia)
app.use(router)
app.use(Varlet)
app.component(TextMessage.name, TextMessage) 
app.mount('#app')
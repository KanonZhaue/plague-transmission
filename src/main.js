import { createApp } from 'vue'
import naive from 'naive-ui'
import App from './App.vue'
// import Vuetify from 'vuetify'
// import "vuetify/dist/vuetify.min"
const app=createApp(App)
app.use(naive)
// app.use(Vuetify)
app.mount('#app')

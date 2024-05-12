import Vue from 'vue'
import App from './App.vue'
import ChangbaMusicPlugin from '../../dist'

Vue.config.productionTip = false
Vue.use(ChangbaMusicPlugin)

new Vue({
  render: h => h(App),
}).$mount('#app')

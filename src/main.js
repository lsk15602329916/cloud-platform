import Vue from 'vue'
import './plugins/axios'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false
Vue.mixin({
  methods: {
    saveItem(key, value) {
      window.sessionStorage.setItem(key, value)
      return this
    },
    getItem(key) {
      return window.sessionStorage.getItem(key) || undefined
    },
    removeItem(key) {
      window.sessionStorage.removeItem(key);
      return this
    }
  }
})

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')

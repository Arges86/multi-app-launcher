import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  // mode: process.env.IS_ELECTRON ? 'hash' : 'history',
  // mode: process.env.NODE_ENV === 'development' ? 'hash' : 'history',
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: require('@/components/LandingPage').default
    },
    {
      path: '/info',
      name: 'app-info',
      component: require('@/components/AppInfo').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

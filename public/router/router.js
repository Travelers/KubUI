import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuetify from 'vuetify'
import HomeView from '../components/HomeView.vue'
import ListView from '../components/ListView.vue'
import CreateView from '../components/CreateView.vue'
import LogView from '../components/LogView.vue'
import DeleteView from '../components/DeleteView.vue'
import DetailView from '../components/DetailView.vue'

Vue.use(VueRouter)
Vue.use(Vuetify)

const router = new VueRouter({
  base: '/',
  mode: 'hash',  
  routes: [{
    path: '/',
    name: 'homeView', 
    redirect: '/jobs/list',
    component: HomeView
  }, {
    path:'/jobs/list',
    name: 'listView',
    component: ListView
  }, {
    path:'/jobs/create',
    name: 'createView',
    component: CreateView
  }, {
    path: '/logs',
    name: 'logView',
    component: LogView
  }, {
    path:'/jobs/delete',
    name: 'deleteView',
    component: DeleteView
  }, {
    path: '/jobs/:jobName',
    name: 'detailView',
    component: DetailView
  }]
})

export default router
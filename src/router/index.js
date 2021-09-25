import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Filters from '../views/Filters.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/filters',
    name: 'Filters',
    component: Filters,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;

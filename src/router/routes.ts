import { RouteRecordRaw } from 'vue-router';
import Node from 'src/pages/Node.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: 'home', component: () => import('pages/Index.vue') },
      { path: 'home-nodes', component: () => import('pages/Nodes.vue') },
      { path: 'home-hub', component: () => import('pages/Hub.vue') },
      { path: 'node', component: Node }
      // //no lazy loading version is :
      // { path: '', component: Index },
      // { path: 'dashboard', component: Dashboard }
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue'),
  },
];

export default routes;

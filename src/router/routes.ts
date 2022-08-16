import {RouteRecordRaw} from 'vue-router';
import NodeConfig from 'pages/NodeConfig.vue';
import LiveStreamGallery from 'pages/LiveStreamGallery.vue';
import AiSettings from 'pages/AiSettings.vue';
import FrTraining from 'pages/FrTraining.vue';
import AiDataGeneral from 'pages/AiDataGeneral.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {path: '', component: NodeConfig},
      {path: 'node_conf', component: NodeConfig},
      {path: 'stream_gallery', component: LiveStreamGallery},
      {path: 'ai_settings', component: AiSettings},
      {path: 'fr_training', component: FrTraining},
      {path: 'ai_data', component: AiDataGeneral}
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

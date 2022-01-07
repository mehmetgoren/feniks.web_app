import { boot } from 'quasar/wrappers';

// @ts-ignore
import Vue3VideoPlayer from '@cloudgeek/vue3-video-player';


export default boot(({ app }) => {
  app.use(Vue3VideoPlayer);
});

export { Vue3VideoPlayer };

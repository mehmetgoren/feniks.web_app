import { boot } from 'quasar/wrappers';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Vue3VideoPlayer from '@cloudgeek/vue3-video-player'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// import HLSCore from '@cloudgeek/playcore-hls'


export default boot(({ app }) => {
  // app.component('Vue3VideoPlayer', Vue3VideoPlayer)
  // app.component('hlc-core', HLSCore)
  app.use(Vue3VideoPlayer)
  // app.use(HLSCore)
});

export { Vue3VideoPlayer };

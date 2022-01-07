<template>
  <div>
    <Vue3VideoPlayer v-if='src' :title='"test title"' :core='HLSCore' :src='src' :muted='true' :autoplay='true'
                     :preload='"metadata"'></Vue3VideoPlayer>
    <!--    <Vue3VideoPlayer :title='"test title"' :core="HLSCore" src="http://localhost:2072/livestream/stream.m3u8" :muted='true' :autoplay='true' :preload='"metadata"'></Vue3VideoPlayer>-->

  </div>
</template>

<script lang='ts'>
import {
  onMounted, ref
} from 'vue';
import { useQuasar } from 'quasar';
// @ts-ignore
import HLSCore from '@cloudgeek/playcore-hls';
import '@cloudgeek/vue3-video-player/dist/vue3-video-player.css';
import { WsConnection } from 'src/utils/ws/connection';
import { StreamingEvent } from 'src/utils/entities';

export default {
  name: 'LiveStream',
  setup() {
    const $q = useQuasar();
    const src = ref<string>('');

    const showNotify = (msg: string) => {
      const position = 'bottom-right';
      $q.notify({
        position,
        message: msg,
        color: 'primary',
        avatar: 'https://cdn.quasar.dev/img/boy-avatar.png',
        actions: [
          {
            label: 'Dismiss', color: 'white', handler: () => { /* ... */
            }
          }
        ]
      });
    };
    onMounted(() => {
      new WsConnection('wsstreaming', (event: MessageEvent) => {
        const source: StreamingEvent = JSON.parse(event.data);
        showNotify(JSON.stringify(source));
        console.warn(typeof source);
        console.warn(source);
        console.log(JSON.stringify(source));
        console.error(source.output_file);
        //:src="http://localhost:2072/livestream/stream.m3u8"
        src.value = 'http://localhost:2072/livestream/' + source.output_file;
      });
    });
    return {
      HLSCore,
      src
    };
  }
};
</script>

<style scoped>

</style>

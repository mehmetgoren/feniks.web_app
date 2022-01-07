<template>
  <StreamPlayer1 :src='src' />
</template>

<script lang='ts'>
import {
  onMounted, ref
} from 'vue';
import { useQuasar } from 'quasar';
import { WsConnection } from 'src/utils/ws/connection';
import { StreamingEvent } from 'src/utils/entities';
import StreamPlayer1 from 'components/StreamPlayer1.vue';

export default {
  name: 'LiveStream',
  components: {
    StreamPlayer1
  },
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

    // const playerOptions = ref();
    onMounted(() => {
      new WsConnection('wsstreaming', (event: MessageEvent) => {
        const source: StreamingEvent = JSON.parse(event.data);
        showNotify(JSON.stringify(source));
        console.warn(typeof source);
        console.warn(source);
        console.warn('http://localhost:2072/livestream/' + source.output_file)
        // console.log(JSON.stringify(source));
        // console.error(source.output_file);
        //:src="http://localhost:2072/livestream/stream.m3u8"
        src.value = 'http://localhost:2072/livestream/' + source.output_file;
      });
    });

    return {
      src,
    };
  }
};
</script>

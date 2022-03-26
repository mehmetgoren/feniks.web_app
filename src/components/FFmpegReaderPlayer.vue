<template>
  <img :src='src' alt='video'/>
</template>

<script lang='ts'>
import { onMounted, onUnmounted, ref } from 'vue';
import { WsConnection } from 'src/utils/ws/connection';
import { SubscribeService } from 'src/utils/services/websocket-services';

export default {
  name: 'FFmpegReaderPlayer',
  props: {
    sourceId: {
      type: String,
      default: '',
      required: true
    }
  },
  setup(props: any) {
    const subscribeService = new SubscribeService();
    let conn: WsConnection | null = null;
    const src = ref<string>('');

    onMounted(() => {
      conn = subscribeService.subscribeFFmpegRead((evt: MessageEvent) => {
        const data = JSON.parse(evt.data);
        if (data.source === props.sourceId) {
          src.value = `data:image/jpg;base64, ${data.img}`;
        }
      });
    });

    onUnmounted(() => {
      if (conn) {
        conn.close();
      }
    });

    return {
      src
    };
  },
  methods:{
    pause(){
      //do nothing
    }
  }
};
</script>

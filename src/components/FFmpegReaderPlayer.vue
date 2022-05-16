<template>
  <img :id='"ffrp_" + sourceId' :src='src' alt='video' :width='width' :height='height' />
</template>

<script lang='ts'>
import { onMounted, onUnmounted, ref } from 'vue';
import { WsConnection } from 'src/utils/ws/connection';
import { SubscribeService } from 'src/utils/services/websocket_services';
import { NodeService } from 'src/utils/services/node_service';

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
    const width = ref<number>(640);
    const height = ref<number>(360);

    const nodeService = new NodeService();

    function getParent(elem: any) {
      return elem.parentElement;
    }

    onMounted(async () => {
      if (props.sourceId.length > 0) {
        const stream = await nodeService.getStream(props.sourceId);
        if (stream) {
          width.value = stream.ffmpeg_reader_width;
          height.value = stream.ffmpeg_reader_height;
        }

        conn = subscribeService.subscribeFFmpegRead(props.sourceId, (evt: MessageEvent) => {
          const data = JSON.parse(evt.data);
          src.value = `data:image/jpg;base64, ${data.img}`;
        });

        setTimeout(() => {
          const parent = getParent(document.getElementById('ffrp_' + props.sourceId));
          function outputSize() {
            width.value = parent.offsetWidth;
            height.value = parent.offsetHeight-90;
          }
          outputSize();
          new ResizeObserver(outputSize).observe(parent);
        }, 100);
      }
    });

    onUnmounted(() => {
      if (conn) {
        conn.close();
      }
    });

    return {
      src, width, height
    };
  },
  methods: {
    pause() {
      //do nothing
    }
  }
};
</script>

<template>
  <div style='width: 100%;height: 100%;margin-bottom: -85px;' @mouseover="onMouseOver" @mouseleave="onMouseLeave">
    <img :id='"ffrp_" + sourceId' :src='src' alt='video' :width='width' :height='height' class="container_img"/>
  </div>
</template>

<script lang='ts'>
import {onMounted, onUnmounted, ref} from 'vue';
import {WsConnection} from 'src/utils/ws/connection';
import {SubscribeService} from 'src/utils/services/websocket_services';
import {NodeService} from 'src/utils/services/node_service';
import {LocalService} from 'src/utils/services/local_service';

export default {
  name: 'FFmpegReaderPlayer',
  emits: ['user-activity'],
  props: {
    sourceId: {
      type: String,
      default: '',
      required: true
    }
  },
  //@ts-ignore
  setup(props: any, {emit}) {
    let conn: WsConnection | null = null;
    const src = ref<string>('');
    const width = ref<number>(640);
    const height = ref<number>(360);
    const nodeService = new NodeService();
    let block = false;

    function getParent(elem: any) {
      return elem.parentElement;
    }

    onMounted(async () => {
      const ls = new LocalService();
      const subscribeService = new SubscribeService(await ls.getNodeIP(), await ls.getNodePort());
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
            height.value = parent.offsetHeight - 90;
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
      src, width, height,
      onMouseOver() {
        emit('user-activity', {sourceId: props.sourceId, userActive: true});
      },
      onMouseLeave() {
        if (block) return;
        block = true;
        setTimeout(() => {
          emit('user-activity', {sourceId: props.sourceId, userActive: false});
          block = false;
        }, 3000);
      }
    };
  },
  methods: {
    pause() {
      //do nothing
    }
  }
};
</script>
<style scoped>
.container_img {
  height: 100%;
  width: 100%;
  object-fit: cover;
}
</style>

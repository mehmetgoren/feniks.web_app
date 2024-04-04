<template>
  <div style='width: 100%;height: 100%;' @mouseover="onMouseOver" @mouseleave="onMouseLeave">
    <img :id='"ffrp_" + sourceId' :src='src' alt='video' :width='width' :height='height' class="container_img" />
  </div>
</template>

<script lang='ts' setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { WsConnection } from 'src/utils/ws/connection';
import { SubscribeService } from 'src/utils/services/websocket_services';
import { NodeService } from 'src/utils/services/node_service';

const emit = defineEmits(['user-activity']);

const props = defineProps({
  sourceId: {
    type: String,
    default: '',
    required: true
  }
});

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
  const subscribeService = new SubscribeService();
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

function onMouseOver() {
  emit('user-activity', { sourceId: props.sourceId, userActive: true });
}

function onMouseLeave() {
  if (block) return;
  block = true;
  setTimeout(() => {
    emit('user-activity', { sourceId: props.sourceId, userActive: false });
    block = false;
  }, 3000);
}

</script>
<style scoped>
.container_img {
  height: 100%;
  width: 100%;
  object-fit: cover;
}
</style>

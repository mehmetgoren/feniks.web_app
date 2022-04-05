<template>
  <q-input color="grey-3" label-color="orange" v-model="zoneCoordinates" label="Zone Coordinates" readonly>
    <template v-slot:prepend>
      <q-icon name="format_shapes" color="amber" />
    </template>
  </q-input>
  <q-space style='margin: 5px;'></q-space>
  <div v-if='source.snapshot_enabled' class='absolute' :style="{width: width + 'px', height: height + 'px'}" @click='handleClick'>
    <img alt='no image' :width='width' :height='height' :src="'data:image/png;base64, ' + base64Image">
    <div class='absolute inset-0 right-0 bottom-0' style='inset: -20px;'>
      <div v-for='(dot, index) in dots' :key='index' :id="'dotDiv' + index" class='bg-gray-900 rounded-full absolute z-20' draggable='true'
           @contextmenu='handleRightClick(dot, $event)'
           :style='dot' @dragstart='handleDragStart(dot, $event)' @dragend='handleDragEnd(dot, $event)' @drag='handleDragging(dot, $event)' />
      <div class='absolute inset-0 right-0 bottom-0'></div>
      <svg width='100%' height='100%' class='absolute pointer-events-none' style='inset: 20px;'>
        <g>
          <polyline :points='points' fill='rgba(244,0,0,0.5)'></polyline>
        </g>
      </svg>
    </div>
    <q-inner-loading v-if='loadingObject' :showing='true'>
      <q-spinner size='25%' color='amber' />
    </q-inner-loading>
  </div>
  <div v-else>
    <label class='blink_me'>AI Service is not available.</label>
  </div>
</template>

<script lang='ts'>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { LocalService } from 'src/utils/services/local_service';
import { SourceModel } from 'src/utils/models/source_model';
import { NodeService } from 'src/utils/services/node_service';
import { PublishService, SubscribeService } from 'src/utils/services/websocket_services';
import { EditorImageResponseModel } from 'src/utils/entities';
import { WsConnection } from 'src/utils/ws/connection';
import { createEmptyBase64Image, isNullOrEmpty } from 'src/utils/utils';
import { nanoid } from 'nanoid';
import { useStore } from 'src/store';

export default {
  name: 'MaskEditor',
  props: {
    odModel: {
      type: Object,
      required: true
    },
    separator:{
      type: String,
      required: true
    }
  },
  emits: ['zone-coordinates-changed'],
  //@ts-ignore
  setup(props: any, { emit }) {
    const $store = useStore();
    const dense = computed(() => $store.getters['settings/dense']);
    const nodeService = new NodeService();
    const localService = new LocalService();
    const publishService = new PublishService();
    const subscribeService = new SubscribeService();
    const source = ref<SourceModel>(localService.createEmptySource());
    const width = ref<number>(1280);
    const height = ref<number>(720);
    const dots = ref<Dot[]>([]);
    const points = ref<string>('');
    const zoneCoordinates = ref<string>();
    const drawService = new DrawService(width.value, height.value);
    let connTakeScreenshot: WsConnection | null = null;
    const base64Image = ref<string>(createEmptyBase64Image());
    const loadingObject = ref<boolean>(true);

    watch(dots.value, (newDots) => {
      const pts = drawService.dotsToString(newDots);
      points.value = pts
      zoneCoordinates.value = pts;
      //@ts-ignore
      emit('zone-coordinates-changed', pts.replaceAll(',', props.separator, ));
    });

    onMounted(async () => {
      const sourceId = props.odModel.id;
      if (isNullOrEmpty(sourceId)) {
        return;
      }
      source.value = await nodeService.getSource(sourceId);
      if (!source.value.snapshot_enabled) {
        return;
      }
      width.value = <number>source.value.snapshot_width;
      height.value = <number>source.value.snapshot_height;

      const zoneList: string = props.odModel.zone_list;
      if (!isNullOrEmpty(zoneList)){
        const zones = zoneList.split(props.separator);
        const arr = dots.value;
        for(let j = 0; j < zones.length; j += 2){
          const left = zones[j] + 'px';
          const top = zones[j+1] + 'px';
          arr.push({id:nanoid().toString(), top, left, width: '20px', height: '20px', cursor:'pointer', opacity:1.});
        }
      }

      const maskScreenshotType = 3;
      const s = source.value;
      await publishService.publishEditor({
        id: s.id,
        brand: s.brand,
        name: s.name,
        address: s.address,
        event_type: maskScreenshotType
      });
      loadingObject.value = true;

      connTakeScreenshot = subscribeService.subscribeEditor((event: MessageEvent) => {
        const responseModel: EditorImageResponseModel = JSON.parse(event.data);
        if (responseModel.id !== sourceId || responseModel.event_type != maskScreenshotType) {
          return;
        }
        base64Image.value = responseModel.image_base64;
        loadingObject.value = false;
      });
    });

    onBeforeUnmount(() => {
      if (connTakeScreenshot) {
        connTakeScreenshot.close();
      }
    });

    function handleClick(e: any) {
      e.stopPropagation();
      e.preventDefault();
      dots.value.push(drawService.createDot(e));
    }

    function handleRightClick(dot: Dot, e: any) {
      e.preventDefault();
      const index = dots.value.findIndex(x => x.id == dot.id);
      if (index > -1) {
        dots.value.splice(index, 1);
      }
    }

    function handleDragStart(dot: Dot, e: any) {
      e.dataTransfer.effectAllowed = true;
      e.dataTransfer.setData('text', e.target.id);
      e.dataTransfer.effectAllowed = 'move';
      dot.opacity = 0.;
    }

    function handleDragEnd(dot: Dot, e: any) {
      dot.opacity = 1.;
      drawService.editDot(dot, e);
    }

    function handleDragging(dot: Dot, e: any) {
      drawService.editDot(dot, e);
      points.value = drawService.dotsToString(dots.value);
    }

    return {
      dense, source, width, height, base64Image, dots, points, loadingObject, zoneCoordinates,
      handleClick, handleRightClick, handleDragStart, handleDragEnd, handleDragging
    };
  }
};

class DrawService {
  private readonly width: number;
  private readonly height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public dotsToString(newDots: Dot[]): string {
    const parseDot = (value: string): number => {
      value = value.replace('px', '');
      return parseInt(value) - 10;
    };
    const arr = [];
    for (const dot of newDots) {
      arr.push(parseDot(dot.left));
      arr.push(parseDot(dot.top));
    }
    return arr.join(',');
  }

  public createDot(event: any): Dot {
    return {
      id: nanoid().toString(),
      top: DrawService.boundedSize(event.offsetY, this.height) + 'px',
      left: DrawService.boundedSize(event.offsetX, this.width) + 'px',
      width: '20px',
      height: '20px',
      cursor: 'pointer',
      opacity: 1.
    };
  }

  public editDot(dot: Dot, event: any) {
    const {x, y} = DrawService.reCalibrePoints(event);
    dot.top = DrawService.boundedSize(y, this.height) + 'px';
    dot.left = DrawService.boundedSize(x, this.width) + 'px';
  }

  private static reCalibrePoints(event: any): any{
    const x = Math.max(event.x - 35, 0);
    const y = Math.max(event.y - 200, 0);
    return {x, y};
  }

  private static boundedSize(offset: number, maxValue: number) {
    const inset = 10;
    offset = offset + inset;
    return Math.min(Math.max(0, Math.round(offset)), maxValue);
  }
}

interface Dot {
  id: string;
  top: string;
  left: string;
  width: string;
  height: string;
  cursor: string;
  opacity: number;
}
</script>

<style scoped>
.z-20 {
  z-index: 20;
}

.absolute {
  position: absolute;
}

.rounded-full {
  border-radius: 9999px;
}

.bg-gray-900 {
  --tw-bg-opacity: 1;
  background-color: rgba(17, 24, 39, var(--tw-bg-opacity));
}

.blink_me {
  animation: blinker 1s linear infinite;
  color: red;
  font-size: medium;
}

@keyframes blinker {
  50% {
    opacity: 0;
  }
}
</style>

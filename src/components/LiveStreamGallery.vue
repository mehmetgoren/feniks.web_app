<template>
  <div class='grid-stack' v-if='open'>
    <div class='newWidget grid-stack-item ui-draggable ui-resizable ui-resizable-autohide' v-for='source in sourceList'
         :key='source.id' gs-w='3' gs-h='2' :gs-id='source.id'>
      <div class='grid-stack-item-content'>
        <StreamPlayer :src='source.src' />
        <span>{{ source.caption }}</span>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import {
  onMounted, reactive, ref, nextTick
} from 'vue';
import { WsConnection } from 'src/utils/ws/connection';
import { StreamingEvent } from 'src/utils/entities';
import { List } from 'linqts';
import StreamPlayer from 'components/StreamPlayer.vue';
import { nanoid } from 'nanoid';
import 'gridstack/dist/gridstack.min.css';
import { GridStack } from 'gridstack';
// THEN to get HTML5 drag&drop
import 'gridstack/dist/h5/gridstack-dd-native';
import 'gridstack/dist/gridstack-h5.js';
// // OR to get legacy jquery-ui drag&drop (support Mobile touch devices, h5 does not yet)
import 'gridstack/dist/jq/gridstack-dd-jqueryui';

export default {
  name: 'LiveStreamGallery',
  components: {
    StreamPlayer
  },
  setup() {
    const open = ref<boolean>(false);
    const sourceList = reactive<Array<Source>>([]);

    onMounted(() => {
      function onMessage(event: MessageEvent) {
        const source: StreamingEvent = JSON.parse(event.data);
        const url = 'http://localhost:2072/livestream/' + source.output_file;
        if (new List<any>(sourceList).FirstOrDefault(x => x.src == url) == null) {
          sourceList.push({ src: url, id: nanoid(11), caption: source.name });
          open.value = false;
          setTimeout(() => {
            open.value = true;
            nextTick().then(() => {
              const grid = GridStack.init({
                float: true
              });
              GridStack.setupDragIn(
                '.newWidget'
              );
              grid.compact();
              console.log(JSON.stringify(sourceList));
            }).catch(console.error);
          }, 250);
        }
      }

      new WsConnection('wsstreaming', onMessage);
    });

    return {
      open,
      sourceList
    };
  }
};

interface Source {
  id: string;
  src: string;
  caption?: string | null;
  thumb?: string | null;
  size?: string | null;
  x?: any,
  y?: any,
}
</script>
<style>

.grid-stack {
  /*background: #FAFAD2;*/
  background: whitesmoke;
}

.grid-stack-item-content {
  color: #2c3e50;
  text-align: center;
  background-color: white;
}
</style>

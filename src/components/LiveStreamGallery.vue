<template>
  <div class='grid-stack' v-if='open'>
    <div class='newWidget grid-stack-item ui-draggable ui-resizable ui-resizable-autohide' v-for='source in sourceList'
         :key='source.id' gs-w='3' gs-h='2' :gs-id='source.id'>
      <div class='grid-stack-item-content' style='overflow: hidden !important;'>
        <StreamPlayer v-if='source.show' :src='source.src' :src-id='source.id' :ref='setStreamPlayers'
                      v-on:need-reload='needReload' />
        <q-separator style='margin-bottom: 5px;' />
        <SourceSettingsBar :source='source' @full-screen='onFullScreen' />
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import {
  onMounted, reactive, ref, nextTick,
  onBeforeUpdate, onUpdated
} from 'vue';
import { WsConnection } from 'src/utils/ws/connection';
import { StreamingEvent } from 'src/utils/entities';
import { List } from 'linqts';
import StreamPlayer from 'components/StreamPlayer.vue';
import SourceSettingsBar from 'components/SourceSettingsBar.vue';
import 'gridstack/dist/gridstack.min.css';
import { GridStack } from 'gridstack';
// THEN to get HTML5 drag&drop
import 'gridstack/dist/h5/gridstack-dd-native';
import 'gridstack/dist/gridstack-h5.js';
// // OR to get legacy jquery-ui drag&drop (support Mobile touch devices, h5 does not yet)
import 'gridstack/dist/jq/gridstack-dd-jqueryui';
import { useStore } from 'src/store';
// https://v3.vuejs.org/guide/migration/array-refs.html
export default {
  name: 'LiveStreamGallery',
  components: {
    StreamPlayer,
    SourceSettingsBar,
  },
  setup() {
    const $store = useStore();
    const open = ref<boolean>(false);

    //
    let streamPlayers: any[] = [];
    const setStreamPlayers = (el: any) => {
      if (el) {
        streamPlayers.push(el);
      }
    };
    onBeforeUpdate(() => {
      streamPlayers = [];
    });
    const onFullScreen = (source: Source) =>{
      const player = new List(streamPlayers).FirstOrDefault(x => x.srcId === source.id);
      if (player) {
        player.fullScreen();
      }
    };
    onUpdated(() => {
      console.log(streamPlayers);
    });
    //

    //
    const sourceList = reactive<Array<Source>>([]);
    const prevEvents: any = {};
    const needReload = (srcId: string, opName: string) => {
      let prevEvent = prevEvents[srcId];
      if (!prevEvent) {
        prevEvent = { opName: opName, count: 0 };
        prevEvents[srcId] = prevEvent;
      }
      if (prevEvent.opName === opName && prevEvent.count < 5) {
        return;
      }
      if (prevEvent.count === 5) {
        prevEvent.count = 0;
      }
      ++prevEvent.count;
      sourceList.forEach(source => {
        if (source.id === srcId) {
          console.log(srcId + ' will be reloaded');
          //@ts-ignore
          source.show = false;
          setTimeout(() => {
            source.show = true;
          }, 250);
        }
      });
    };
    //

    onMounted(() => {
      function onMessage(event: MessageEvent) {
        const source: StreamingEvent = JSON.parse(event.data);
        console.log('fcuk')
        console.log(JSON.stringify(source));
        const url = 'http://localhost:2072/livestream/' + source.output_file;
        if (new List<any>(sourceList).FirstOrDefault(x => x.src == url) == null) {
          sourceList.push({ src: url, id: source.id, name: source.name, show: true, rtsp_address: source.rtsp_address });
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
              $store.commit('settings/setSourceLoading', false);
            }).catch(console.error);
          }, 250);
        } else {
          $store.commit('settings/setSourceLoading', false);
        }
      }

      new WsConnection('wsstreaming', onMessage);
    });

    return {
      open,
      sourceList,
      needReload,
      setStreamPlayers,
      onFullScreen,
    };
  }
};

interface Source {
  id: string | null | undefined;
  rtsp_address: any
  src: string;
  show: boolean;
  name?: string | null;
  thumb?: string | null;
  size?: string | null;
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

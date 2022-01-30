<template>
  <div class='grid-stack' v-if='open'>
    <div class='newWidget grid-stack-item ui-draggable ui-resizable ui-resizable-autohide' v-for='source in sourceList'
         :key='source.id' gs-w='4' gs-h='3' :gs-id='source.id'>
      <div class='grid-stack-item-content' style='overflow: hidden !important;'>
        <HlsPlayer v-if='source.show' :src='source.src' :source-id='source.id' :ref='setStreamPlayers'
                   v-on:need-reload='needReload' />
        <q-separator style='margin-bottom: 5px;' />
        <SourceCommandBar :source='source' @full-screen='onFullScreen' @streaming-stop='onStreamingStop'
                          @connect='onConnect' @take-screenshot='onTakeScreenshot' @refresh='onRefresh' />
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import {
  onMounted, reactive, ref, nextTick,
  onBeforeUpdate, onUpdated, onBeforeUnmount
} from 'vue';
import { StreamingModel } from 'src/utils/models/streaming_model';
import { EditorImageResponseModel } from 'src/utils/entities';
import { List } from 'linqts';
import HlsPlayer from 'components/HlsPlayer.vue';
import SourceCommandBar from 'components/SourceCommandBar.vue';
import 'gridstack/dist/gridstack.min.css';
import { GridStack } from 'gridstack';
// THEN to get HTML5 drag&drop
import 'gridstack/dist/h5/gridstack-dd-native';
import 'gridstack/dist/gridstack-h5.js';
// // OR to get legacy jquery-ui drag&drop (support Mobile touch devices, h5 does not yet)
import 'gridstack/dist/jq/gridstack-dd-jqueryui';
import { useStore } from 'src/store';
import { PublishService, SubscribeService } from 'src/utils/services/websocket-services';
import { WsConnection } from 'src/utils/ws/connection';
import { startStreaming } from 'src/utils/utils';
// https://v3.vuejs.org/guide/migration/array-refs.html
export default {
  name: 'LiveStreamGallery',
  components: {
    HlsPlayer,
    SourceCommandBar
  },
  setup() {
    const $store = useStore();
    const open = ref<boolean>(false);
    const publishService = new PublishService();
    const subscribeService = new SubscribeService();
    let connStartStreaming: WsConnection | null = null;
    let connStopStreaming: WsConnection | null = null;
    let connTakeScreenshot: WsConnection | null = null;

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
    const onFullScreen = (source: Source) => {
      const player = new List(streamPlayers).FirstOrDefault(x => x.sourceId === source.id);
      if (player) {
        player.fullScreen();
      }
    };
    const onStreamingStop = (source: Source) => {
      void publishService.publishStopStreaming(source);
    };
    onUpdated(() => {
      console.log(streamPlayers);
    });
    //

    //
    const sourceList = reactive<Array<Source>>([]);
    const prevEvents: any = {};
    const needReload = (sourceId: string, opName: string) => {
      console.log('needReload called for ' + sourceId + ' ' + opName);
      let prevEvent = prevEvents[sourceId];
      if (!prevEvent) {
        prevEvent = { opName: opName, count: 0, createdAt: new Date() };
        prevEvents[sourceId] = prevEvent;
      }
      // if (prevEvent.opName === opName && prevEvent.count < 5) {
      const diff = new Date().getTime() - prevEvent.createdAt.getTime();
      prevEvent.createdAt = new Date();
      console.warn('diff: ' + diff);
      if (opName !== 'error' && diff < 1000) {
        console.log('needReload no call due to 1 second limit for ' + sourceId + ' ' + opName + '. diff: ' + diff);
        return;
      }
      // if (prevEvent.opName === opName && prevEvent.count < 5) {
      //   return;
      // }
      // if (prevEvent.count === 5) {
      //   prevEvent.count = 0;
      // }
      ++prevEvent.count;
      sourceList.forEach(source => {
        if (source.id === sourceId) {
          console.log('needReload executing for ' + sourceId + ' ' + opName);
          onRefresh(source);
        }
      });
    };

    //

    function openStartStreamingMessage(event: MessageEvent) {
      console.log('openStartStreamingMessage(event) called');
      const streamingModel: StreamingModel = JSON.parse(event.data);
      const url = 'http://localhost:2072/livestream' + streamingModel.hls_output_path;
      if (new List<any>(sourceList).FirstOrDefault(x => x.src == url) == null) {
        const source: Source = <any>streamingModel;
        source.src = url;
        source.show = true;
        sourceList.push(source);
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
            $store.commit('settings/setSourceLoading', false);
          }).catch(console.error);
        }, 250);
      } else {
        $store.commit('settings/setSourceLoading', false);
      }
    }

    function onConnect(source: Source) {
      const list = new List<any>(sourceList);
      const sourceItem = list.FirstOrDefault(x => x.src == source.src);
      list.Remove(sourceItem);
      startStreaming($store, publishService, source);
    }

    function onTakeScreenshot(source: Source) {
      void publishService.publishEditor({
        id: source.id,
        brand: source.brand,
        name: source.name,
        rtsp_address: source.rtsp_address,
        event_type: 1
      });
    }

    function onRefresh(source: Source) {
      source.show = false;
      setTimeout(() => {
        source.show = true;
      }, 250);
    }

    onMounted(() => {
      connStartStreaming = subscribeService.subscribeStartStreaming(openStartStreamingMessage);

      function openStopStreamingMessage(event: MessageEvent) {
        const responseEvent = JSON.parse(event.data);
        console.warn('sikk çabuk ' + JSON.stringify(responseEvent));
        const player = new List(streamPlayers).FirstOrDefault(x => x.sourceId === responseEvent.id);
        if (player) {
          player.pause();
        }
      }

      connStopStreaming = subscribeService.subscribeStopStreaming(openStopStreamingMessage);

      connTakeScreenshot = subscribeService.subscribeEditor((event: MessageEvent) => {
        console.log('subscribeEditor(event) called');
        const responseModel: EditorImageResponseModel = JSON.parse(event.data);
        if (responseModel.event_type != 1) {
          return;
        }
        window.location.href = 'data:application/octet-stream;base64,' + responseModel.image_base64;
      });
    });

    onBeforeUnmount(() => {
      if (connStartStreaming) {
        connStartStreaming.close();
      }
      if (connStopStreaming) {
        connStopStreaming.close();
      }
      if (connTakeScreenshot) {
        connTakeScreenshot.close();
      }
    });

    return {
      open,
      sourceList,
      needReload,
      setStreamPlayers,
      onFullScreen,
      onStreamingStop,
      onConnect,
      onTakeScreenshot,
      onRefresh
    };
  }
};

interface Source extends StreamingModel {
  src: string;
  show: boolean;
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

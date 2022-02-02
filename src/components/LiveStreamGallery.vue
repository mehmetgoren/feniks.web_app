<template>
  <div class='grid-stack' v-if='open'>
    <div class='newWidget grid-stack-item ui-draggable ui-resizable ui-resizable-autohide' v-for='source in sourceList'
         :key='source.id' gs-w='4' gs-h='3' :gs-id='source.id'>
      <div class='grid-stack-item-content' style='overflow: hidden !important;'>
        <HlsPlayer v-if='source.show&&source.streaming_type===0' :src='source.src' :source-id='source.id'
                   :ref='setStreamPlayers' v-on:need-reload='needReload'
                   :need-reload-interval='source.need_reload_interval' />
        <FlvPlayer v-if='source.show&&source.streaming_type===1' :src='source.src' :source-id='source.id'
                   :ref='setStreamPlayers' v-on:need-reload='needReload'
                   :need-reload-interval='source.need_reload_interval' />
        <SourceCommandBar :source='source' @full-screen='onFullScreen' @streaming-stop='onStreamingStop'
                          @connect='onConnect' @take-screenshot='onTakeScreenshot' @refresh='onRefresh'
                          @source-deleted='onSourceDeleted' @restart='onRestart' />
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
import FlvPlayer from 'components/FlvPlayer.vue';
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
import { isNullOrUndefined, startStreaming } from 'src/utils/utils';
import { LocalService } from 'src/utils/services/local-service';
import { NodeService } from 'src/utils/services/node-service';
// https://v3.vuejs.org/guide/migration/array-refs.html
export default {
  name: 'LiveStreamGallery',
  components: {
    HlsPlayer,
    FlvPlayer,
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
    const localService = new LocalService();
    const nodeService = new NodeService();

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
      void publishService.publishStopStreaming(<any>source);
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

    function onSubscribeStartStreaming(event: MessageEvent) {
      console.log('onSubscribeStartStreaming(event) called');
      const streamingModel: StreamingModel = JSON.parse(event.data);
      let url = '';
      if (streamingModel.streaming_type == 0) { //HLS
        url = localService.getVideoAddress() + streamingModel.hls_output_path;
      } else if (streamingModel.streaming_type == 1) { //FLV
        url = streamingModel.rtmp_flv_address;
      } else {
        throw new Error('not supported');
      }

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
            // Enable it if you want loading panel...
            // $store.commit('settings/setSourceLoading', false);
          }).catch(console.error);
        }, 250);
      }
      // Enable it if you want loading panel...
      // else {
      //   $store.commit('settings/setSourceLoading', false);
      // }
    }

    function removeSource(source: Source) {
      const list = new List<any>(sourceList);
      const sourceItem = list.FirstOrDefault(x => x.src == source.src);
      list.Remove(sourceItem);
    }

    async function onConnect(source: Source) {
      if (isNullOrUndefined(source)) {
        return;
      }
      removeSource(source);
      const sourceModel = await nodeService.getSource(source.id);
      startStreaming($store, publishService, sourceModel);
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

    function onRestart(source: Source) {
      removeSource(source);
    }

    function onSourceDeleted(source: Source) {
      let index = -1;
      for (let j = 0; j < sourceList.length; ++j) {
        if (sourceList[j].id == source.id) {
          index = j;
          break;
        }
      }
      if (index > -1) {
        sourceList.splice(index, 1);
        onRefresh(source);
      }
    }

    onMounted(() => {
      connStartStreaming = subscribeService.subscribeStartStreaming(onSubscribeStartStreaming);

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
      onRefresh,
      onSourceDeleted,
      onRestart
    };
  }
};

interface Source extends StreamingModel {
  src: string;
  show: boolean;
  rtmp_server_address: number;
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

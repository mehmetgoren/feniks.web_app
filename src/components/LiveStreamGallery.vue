<template>
  <div class='grid-stack' v-if='open'>
    <div class='newWidget grid-stack-item ui-draggable ui-resizable ui-resizable-autohide' v-for='stream in streamList'
         :key='stream.id' :gs-w='stream.loc.w' :gs-h='stream.loc.h'
         :gs-x='stream.loc.x' :gs-y='stream.loc.y' :gs-id='stream.id'>
      <div class='grid-stack-item-content' style='overflow: hidden !important;'>
        <HlsPlayer v-if='stream.show&&stream.stream_type===0' :src='stream.src' :source-id='stream.id'
                   :ref='setStreamPlayers' v-on:need-reload='needReload'
                   :need-reload-interval='stream.need_reload_interval' />
        <FlvPlayer v-if='stream.show&&stream.stream_type===1' :src='stream.src' :source-id='stream.id'
                   :ref='setStreamPlayers' v-on:need-reload='needReload'
                   :need-reload-interval='stream.need_reload_interval' />
        <DirectReadPlayer v-if='stream.show&&stream.stream_type===2' :source-id='stream.id'
                          :ref='setStreamPlayers' />
        <StreamCommandBar :stream='stream' @full-screen='onFullScreen' @stream-stop='onStreamStop'
                          @connect='onConnect' @take-screenshot='onTakeScreenshot' @refresh='onRefresh'
                          @deleted='onSourceDeleted' @restart='onRestart' @close='onStreamClose'
                          :take-screenshot-loading='stream.takeScreenshotLoading'/>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import {
  onMounted, reactive, ref, nextTick,
  onBeforeUpdate, onUpdated, onBeforeUnmount
} from 'vue';
import { StreamModel } from 'src/utils/models/stream_model';
import { EditorImageResponseModel } from 'src/utils/entities';
import { List } from 'linqts';
import HlsPlayer from 'components/HlsPlayer.vue';
import FlvPlayer from 'components/FlvPlayer.vue';
import DirectReadPlayer from 'components/DirectReadPlayer.vue';
import StreamCommandBar from 'components/StreamCommandBar.vue';
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
import { isNullOrUndefined, startStream } from 'src/utils/utils';
import { LocalService, GsLocation } from 'src/utils/services/local-service';
import { NodeService } from 'src/utils/services/node-service';
// https://v3.vuejs.org/guide/migration/array-refs.html
export default {
  name: 'LiveStreamGallery',
  components: {
    HlsPlayer,
    FlvPlayer,
    DirectReadPlayer,
    StreamCommandBar
  },
  setup() {
    const $store = useStore();
    const open = ref<boolean>(false);
    const publishService = new PublishService();
    const subscribeService = new SubscribeService();
    let connStartStream: WsConnection | null = null;
    let connStopStream: WsConnection | null = null;
    let connTakeScreenshot: WsConnection | null = null;
    const localService = new LocalService();
    const nodeService = new NodeService();
    let grid: GridStack | null = null;

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
    const onFullScreen = (stream: StreamExtModel) => {
      const player = new List(streamPlayers).FirstOrDefault(x => x.sourceId === stream.id);
      if (player) {
        player.fullScreen();
      }
    };
    const onStreamStop = (stream: StreamExtModel) => {
      void publishService.publishStopStream(<any>stream);
    };
    onUpdated(() => {
      console.log(streamPlayers);
    });
    //

    //
    const streamList = reactive<Array<StreamExtModel>>([]);
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
      streamList.forEach(stream => {
        if (stream.id === sourceId) {
          console.log('needReload executing for ' + sourceId + ' ' + opName);
          onRefresh(stream);
        }
      });
    };

    //

    function onSubscribeStartStream(event: MessageEvent) {
      console.log('onSubscribeStartStream(event) called');
      const streamModel: StreamModel = JSON.parse(event.data);
      let url = '';
      switch (streamModel.stream_type) {
        case 0: //HLS
          url = localService.getVideoAddress() + streamModel.hls_output_path;
          break;
        case 1: //FLV
          url = streamModel.rtmp_flv_address;
          break;
        case 2: //Direct Read
          break;
        default:
          throw new Error(`Stream type is not supported: ${streamModel.stream_type}`);
      }

      if (new List<any>(streamList).FirstOrDefault(x => x.src == url) == null) {
        const stream: StreamExtModel = <any>streamModel;
        stream.src = url;
        stream.show = true;
        stream.loc = getGsLayout(stream.id);
        streamList.push(stream);
        open.value = false;
        stream.takeScreenshotLoading = false;
        setTimeout(() => {
          open.value = true;
          nextTick().then(() => {
            initGs();
            $store.commit('settings/setSourceLoading', { id: stream.id, loading: false });
          }).catch(console.error);
        }, 250);
      } else {
        $store.commit('settings/setSourceLoading', { id: streamModel.id, loading: false });
      }
    }

    async function initActiveStreams() {
      const streamModels: StreamModel[] = await nodeService.getStreamList();
      if (!isNullOrUndefined(streamModels) && streamModels.length > 0) {
        for (const streamModel of streamModels) {
          startStream($store, publishService, streamModel);
        }
      }
    }

    //gs section starts
    function initGs() {
      grid = GridStack.init({
        float: true
      });
      GridStack.setupDragIn(
        '.newWidget'
      );
      grid.compact();
      grid.on('added removed change', saveGsLayout);
      saveGsLayout();
    }

    function saveGsLayout() {
      if (grid) {
        const gridItems = grid.getGridItems();
        for (const gridItem of gridItems) {
          const gridStackNode = gridItem.gridstackNode;
          if (gridStackNode) {
            localService.saveGsLocation(<string>gridStackNode.id, {
              w: <number>gridStackNode.w, h: <number>gridStackNode.h,
              x: <number>gridStackNode.x, y: <number>gridStackNode.y
            });
          }
        }
      }
    }

    function getGsLayout(sourceId: string) {
      let ret: GsLocation = { w: 4, h: 3, x: 0, y: 0 };
      const loc = localService.getGsLocation(sourceId);
      if (loc) {
        ret = { ...loc };
      }
      return ret;
    }
    //gs section ends

    //events starts
    function onRefresh(stream: StreamExtModel) {
      stream.show = false;
      setTimeout(() => {
        stream.show = true;
      }, 250);
    }

    function removeSource(stream: StreamExtModel): boolean {
      let index = -1;
      for (let j = 0; j < streamList.length; ++j) {
        if (streamList[j].id == stream.id) {
          index = j;
          break;
        }
      }
      if (index > -1) {
        streamList.splice(index, 1);
        localService.deleteGsLocation(stream.id);
        return true;
      }
      return false;
    }

    async function onConnect(stream: StreamExtModel) {
      if (isNullOrUndefined(stream)) {
        return;
      }
      removeSource(stream);
      const sourceModel = await nodeService.getSource(stream.id);
      startStream($store, publishService, sourceModel);
    }

    function onTakeScreenshot(stream: StreamExtModel) {
      stream.takeScreenshotLoading = true;
      void publishService.publishEditor({
        id: stream.id,
        brand: stream.brand,
        name: stream.name,
        rtsp_address: stream.rtsp_address,
        event_type: 1
      });
    }

    function onRestart(stream: StreamExtModel) {
      removeSource(stream);
    }

    function onSourceDeleted(stream: StreamExtModel) {
      if (removeSource(stream)) {
        onRefresh(stream);
      }
    }

    function onStreamClose(stream: StreamExtModel) {
      removeSource(stream);
    }

    //events ends

    onMounted(async () => {
      connStartStream = subscribeService.subscribeStartStream(onSubscribeStartStream);

      function openStopStreamMessage(event: MessageEvent) {
        const responseEvent = JSON.parse(event.data);
        const player = new List(streamPlayers).FirstOrDefault(x => x.sourceId === responseEvent.id);
        if (player) {
          player.pause();
          removeSource(responseEvent);
        }
      }

      connStopStream = subscribeService.subscribeStopStream(openStopStreamMessage);

      connTakeScreenshot = subscribeService.subscribeEditor((event: MessageEvent) => {
        console.log('subscribeEditor(event) called');
        const responseModel: EditorImageResponseModel = JSON.parse(event.data);
        if (responseModel.event_type != 1) {
          return;
        }
        window.location.href = 'data:application/octet-stream;base64,' + responseModel.image_base64;
        const stream = new List<StreamExtModel>(streamList).FirstOrDefault(x => x?.id == responseModel.id);
        if (stream){
          stream.takeScreenshotLoading = false;
        }
      });

      await initActiveStreams();
    });

    onBeforeUnmount(() => {
      if (connStartStream) {
        connStartStream.close();
      }
      if (connStopStream) {
        connStopStream.close();
      }
      if (connTakeScreenshot) {
        connTakeScreenshot.close();
      }
    });

    return {
      open,
      streamList,
      needReload,
      setStreamPlayers,
      onFullScreen,
      onStreamStop,
      onConnect,
      onTakeScreenshot,
      onRefresh,
      onSourceDeleted,
      onRestart,
      onStreamClose,
      getGsLayout
    };
  }
};

interface StreamExtModel extends StreamModel {
  src: string;
  show: boolean;
  thumb?: string | null;
  size?: string | null;
  loc: GsLocation;
  takeScreenshotLoading:boolean;
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

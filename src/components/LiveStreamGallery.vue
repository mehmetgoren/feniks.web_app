<template>
  <div class='grid-stack' v-if='open' v-show='!showLoading'>
    <div class='newWidget grid-stack-item ui-draggable ui-resizable ui-resizable-autohide' v-for='stream in streamList'
         :key='stream.id' :gs-w='stream.loc.w' :gs-h='stream.loc.h'
         :gs-x='stream.loc.x' :gs-y='stream.loc.y' :gs-id='stream.id'>
      <div class='grid-stack-item-content' style='overflow: hidden !important;'>
        <FlvPlayer v-if='stream&&stream.show&&stream.stream_type===0' :src='stream.src' :source-id='stream.id' :ref='setStreamPlayers' />
        <FFmpegReaderPlayer v-if='stream&&stream.show&&stream.stream_type===1' :source-id='stream.id'
                          :ref='setStreamPlayers' />
        <HlsPlayer v-if='stream&&stream.show&&stream.stream_type===2' :src='stream.src' :source-id='stream.id'
                   :ref='setStreamPlayers' />

        <StreamCommandBar v-if='stream.show' :stream='stream' @full-screen='onFullScreen' @stream-stop='onStreamStop'
                          @connect='onConnect' @take-screenshot='onTakeScreenshot' @refresh='onRefresh'
                          @deleted='onSourceDeleted' @restart='onRestart' @close='onStreamClose'
                          :take-screenshot-loading='stream.takeScreenshotLoading' />

        <q-inner-loading v-if='!stream.show' :showing='true' label='Please wait...' label-class='text-cyan' />
      </div>
    </div>
  </div>
  <q-inner-loading :showing='showLoading' style='text-align: center;'>
    <q-spinner-gears size='50%' color='cyan' />
  </q-inner-loading>
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
import FFmpegReaderPlayer from 'components/FFmpegReaderPlayer.vue';
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
    FFmpegReaderPlayer,
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
    const showLoading = ref<boolean>(false);
    let grid: GridStack | null = null;
    const waitInterval = 500;

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
      $store.commit('settings/notifySourceStreamStatusChanged');
    };
    onUpdated(() => {
      console.log(streamPlayers);
    });
    const streamList = reactive<Array<StreamExtModel>>([]);
    //

    const loadInitGrid = (onGridInitialized: (() => any) | null) => {
      setTimeout(() => {
        open.value = true;
        nextTick().then(() => {
          initGs();
          if (onGridInitialized) {
            onGridInitialized();
          }
        }).catch(console.error);
      }, waitInterval);
    };

    const addPlayer = (streamModel: StreamModel, isStartStream: boolean) => {
      if (new List<any>(streamList).FirstOrDefault(x => x.id == streamModel.id) == null) {
        let url = '';
        switch (streamModel.stream_type) {
          case 0: //FLV
            url = streamModel.rtmp_flv_address;
            break;
          case 1: //FFmpeg Reader
            break;
          case 2: //HLS
            url = localService.getVideoAddress() + streamModel.hls_output_path;
            break;
          default:
            throw new Error(`Stream type is not supported: ${streamModel.stream_type}`);
        }
        const stream: StreamExtModel = <any>streamModel;
        stream.src = url;
        stream.show = true;
        stream.loc = getGsLayout(stream.id);
        stream.takeScreenshotLoading = false;
        streamList.push(stream);
        open.value = false;
        if (isStartStream) {
          loadInitGrid(() => $store.commit('settings/setSourceLoading', { id: stream.id, loading: false }));
        }
      } else {
        if (isStartStream) {
          $store.commit('settings/setSourceLoading', { id: streamModel.id, loading: false });
        }
      }
      if (isStartStream) {
        $store.commit('settings/notifySourceStreamStatusChanged');
      }
    };

    function onSubscribeStartStream(event: MessageEvent) {
      console.log('onSubscribeStartStream(event) called');
      const streamModel: StreamModel = JSON.parse(event.data);
      addPlayer(streamModel, true);
    }

    //gs section starts
    function initGs() {
      try {
        showLoading.value = true;
        grid = GridStack.init({
          float: true
        });
        GridStack.setupDragIn(
          '.newWidget'
        );
        grid.compact();
        grid.on('added removed change', saveGsLayout);
        saveGsLayout();
      } finally {
        setTimeout(() => {
          showLoading.value = false;
        }, waitInterval);
      }
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

    async function initActiveStreams() {
      const streamModels: StreamModel[] = await nodeService.getStreamList();
      if (!isNullOrUndefined(streamModels) && streamModels.length > 0) {
        for (const streamModel of streamModels) {
          const loc = localService.getGsLocation(streamModel.id);
          if (loc) {
            addPlayer(streamModel, false);
          }
        }
        loadInitGrid(null);
      }
    }

    onMounted(() => {
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
        if (stream) {
          stream.takeScreenshotLoading = false;
        }
      });

      void initActiveStreams();
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

    //events starts
    function onRefresh(stream: StreamExtModel) {
      stream.show = false;
      setTimeout(() => {
        stream.show = true;
      }, waitInterval);
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
        address: stream.address,
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

    return {
      open,
      streamList,
      setStreamPlayers,
      onFullScreen,
      onStreamStop,
      onConnect,
      onTakeScreenshot,
      onRefresh,
      onSourceDeleted,
      onRestart,
      onStreamClose,
      getGsLayout,
      showLoading
    };
  }
};

interface StreamExtModel extends StreamModel {
  src: string;
  show: boolean;
  thumb?: string | null;
  size?: string | null;
  loc: GsLocation;
  takeScreenshotLoading: boolean;
}
</script>
<style scoped>
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

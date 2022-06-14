<template>
  <div class='grid-stack' v-if='open' v-show='!showLoading'>
    <div class='newWidget grid-stack-item ui-draggable ui-resizable ui-resizable-autohide'
         v-for='(stream, index) in streamList'
         :key='stream.id' :gs-w='stream.loc.w' :gs-h='stream.loc.h'
         :gs-x='stream.loc.x' :gs-y='stream.loc.y' :gs-id='stream.id' :gs-min-w='minWidth'>
      <div class='grid-stack-item-content' style='overflow: hidden !important;'>
        <FlvPlayer v-if='stream&&stream.show&&stream.stream_type===0' :src='stream.src' :source-id='stream.id'
                   :enable-log='false' :ref='setStreamPlayers'
                   :enable-booster='stream.booster_enabled' :seek-to-live-edge-internal='config.ui.seek_to_live_edge_internal' :gallery-index='index' />
        <HlsPlayer v-if='stream&&stream.show&&stream.stream_type===1' :src='stream.src' :source-id='stream.id'
                   :ref='setStreamPlayers' :enable-log='false'
                   :enable-booster='stream.booster_enabled' :seek-to-live-edge-internal='config.ui.seek_to_live_edge_internal' :gallery-index='index' />
        <FFmpegReaderPlayer v-if='stream&&stream.show&&stream.stream_type>1' :source-id='stream.id'
                            :ref='setStreamPlayers' />

        <StreamCommandBar v-if='stream.show' :stream='stream' @full-screen='onFullScreen' @stream-stop='onStreamStop'
                          @connect='onConnect' @take-screenshot='onTakeScreenshot' @refresh='onRefresh'
                          @deleted='onSourceDeleted' @restart='onRestart' @close='onStreamClose'
                          :take-screenshot-loading='stream.takeScreenshotLoading'
                          :enable-booster='stream.booster_enabled' :transparent='stream.stream_type<2' />

        <q-inner-loading v-if='!stream.show' :showing='true' label='Please wait...' label-class='text-cyan' />
      </div>
    </div>
  </div>
    <q-inner-loading :showing='showLoading' style='text-align: center;'>
<!--      <q-spinner-gears size='50%' color='cyan' />-->
      <q-spinner-hourglass size="50%"  color="cyan" />
    </q-inner-loading>
</template>

<script lang='ts'>
import {
  onMounted, reactive, ref, nextTick,
  onBeforeUpdate, onBeforeUnmount
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
import { PublishService, SubscribeService } from 'src/utils/services/websocket_services';
import { WsConnection } from 'src/utils/ws/connection';
import { checkIpIsLoopBack, isNullOrUndefined, startStream } from 'src/utils/utils';
import { LocalService, GsLocation } from 'src/utils/services/local_service';
import { NodeService } from 'src/utils/services/node_service';
import { Config } from 'src/utils/models/config';
import { StoreService } from 'src/utils/services/store_service';
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
    const open = ref<boolean>(false);
    const publishService = new PublishService();
    const storeService = new StoreService();
    let connStartStream: WsConnection | null = null;
    let connStopStream: WsConnection | null = null;
    let connTakeScreenshot: WsConnection | null = null;
    const localService = new LocalService();
    const nodeService = new NodeService();
    const showLoading = ref<boolean>(false);
    let grid: GridStack | null = null;
    const waitInterval = 500;
    let serverIp = '';
    let isRemoteServer = false;
    const config = ref<Config>();
    const minWidth = ref<number>(4);

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
      storeService.setNotifySourceStreamStatusChanged();
    };
    const streamList = reactive<Array<StreamExtModel>>([]);
    //

    const loadInitGrid = (onGridInitialized: (() => any) | null) => {
      setTimeout(() => {
        open.value = true;
        nextTick().then(() => {
          initGs();
          if (onGridInitialized) {
            onGridInitialized();
            fixVideoJsFullScreenButton();
          }
        }).catch(console.error);
      }, waitInterval);
    };

    const addPlayer = (streamModel: StreamModel, isStartStream: boolean) => {
      if (new List<any>(streamList).FirstOrDefault(x => x.id == streamModel.id) == null) {
        let url = '';
        switch (streamModel.stream_type) {
          case 0: //FLV
            const flvAddress = isRemoteServer ? streamModel.rtmp_flv_address.replace('127.0.0.1', serverIp) : streamModel.rtmp_flv_address;
            url = flvAddress;
            break;
          case 1: //HLS
            url = localService.getHlsAddress(serverIp, streamModel.id);
            break;
          case 2: //Direct Reader
          case 3: //FFmpeg Reader
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
          loadInitGrid(() => storeService.setSourceLoading(stream.id, false));
        }
      } else {
        if (isStartStream) {
          storeService.setSourceLoading(streamModel.id, false);
        }
      }
      if (isStartStream) {
        storeService.setNotifySourceStreamStatusChanged();
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
      const ui = config.value?.ui;
      const w = ui?.gs_width ?? 4;
      const h = ui?.gs_height ?? 3;

      const dividing = 12 / w;
      const yMultiplier = h;

      const gsLocations = localService.getGsLocations();
      let x = 0, y = 0;
      const len = gsLocations.length;
      if (len > 0) {
        const remainder = len % dividing;
        x = remainder * w;

        const result = parseInt((len / dividing).toString());
        y = result * yMultiplier;
      }
      let ret: GsLocation = { w, h, x: x, y: y };
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

    function fixVideoJsFullScreenButton(){
      setTimeout(() => {
        const fsButtons = document.getElementsByClassName('vjs-fullscreen-control');
        if (fsButtons && fsButtons.length){
          const len = fsButtons.length;
          for(let j = 0; j < len; ++j){
            //@ts-ignore
            fsButtons[j].style.marginRight = '20px';
          }
        }
      }, 3000);
    }

    onMounted(async () => {
      serverIp = await localService.getNodeIP();
      isRemoteServer = !checkIpIsLoopBack(serverIp);

      const subscribeService = new SubscribeService(serverIp);
      const cf = await nodeService.getConfig();
      if (cf && cf.ui && cf.ui.gs_width) {
        minWidth.value = cf.ui.gs_width;
      }
      config.value = cf;
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

      connTakeScreenshot = subscribeService.subscribeEditor('lsg', (event: MessageEvent) => {
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

      await initActiveStreams();

      fixVideoJsFullScreenButton();
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
      startStream(storeService, publishService, sourceModel);
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
      open, streamList, showLoading, config, minWidth,
      setStreamPlayers, onFullScreen, onStreamStop, onConnect, onTakeScreenshot, onRefresh, onSourceDeleted, onRestart, onStreamClose
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

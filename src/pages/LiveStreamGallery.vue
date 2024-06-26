<template>
  <div class='grid-stack' v-if='open' v-show='!showLoading'>
    <div class='newWidget grid-stack-item ui-draggable ui-resizable ui-resizable-autohide'
         v-for='(stream, index) in streamList'
         :key='stream.id' :gs-w='stream.loc.w' :gs-h='stream.loc.h'
         :gs-x='stream.loc.x' :gs-y='stream.loc.y' :gs-id='stream.id' :gs-min-w='minWidth'>
      <div :id='"ctx" + stream.id' class='grid-stack-item-content' style='overflow: hidden !important;background-color: black'>
        <Go2RtcPlayer v-if="stream.show&&stream.ms_type===0" :src="stream.src" :source-id="stream.id" :mode="stream.go2rtc_player_mode"
                      v-show="!stream.showHtml2Canvas" :ref='setStreamPlayers' :gallery-index='index' @user-activity='onUserActivity'/>
        <MpegTsPlayer v-if='stream.show&&stream.ms_type>0&&stream.stream_type===0&&stream.flv_player_type===0' :src='stream.src'
                      v-show="!stream.showHtml2Canvas" :source-id='stream.id'
                      :enable-log='false' :ref='setStreamPlayers' :gallery-index='index' @user-activity='onUserActivity'
                      :live-buffer-latency-chasing="stream.live_buffer_latency_chasing"/>
        <FlvPlayer v-if='stream.show&&stream.ms_type>0&&stream.stream_type===0&&stream.flv_player_type===1'
                   v-show="!stream.showHtml2Canvas" :src='stream.src' :source-id='stream.id' :enable-log='false' :ref='setStreamPlayers'
                   :enable-booster='stream.booster_enabled' :seek-to-live-edge-internal='ui.seek_to_live_edge_internal' :gallery-index='index'
                   @user-activity='onUserActivity' :booster-interval="ui.booster_interval" @need-refresh="onNeedRefresh"/>
        <HlsPlayer v-if='stream.show&&stream.ms_type>0&&stream.stream_type===1' v-show="!stream.showHtml2Canvas" :src='stream.src'
                   :source-id='stream.id'
                   :enable-log='false' :ref='setStreamPlayers'
                   :enable-booster='stream.booster_enabled' :seek-to-live-edge-internal='ui.seek_to_live_edge_internal' :gallery-index='index'
                   @user-activity='onUserActivity' @need-refresh="onNeedRefresh"/>
        <WebSocketPlayer v-if='stream.show&&stream.ms_type>0&&stream.stream_type===2' :source-id='stream.id' :ref='setStreamPlayers'
                         @user-activity='onUserActivity'/>

        <StreamCommandBar v-if='stream.show' v-show="!stream.showHtml2Canvas" :stream='stream' :hide='stream.hide' @full-screen='onFullScreen'
                          @stream-stop='onStreamStop' @connect='onConnect' @take-screenshot='onTakeScreenshot' @refresh='onRefresh'
                          @restart='onRestart' @close='onStreamClose' :take-screenshot-loading='stream.takeScreenshotLoading'
                          :style="{'margin-top': marginTop[stream.id].toString() + 'px'}"
                          :enable-booster='stream.booster_enabled' :transparent='true'/>

        <q-inner-loading :showing='!stream.show' v-show="!stream.showHtml2Canvas" label='Please wait...' label-class='text-cyan'/>
        <div :id='"ss" + stream.id' v-show="stream.showHtml2Canvas"></div>
      </div>
    </div>
  </div>
  <q-inner-loading :showing='showLoading' style='text-align: center;'>
    <!--      <q-spinner-gears size='50%' color='cyan' />-->
    <q-spinner-hourglass size="50%" color="cyan"/>
  </q-inner-loading>
</template>

<script lang='ts' setup>
import { UiConfig } from '../utils/models/ui_config';

declare var $: any;
import {nextTick, onBeforeUnmount, onBeforeUpdate, onMounted, reactive, ref, watch} from 'vue';
import {StreamModel} from 'src/utils/models/stream_model';
import {EditorImageResponseModel} from 'src/utils/entities';
import {List} from 'linqts';
import HlsPlayer from 'components/HlsPlayer.vue';
import FlvPlayer from 'components/FlvPlayer.vue';
import WebSocketPlayer from 'components/WebSocketPlayer.vue';
import MpegTsPlayer from 'components/MpegTsPlayer.vue';
import StreamCommandBar from 'components/StreamCommandBar.vue';
import 'gridstack/dist/gridstack.min.css';
import {GridStack} from 'gridstack';
// THEN to get HTML5 drag&drop
import 'gridstack/dist/h5/gridstack-dd-native';
import 'gridstack/dist/gridstack-h5.js';
// // OR to get legacy jquery-ui drag&drop (support Mobile touch devices, h5 does not yet)
import 'gridstack/dist/jq/gridstack-dd-jqueryui';
import {PublishService, SubscribeService} from 'src/utils/services/websocket_services';
import {WsConnection} from 'src/utils/ws/connection';
import { isNullOrUndefined, startStream, stopStream, localIp } from 'src/utils/utils';
import {NodeService} from 'src/utils/services/node_service';
import {Config} from 'src/utils/models/config';
import {StoreService} from 'src/utils/services/store_service';
import {StreamCommandBarActions, StreamCommandBarInfo} from 'src/store/module-settings/state';
import html2canvas from 'html2canvas';
import {GsLocation} from 'src/utils/services/gallery_locations_service';
import {StopStreamResponseEvent} from 'src/utils/models/various';
import Go2RtcPlayer from 'src/components/Go2RtcPlayer/Index.vue';

// https://v3.vuejs.org/guide/migration/array-refs.html

const open = ref<boolean>(false);
const publishService = new PublishService();
const storeService = new StoreService();
let connStartStream: WsConnection | null = null;
let connStopStream: WsConnection | null = null;
let connTakeScreenshot: WsConnection | null = null;
const nodeService = new NodeService();
const localService = nodeService.LocalService;
const gls = localService.createGalleryLocationService();
const showLoading = ref<boolean>(false);
let grid: GridStack | null = null;
const waitInterval = 500;
let isRemoteServer = false;
//@ts-ignore
const config = ref<Config>({});
const minWidth = ref<number>(4);
const marginTop = ref<any>({});
//@ts-ignore
const ui = ref<UiConfig>({});

const clickedStreamCommandBar = storeService.clickedStreamCommandBar;
watch(clickedStreamCommandBar, (info: StreamCommandBarInfo) => {
  const stream = findById(info.source.id);
  if (!stream) return;

  switch (info.action) {
    case StreamCommandBarActions.CloseSourceSettings:
    case  StreamCommandBarActions.DeleteSource:
      removeSource(stream);
      break;
  }
});
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
const doStreamStop = (sourceId: string) => {
  const stream = findById(sourceId);
  if (!stream) return;

  stopStream(storeService, publishService, gls, <any>stream);
  stream.show = false;
  setTimeout(() => {
    removeSource(stream);
  }, 3000);
};

const onStreamStop = (cloneStream: StreamExtModel) => {
  doStreamStop(cloneStream.id);
};
const streamList = reactive<Array<StreamExtModel>>([]);
//

const loadInitGrid = (onGridInitialized: () => any) => {
  setTimeout(() => {
    open.value = true;
    nextTick().then(() => {
      initGs();
      onGridInitialized();
      fixVideoJsFullScreenButton();
    }).catch(console.error);
  }, waitInterval);
};
const addPlayer = (streamModel: StreamModel, triggeredByWebSocket: boolean) => {
  const getUrlFn = (): string => {
    const serverIp = localService.getServerIp();
    let url = '';
    switch (streamModel.stream_type) {
      case 0: //FLV
        const flvAddress = isRemoteServer ? streamModel.ms_stream_address.replace(localIp, serverIp)
          : streamModel.ms_stream_address;
        url = flvAddress;
        break;
      case 1: //HLS
        const hlsAddress = isRemoteServer ? localService.getHlsAddress(config.value, streamModel).replace(localIp, serverIp)
          : localService.getHlsAddress(config.value, streamModel);
        url = hlsAddress;
        break;
      case 2: //Websockets
        break;
      default:
        throw new Error(`Stream type is not supported: ${streamModel.stream_type}`);
    }
    return url
  };
  const stream = findById(streamModel.id);
  if (stream == null) {
    const stream: StreamExtModel = <any>streamModel;
    stream.src = getUrlFn();
    stream.show = true;
    stream.loc = getGsLayout(stream.id);
    stream.takeScreenshotLoading = false;
    stream.hide = false;
    streamList.push(stream);
    calculateMarginTop(stream.id);
    open.value = false;
    stream.showHtml2Canvas = false;
    if (triggeredByWebSocket) {
      loadInitGrid(() => storeService.setSourceLoading(stream.id, false));
    }
  } else {
    setTimeout(() => {
      stream.src = getUrlFn();
      stream.takeScreenshotLoading = false;
      stream.hide = false;
      stream.show = true;
      setTimeout(() => onRefresh(stream), 3000);
    }, 3000);
    if (triggeredByWebSocket) {
      storeService.setSourceLoading(streamModel.id, false);
    }
  }
  if (triggeredByWebSocket) {
    storeService.setNotifySourceStreamStatusChanged();
  }
};

function calculateMarginTopAll() {
  for (const stream of streamList) {
    calculateMarginTop(stream.id);
  }
}

function calculateMarginTop(sourceId: string) {
  const defaultValue = -77;
  const parentHeight: number = $('#ctx' + sourceId).width();
  if (!parentHeight) {
    marginTop.value[sourceId] = defaultValue;
    return;
  }

  const multiplier = 70.0;
  const meHeight = 79.9688;
  let top = (meHeight / parentHeight * multiplier) + multiplier + 2.0;
  top *= -1.0
  if (top > -defaultValue) {
    top = defaultValue;
  }
  marginTop.value[sourceId] = top;
}

function onSubscribeStartStream(event: MessageEvent) {
  const streamModel: StreamModel = JSON.parse(event.data);
  if (!gls.hasLocation(streamModel?.id ?? '')) {
    return;
  }
  addPlayer(streamModel, true);
}

let lastCalled = new Date().getTime();
function onSubscribeStopStream(event: MessageEvent) {
  const stopStreamResponse: StopStreamResponseEvent = JSON.parse(event.data);
  if (gls.hasLocation(stopStreamResponse.id ?? '')) {
    return;
  }
  //prevent too many calls
  if (new Date().getTime() - lastCalled < 1000) {
    return;
  }

  if (stopStreamResponse.id) {
    doStreamStop(stopStreamResponse.id);
    lastCalled = new Date().getTime();
  }
}

//gs section starts
function initGs() {
  try {
    showLoading.value = true;
    grid = GridStack.init({
      float: true
    });
    if (!grid) {
      return;
    }
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
        gls.saveGsLocationWithOption(<string>gridStackNode.id, {
          w: <number>gridStackNode.w, h: <number>gridStackNode.h,
          x: <number>gridStackNode.x, y: <number>gridStackNode.y
        });
      }
    }
  }
}

function getGsLayout(sourceId: string) {
  const w = ui.value.gs_width ?? 4;
  const h = ui.value.gs_height ?? 3;

  const dividing = 12 / w;
  const yMultiplier = h;

  const gsLocations = gls.getGsLocations();
  let x = 0, y = 0;
  const len = gsLocations.length;
  if (len > 0) {
    const remainder = len % dividing;
    x = remainder * w;

    const result = parseInt((len / dividing).toString());
    y = result * yMultiplier;
  }
  let ret: GsLocation = {w, h, x: x, y: y};
  const loc = gls.getGsLocation(sourceId);
  if (loc && loc.w) {
    ret = {...loc};
  }
  return ret;
}

//gs section ends

async function initActiveStreamsFirstTime() {
  const streamModels: StreamModel[] = await nodeService.getStreamList();
  if (!isNullOrUndefined(streamModels) && streamModels.length > 0) {
    if (storeService.readonlyMode.value) {
      for (const streamModel of streamModels) {
        addPlayer(streamModel, false);
      }
    } else {
      for (const streamModel of streamModels) {
        const loc = gls.getGsLocation(streamModel.id);
        if (loc) {
          addPlayer(streamModel, false);
        }
      }
    }
    loadInitGrid(() => {
      setTimeout(() => {
        for (const stream of streamList) {
          stream.hide = true;
        }
      }, 250);
      setTimeout(() => {
        calculateMarginTopAll();
      }, 1000);
    });
  }
}

function fixVideoJsFullScreenButton() {
  setTimeout(() => {
    const fsButtons = document.getElementsByClassName('vjs-fullscreen-control');
    if (fsButtons && fsButtons.length) {
      const len = fsButtons.length;
      for (let j = 0; j < len; ++j) {
        //@ts-ignore
        fsButtons[j].style.marginRight = '20px';
      }
    }
  }, 3000);
}


onMounted(async () => {
  isRemoteServer = localService.isRemoteServer();
  ui.value = localService.getUiConfig();
  if (ui.value.gs_width) {
    minWidth.value = ui.value.gs_width;
  }
  config.value = await nodeService.getConfig();
  const subscribeService = new SubscribeService();
  connStartStream = subscribeService.subscribeStartStream(onSubscribeStartStream);
  connStopStream = subscribeService.subscribeStopStream(onSubscribeStopStream);

  connTakeScreenshot = subscribeService.subscribeEditor('lsg', (event: MessageEvent) => {
    const responseModel: EditorImageResponseModel = JSON.parse(event.data);
    if (responseModel.event_type != 1) {
      return;
    }
    const stream = findById(responseModel.id ?? '');
    if (stream) {
      stream.takeScreenshotLoading = false;
    }
  });

  await initActiveStreamsFirstTime();

  fixVideoJsFullScreenButton();

  window.addEventListener('resize', calculateMarginTopAll, true);
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
  window.removeEventListener('resize', calculateMarginTopAll, true);
});

//events starts
function onRefresh(cloneStream: StreamExtModel) {
  const stream = findById(cloneStream.id);
  if (!stream) return;

  stream.show = false;
  setTimeout(() => {
    stream.show = true;
  }, waitInterval);
}

function removeSource(stream: StreamExtModel) {
  let index = -1;
  for (let j = 0; j < streamList.length; ++j) {
    if (streamList[j].id == stream.id) {
      index = j;
      break;
    }
  }
  if (index > -1) {
    streamList[index].show = false;
    streamList.splice(index, 1);
    gls.removeGsLocation(stream.id);
  }
}

async function onConnect(cloneStream: StreamExtModel) {
  if (isNullOrUndefined(cloneStream)) {
    return;
  }
  const stream = findById(cloneStream.id);
  if (!stream) return;

  const sourceModel = await nodeService.getSource(stream.id);
  startStream(storeService, publishService, gls, sourceModel);
}

function onTakeScreenshot(cloneStream: StreamExtModel) {
  const stream = findById(cloneStream.id);
  if (!stream) return;

  stream.takeScreenshotLoading = true;
  void publishService.publishEditor({
    id: stream.id,
    brand: stream.brand,
    name: stream.name,
    address: stream.ms_address,
    event_type: 1
  });
}

// Handled by MainLayout stream command bar publish connection
function onRestart(cloneStream: StreamExtModel) {
  const stream = findById(cloneStream.id);
  if (!stream) return;

  stream.show = false;
}

function onStreamClose(cloneStream: StreamExtModel) {
  removeSource(cloneStream);
}

function onUserActivity(obj: any) {
  const sourceId: string = obj.sourceId;
  const stream = findById(sourceId);
  if (stream) {
    stream.hide = !obj.userActive;
  }
}

function onNeedRefresh(sourceId: string) {
  const stream = findById(sourceId);
  if (!stream) return;

  const elm = document.getElementById('ctx' + stream.id);
  //@ts-ignore
  void html2canvas(elm).then(function (canvas) {
    //@ts-ignore
    const output = document.getElementById('ss' + stream.id);
    //@ts-ignore
    output.innerHTML = '';
    //@ts-ignore
    output.appendChild(canvas);
    stream.showHtml2Canvas = true;

    stream.show = false;
    nextTick().then(() => {
      stream.show = true;
      setTimeout(() => {
        stream.showHtml2Canvas = false;
      }, 3333);
    }).catch(console.error);
  });
}

//events ends

const findById = (sourceId: string): StreamExtModel | null => {
  return new List<any>(streamList).FirstOrDefault(x => x.id == sourceId);
}

interface StreamExtModel extends StreamModel {
  src: string;
  show: boolean;
  thumb?: string | null;
  size?: string | null;
  loc: GsLocation;
  takeScreenshotLoading: boolean;
  hide: boolean;
  showHtml2Canvas: boolean;
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

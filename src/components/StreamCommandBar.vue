<template>
  <div v-show='!hide' :id="containerId">
    <q-chip square :class='{"transparent": transparent}' color='primary' text-color='white' icon='videocam'>
      {{ stream.name }} ({{ msType }} / {{ streamType }}{{ (enableBooster ? ' / Boosted' : '') }}{{ (stream.snapshot_enabled ? ' / AI' : '') }})
    </q-chip>
    <q-icon style="margin-left: 5px;" v-if='stream.record_enabled' name='fiber_manual_record' size='sm' color='red' class='blink_me'>
      <label style='font-size: x-small; color: black;'>REC</label>
    </q-icon>
    <q-separator style='margin-bottom: 5px;' />
    <q-btn-group>
      <q-btn v-show="visibilityList['settings']" :dense='dense' color='cyan' rounded glossy icon-right='settings' @click='onSettingsClick'>
        <q-tooltip class='bg-cyan'>{{ $t('settings') }}</q-tooltip>
      </q-btn>
      <q-btn v-show="visibilityList['sync']" :dense='dense' color='secondary' rounded glossy icon='sync' @click='onRefresh'>
        <q-tooltip class='bg-secondary'>{{ $t('refresh') }}</q-tooltip>
      </q-btn>
      <q-btn v-show="visibilityList['power']" :dense='dense' color='secondary' rounded glossy icon='power' @click='onConnectClick'>
        <q-tooltip class='bg-secondary'>{{ $t('connect') }}</q-tooltip>
      </q-btn>
      <q-btn v-show="visibilityList['restart_alt']" :dense='dense' color='secondary' rounded glossy icon='restart_alt' @click='onRestartClick'>
        <q-tooltip class='bg-secondary'>{{ $t('restart') }}</q-tooltip>
      </q-btn>
      <q-btn v-show="visibilityList['power_off']" :dense='dense' color='deep-orange' rounded glossy icon='power_off' @click='onStreamStopClick'>
        <q-tooltip class='bg-deep-orange'>{{ $t('stop') }}</q-tooltip>
      </q-btn>
      <q-btn v-show="visibilityList['dvr']" :dense='dense' color='purple' rounded glossy icon='dvr' @click='onRecordClick'>
        <q-tooltip class='bg-accent'>{{ $t('playback') }}</q-tooltip>
      </q-btn>
      <q-btn v-show="visibilityList['photo_camera']" :dense='dense' color='purple' rounded glossy icon='photo_camera' @click='onTakeScreenshot'>
        <q-tooltip class='bg-accent'>{{ $t('take_screenshot') }}</q-tooltip>
        <q-inner-loading :showing='takeScreenshotLoading' :size="dense?'32px':'42px'" />
      </q-btn>
      <q-btn v-show="visibilityList['auto_awesome']" :dense='dense' color='orange' rounded glossy icon='auto_awesome' @click='onAiClick'>
        <q-tooltip class='bg-orange'>{{ $t('ai') }}</q-tooltip>
      </q-btn>
      <q-btn v-show="visibilityList['fullscreen']" :dense='dense' v-if='showFullScreenButton' color='primary' rounded glossy icon='fullscreen'
             @click='onFullScreenClick'>
        <q-tooltip class='bg-primary'>{{ $t('fullscreen') }}</q-tooltip>
      </q-btn>
      <q-btn v-show="visibilityList['close']" :dense='dense' color='deep-orange' rounded glossy icon='close' @click='onClose'>
        <q-tooltip class='bg-deep-orange'>{{ $t('close') }}</q-tooltip>
      </q-btn>
    </q-btn-group>
    <q-separator style='margin-top: 5px;' />
  </div>
</template>

<script lang='ts' setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import type { PropType } from 'vue';
import { PublishService } from 'src/utils/services/websocket_services';
import { NodeService } from 'src/utils/services/node_service';
import { SourceModel } from 'src/utils/models/source_model';
import { StreamModel } from 'src/utils/models/stream_model';
import { LocalService, SelectOption } from 'src/utils/services/local_service';
import { List } from 'linqts';
import { useRouter } from 'vue-router';
import { StoreService } from 'src/utils/services/store_service';
import { StreamCommandBarActions } from 'src/store/module-settings/state';
import { v4 as uuidv4 } from 'uuid';

const emit = defineEmits(['full-screen', 'stream-stop', 'connect', 'take-screenshot', 'refresh', 'restart', 'close']);

const props = defineProps({
  stream: {
    type: Object as PropType<StreamModel>, // type is StreamModel
    required: true
  },
  showFullScreenButton: {
    type: Boolean,
    default: false
  },
  takeScreenshotLoading: {
    type: Boolean,
    default: false
  },
  enableBooster: {
    type: Boolean,
    default: false,
    required: true
  },
  transparent: {
    type: Boolean,
    default: false,
    required: true
  },
  hide: {
    type: Boolean,
    default: false,
    required: false
  }
});


const router = useRouter();
const dense = ref<boolean>(props.transparent);
const localService = new LocalService();
const storeService = new StoreService();
const cloneStream: StreamModel = { ...props.stream };
const msType = computed(() => {
  return new List<SelectOption>(localService.createMediaServerTypes())
    .FirstOrDefault(x => x?.value === props.stream.ms_type)?.label ?? '';
});
const streamType = computed(() => {
  const s: StreamModel = props.stream;
  if (s.ms_type === 0) {// Go 2 RTC
    return s.go2rtc_player_mode === 0 ? 'MSE' : 'WebRTC';
  }
  return new List<SelectOption>(localService.createStreamTypes())
    .FirstOrDefault(x => x?.value == s.stream_type)?.label ?? '';
});
const publishService = new PublishService();
const nodeService = new NodeService();
const visibilityList = ref({
  'settings': true,
  'sync': true,
  'power': true,
  'restart_alt': true,
  'power_off': true,
  'dvr': true,
  'photo_camera': true,
  'auto_awesome': true,
  'settings_ethernet': true,
  'fullscreen': true,
  'close': true
});
const containerId = ref(uuidv4());

onMounted(() => {
  window.addEventListener('resize', tuneButtonVisibility, true);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', tuneButtonVisibility, true);
});

function tuneButtonVisibility() {
  setTimeout(() => {
    const meDiv = document.getElementById(containerId.value);
    if (!meDiv) return;
    const parent = meDiv.parentNode;
    //@ts-ignore
    if (!parent) return;
    //@ts-ignore
    const clientWidth = parent.clientWidth;
    if (!clientWidth) return;
    //@ts-ignore
    visibilityList.value['photo_camera'] = clientWidth > 375; // screenshot
    visibilityList.value['power'] = clientWidth > 350; // connect
    visibilityList.value['dvr'] = clientWidth > 325; // record
    visibilityList.value['auto_awesome'] = clientWidth > 300; // ai,
  }, 250);
}

const onRecordClick = () => {
  storeService.setRecordSourceId(props.stream.id);
  void router.push('source_records');
};

const onAiClick = () => {
  storeService.setAiSettingsSourceId(props.stream.id);
  void router.push('ai_settings');
};


function onFullScreenClick() {
  emit('full-screen', cloneStream);
}

function onStreamStopClick() {
  emit('stream-stop', cloneStream);
}

function onConnectClick() {
  emit('connect', cloneStream);
}

async function onRestartClick() {
  emit('restart', cloneStream);
  const sourceModel: SourceModel = await nodeService.getSource(props.stream.id);
  await publishService.publishRestartStream(sourceModel);
}

function onTakeScreenshot() {
  emit('take-screenshot', cloneStream);
}

function onRefresh() {
  emit('refresh', cloneStream);
}

function onSettingsClick() {
  storeService.setStreamCommandBar({ source: cloneStream, action: StreamCommandBarActions.ShowSourceSettings });
}

function onClose() {
  emit('close', cloneStream);
  storeService.setStreamCommandBar({ source: cloneStream, action: StreamCommandBarActions.CloseSourceSettings });
}

</script>

<style scoped>
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

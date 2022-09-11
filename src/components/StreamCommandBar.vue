<template>
  <div v-show='!hide'>
    <q-chip square :class='{"transparent": transparent}' color='primary' text-color='white' icon='videocam'>
      {{ stream.name }} ({{ rtmpType }} / {{ streamType }}{{ (enableBooster ? ' / Boosted' : '') }}{{ (stream.snapshot_enabled ? ' / AI' : '') }})
    </q-chip>
    <q-icon style="margin-left: 5px;" v-if='stream.record_enabled' name='fiber_manual_record' size='sm' color='red' class='blink_me'>
      <label style='font-size: x-small; color: black;'>REC</label>
    </q-icon>
    <q-separator style='margin-bottom: 5px;' />
    <q-btn-group>
      <q-btn :dense='dense' color='cyan' rounded glossy icon-right='settings' @click='onSettingsClick'>
        <q-tooltip class='bg-cyan'>{{$t('settings')}}</q-tooltip>
      </q-btn>
      <q-btn :dense='dense' color='secondary' rounded glossy icon='sync' @click='onRefresh'>
        <q-tooltip class='bg-secondary'>{{$t('refresh')}}</q-tooltip>
      </q-btn>
      <q-btn :dense='dense' color='secondary' rounded glossy icon='power' @click='onConnectClick'>
        <q-tooltip class='bg-secondary'>{{$t('connect')}}</q-tooltip>
      </q-btn>
      <q-btn :dense='dense' color='secondary' rounded glossy icon='restart_alt' @click='onRestartClick'>
        <q-tooltip class='bg-secondary'>{{$t('restart')}}</q-tooltip>
      </q-btn>
      <q-btn :dense='dense' color='deep-orange' rounded glossy icon='power_off' @click='onStreamStopClick'>
        <q-tooltip class='bg-deep-orange'>{{$t('stop')}}</q-tooltip>
      </q-btn>
      <q-btn :dense='dense' color='purple' rounded glossy icon='dvr' @click='onRecordClick'>
        <q-tooltip class='bg-accent'>{{$t('playback')}}</q-tooltip>
      </q-btn>
      <q-btn :dense='dense' color='purple' rounded glossy icon='photo_camera' @click='onTakeScreenshot'>
        <q-tooltip class='bg-accent'>{{$t('take_screenshot')}}</q-tooltip>
        <q-inner-loading :showing='takeScreenshotLoading' :size="dense?'32px':'42px'" />
      </q-btn>
      <q-btn :dense='dense' color='orange' rounded glossy icon='psychology' @click='onAiClick'>
        <q-tooltip class='bg-orange'>{{$t('ai')}}</q-tooltip>
      </q-btn>
      <q-btn :dense='dense' color='brown-5' rounded glossy icon='settings_ethernet' @click='onOnvifClick'>
        <q-tooltip class='bg-brown-5'>{{$t('onvif')}}</q-tooltip>
      </q-btn>
      <q-btn :dense='dense' v-if='showFullScreenButton' color='primary' rounded glossy icon='fullscreen' @click='onFullScreenClick'>
        <q-tooltip class='bg-primary'>{{$t('fullscreen')}}</q-tooltip>
      </q-btn>
      <q-btn :dense='dense' color='deep-orange' rounded glossy icon='close' @click='onClose'>
        <q-tooltip class='bg-deep-orange'>{{$t('close')}}</q-tooltip>
      </q-btn>
    </q-btn-group>
    <q-separator style='margin-top: 5px;' />
  </div>
</template>

<script lang='ts'>
import { ref, computed } from 'vue';
import { PublishService } from 'src/utils/services/websocket_services';
import { NodeService } from 'src/utils/services/node_service';
import { SourceModel } from 'src/utils/models/source_model';
import { StreamModel } from 'src/utils/models/stream_model';
import { LocalService, SelectOption } from 'src/utils/services/local_service';
import { List } from 'linqts';
import { useRouter } from 'vue-router';
import { StoreService } from 'src/utils/services/store_service';
import {StreamCommandBarActions} from 'src/store/module-settings/state';

export default {
  name: 'StreamCommandBar',
  emits: ['full-screen', 'stream-stop', 'connect', 'take-screenshot', 'refresh', 'restart', 'close'],
  props: {
    stream: {
      type: Object, // type is StreamModel
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
    hide:{
      type:Boolean,
      default:false,
      required:false
    }
  },
  //@ts-ignore
  setup(props: any, { emit }) {
    const router = useRouter();
    const dense = ref<boolean>(props.transparent);
    const localService = new LocalService();
    const storeService = new StoreService();
    const cloneStream: StreamModel = {...props.stream};
    const rtmpType = computed(() => {
      return new List<SelectOption>(localService.createRtmpServerTypes())
        .FirstOrDefault(x => x?.value === props.stream.rtmp_server_type)?.label ?? '';
    });
    const streamType = computed(() => {
      return new List<SelectOption>(localService.createStreamTypes())
        .FirstOrDefault(x => x?.value == props.stream.stream_type)?.label ?? '';
    });
    const publishService = new PublishService();
    const nodeService = new NodeService();

    const onRecordClick = () => {
      storeService.setStreamCommandBar({ source: cloneStream, action: StreamCommandBarActions.ShowSourceRecords});
    };

    const onAiClick = () => {
      storeService.setAiSettingsSourceId(props.stream.id);
      void router.push('ai_settings');
    };

    return {
      onFullScreenClick() {
        emit('full-screen', cloneStream);
      },
      onStreamStopClick() {
        emit('stream-stop', cloneStream);
      },
      onConnectClick() {
        emit('connect', cloneStream);
      },
      async onRestartClick() {
        emit('restart', cloneStream);
        const sourceModel: SourceModel = await nodeService.getSource(props.stream.id);
        await publishService.publishRestartStream(sourceModel);
      },
      onTakeScreenshot() {
        emit('take-screenshot', cloneStream);
      },
      onRefresh() {
        emit('refresh', cloneStream);
      },
      onSettingsClick() {
        storeService.setStreamCommandBar({ source: cloneStream, action: StreamCommandBarActions.ShowSourceSettings});
      },
      onAiClick,
      onOnvifClick() {
        storeService.setStreamCommandBar({ source: cloneStream, action: StreamCommandBarActions.ShowOnvifSettings});
      },
      onClose() {
        emit('close', cloneStream);
        storeService.setStreamCommandBar({ source: cloneStream, action: StreamCommandBarActions.CloseSourceSettings});
      },
      dense,
      onRecordClick,
      rtmpType, streamType
    };
  }
};
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

<template>
  <div>
    <q-chip square color='primary' text-color='white' icon='videocam' style='margin-right: 15px;'>
      {{ stream.name }} ({{ streamType }})
    </q-chip>
    <q-icon v-if='stream.record' name='fiber_manual_record' size='sm' color='red' class='blink_me'>
      <label style='font-size: x-small; color: black;'>REC</label>
    </q-icon>
  </div>
  <q-separator/>
  <q-btn-group>
    <q-btn color='cyan' rounded glossy icon-right='settings' @click='onSettingsClick'>
      <q-tooltip class='bg-cyan'>Settings</q-tooltip>
    </q-btn>
    <q-btn color='secondary' rounded glossy icon='sync' @click='onRefresh'>
      <q-tooltip class='bg-secondary'>Refresh</q-tooltip>
    </q-btn>
    <q-btn color='secondary' rounded glossy icon='power' @click='onConnectClick'>
      <q-tooltip class='bg-secondary'>Connect</q-tooltip>
    </q-btn>
    <q-btn color='secondary' rounded glossy icon='restart_alt' @click='onRestartClick'>
      <q-tooltip class='bg-secondary'>Restart</q-tooltip>
    </q-btn>
    <q-btn color='deep-orange' rounded glossy icon='power_off' @click='onStreamStopClick'>
      <q-tooltip class='bg-deep-orange'>Stop</q-tooltip>
    </q-btn>
    <q-btn color='purple' rounded glossy icon='dvr' @click='onRecordClick'>
      <q-tooltip class='bg-accent'>Playback</q-tooltip>
    </q-btn>
    <q-btn color='purple' rounded glossy icon='photo_camera' @click='onTakeScreenshot'>
      <q-tooltip class='bg-accent'>Take a screenshot</q-tooltip>
      <q-inner-loading :showing='takeScreenshotLoading'>
      </q-inner-loading>
    </q-btn>
    <q-btn v-if='showFullScreenButton' color='purple' rounded glossy icon='cast' @click='onFullScreenClick'>
      <q-tooltip class='bg-accent'>Fullscreen</q-tooltip>
    </q-btn>
    <q-btn color='deep-orange' rounded glossy icon='close' @click='onClose'>
      <q-tooltip class='bg-deep-orange'>Close</q-tooltip>
    </q-btn>
  </q-btn-group>

  <q-dialog v-model='showSettings' full-width full-height transition-show='flip-down' transition-hide='flip-up'>
    <SourceSettings :source-id='stream.id' @on-save='onSettingsSave' @on-delete='onSettingsDelete' />
  </q-dialog>

  <q-dialog v-model='showRecord' full-width full-height transition-show='flip-down' transition-hide='flip-up'>
    <SourceRecords :source-id='stream.id' />
  </q-dialog>


</template>

<script lang='ts'>
import { ref, computed } from 'vue';
import SourceSettings from 'components/SourceSettings.vue';
import SourceRecords from 'components/SourceRecords.vue';
import { PublishService } from 'src/utils/services/websocket-services';
import { NodeService } from 'src/utils/services/node-service';
import { SourceModel } from 'src/utils/models/source_model';
import { StreamModel } from 'src/utils/models/stream_model';
import { LocalService, SelectOption } from 'src/utils/services/local-service';
import { List } from 'linqts';

export default {
  name: 'StreamCommandBar',
  components: {
    SourceSettings,
    SourceRecords
  },
  emits: ['full-screen', 'stream-stop', 'connect', 'take-screenshot', 'refresh', 'deleted', 'restart', 'close'],
  props: {
    stream: {
      type: Object, // type is StreamModel
      required: true
    },
    showFullScreenButton:{
      type: Boolean,
      default:false
    },
    takeScreenshotLoading:{
      type:Boolean,
      default: false
    }
  },
  //@ts-ignore
  setup(props: any, { emit }) {
    const showSettings = ref<boolean>(false);
    const localService = new LocalService();
    const streamType = computed(() => {
      return new List<SelectOption>(localService.createStreamTypes())
        .FirstOrDefault(x => x?.value == props.stream.stream_type)?.label ?? '';
    });
    const publishService = new PublishService();
    const nodeService = new NodeService();

    const showRecord = ref<boolean>(false);
    const onRecordClick = () => {
      showRecord.value = true;
    };

    return {
      onFullScreenClick() {
        emit('full-screen', props.stream);
      },
      onStreamStopClick() {
        emit('stream-stop', props.stream);
      },
      onConnectClick() {
        emit('connect', props.stream);
      },
      async onRestartClick() {
        emit('restart', props.stream);
        const streamModel: StreamModel = props.stream;
        const sourceModel: SourceModel = await nodeService.getSource(streamModel.id);
        await publishService.publishRestartStream(sourceModel);
      },
      onTakeScreenshot() {
        emit('take-screenshot', props.stream);
      },
      onRefresh() {
        emit('refresh', props.stream);
      },
      onSettingsSave() {
        showSettings.value = false;
        emit('close', props.stream);
      },
      onSettingsDelete() {
        emit('deleted', props.stream);
        showSettings.value = false;
      },
      showSettings,
      onSettingsClick() {
        showSettings.value = true;
      },
      onClose(){
        emit('close', props.stream);
        showSettings.value = false;
      },
      showRecord,
      onRecordClick,
      streamType
    };
  }
};
</script>

<style scoped>
.blink_me {
  animation: blinker 1s linear infinite;
  color:red;
  font-size:medium;
}

@keyframes blinker {
  50% { opacity: 0; }
}
</style>

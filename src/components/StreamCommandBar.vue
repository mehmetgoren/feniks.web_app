<template>
  <div>
    <q-chip square color='primary' text-color='white' icon='videocam'>
      {{ stream.name }} ({{ streamType }})
    </q-chip>
  </div>
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
    <q-btn color='deep-orange' rounded glossy icon='power_off' @click='onStreamingStopClick'>
      <q-tooltip class='bg-deep-orange'>Stop</q-tooltip>
    </q-btn>
    <q-btn color='purple' rounded glossy icon='dvr' @click='onRecordingClick'>
      <q-tooltip class='bg-accent'>Playback</q-tooltip>
    </q-btn>
    <q-btn color='purple' rounded glossy icon='photo_camera' @click='onTakeScreenshot'>
      <q-tooltip class='bg-accent'>Take a screenshot</q-tooltip>
    </q-btn>
    <q-btn v-if='showFullScreenButton' color='purple' rounded glossy icon='cast' @click='onFullScreenClick'>
      <q-tooltip class='bg-accent'>Fullscreen</q-tooltip>
    </q-btn>
    <q-btn color='deep-orange' rounded glossy icon='close' @click='onClose'>
      <q-tooltip class='bg-deep-orange'>Close</q-tooltip>
    </q-btn>
  </q-btn-group>

  <q-dialog v-model='showSettings' full-width full-height transition-show='flip-down' transition-hide='flip-up'>
    <SourceSettings :stream='stream' @on-save='onSettingsSave' @on-delete='onSettingsDelete' />
  </q-dialog>

  <q-dialog v-model='showRecording' full-width full-height transition-show='flip-down' transition-hide='flip-up'>
    <SourceRecordings :stream='stream' />
  </q-dialog>


</template>

<script lang='ts'>
import { ref, computed } from 'vue';
import SourceSettings from 'components/SourceSettings.vue';
import SourceRecordings from 'components/SourceRecordings.vue';
import { PublishService } from 'src/utils/services/websocket-services';
import { NodeService } from 'src/utils/services/node-service';
import { SourceModel } from 'src/utils/models/source_model';
import { StreamingModel } from 'src/utils/models/streaming_model';
import { LocalService, SelectOption } from 'src/utils/services/local-service';
import { List } from 'linqts';

export default {
  name: 'StreamCommandBar',
  components: {
    SourceSettings,
    SourceRecordings
  },
  emits: ['full-screen', 'streaming-stop', 'connect', 'take-screenshot', 'refresh', 'deleted', 'restart', 'close'],
  props: {
    stream: {
      type: Object, // type is StreamingModel
      required: true
    },
    showFullScreenButton:{
      type: Boolean,
      default:false
    }
  },
  //@ts-ignore
  setup(props: any, { emit }) {
    const showSettings = ref<boolean>(false);
    const localService = new LocalService();
    const streamType = computed(() => {
      return new List<SelectOption>(localService.createStreamTypes())
        .FirstOrDefault(x => x?.value == props.stream.streaming_type)?.label ?? '';
    });
    const publishService = new PublishService();
    const nodeService = new NodeService();

    const showRecording = ref<boolean>(false);
    const onRecordingClick = () => {
      showRecording.value = true;
    };

    return {
      onFullScreenClick() {
        emit('full-screen', props.stream);
      },
      onStreamingStopClick() {
        emit('streaming-stop', props.stream);
      },
      onConnectClick() {
        emit('connect', props.stream);
      },
      async onRestartClick() {
        emit('restart', props.stream);
        const streamingModel: StreamingModel = props.stream;
        const sourceModel: SourceModel = await nodeService.getSource(streamingModel.id);
        await publishService.publishRestartStreaming(sourceModel);
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
      showRecording,
      onRecordingClick,
      streamType
    };
  }
};
</script>

<style scoped>

</style>

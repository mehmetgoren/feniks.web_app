<template>
  <div>
    <q-chip square color='primary' text-color='white' icon='videocam'>
      {{ source.name }} ({{ streamType }})
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
    <q-btn color='deep-orange' rounded glossy icon='block' @click='onStreamingStopClick'>
      <q-tooltip class='bg-deep-orange'>Stop</q-tooltip>
    </q-btn>
    <q-btn color='purple' rounded glossy icon='dvr' @click='onRecordingClick'>
      <q-tooltip class='bg-accent'>Playback</q-tooltip>
    </q-btn>
    <q-btn color='purple' rounded glossy icon='photo_camera' @click='onTakeScreenshot'>
      <q-tooltip class='bg-accent'>Take a screenshot</q-tooltip>
    </q-btn>
    <q-btn color='purple' rounded glossy icon='cast' @click='onFullScreenClick'>
      <q-tooltip class='bg-accent'>Fullscreen</q-tooltip>
    </q-btn>
  </q-btn-group>

  <q-dialog v-model='showSettings' full-width full-height transition-show='flip-down' transition-hide='flip-up'>
    <SourceSettings :edit-source='source' @on-save='onSourceSettingsSave' @on-delete='onSourceSettingsDelete' />
  </q-dialog>

  <q-dialog v-model='showRecording' full-width full-height transition-show='flip-down' transition-hide='flip-up'>
    <SourceRecordings :source='source' />
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
  name: 'SourceCommandBar',
  components: {
    SourceSettings,
    SourceRecordings
  },
  emits: ['full-screen', 'streaming-stop', 'connect', 'take-screenshot', 'refresh', 'source-deleted'],
  props: {
    source: {
      type: Object, // type is StreamingModel
      required: true
    }
  },
  //@ts-ignore
  setup(props: any, { emit }) {
    const showSettings = ref<boolean>(false);
    const localService = new LocalService();
    const streamType = computed(() => {
      // alert(JSON.stringify(props.source))
      // alert(props.source.stream_type);
      return new List<SelectOption>(localService.createStreamTypes())
        .FirstOrDefault(x => x?.value == props.source.streaming_type)?.label ?? '';
    });
    const publishService = new PublishService();
    const nodeService = new NodeService();

    const showRecording = ref<boolean>(false);
    const onRecordingClick = () => {
      showRecording.value = true;
    };

    return {
      onFullScreenClick() {
        emit('full-screen', props.source);
      },
      onStreamingStopClick() {
        emit('streaming-stop', props.source);
      },
      onConnectClick() {
        emit('connect', props.source);
      },
      async onRestartClick() {
        const streamingModel: StreamingModel = props.source;
        const sourceModel: SourceModel = await nodeService.getSource(streamingModel.id);
        await publishService.publishRestartStreaming(sourceModel);
      },
      onTakeScreenshot() {
        emit('take-screenshot', props.source);
      },
      onRefresh() {
        emit('refresh', props.source);
      },
      onSourceSettingsSave() {
        showSettings.value = false;
      },
      onSourceSettingsDelete() {
        emit('source-deleted', props.source);
        showSettings.value = false;
      },
      showSettings,
      onSettingsClick() {
        showSettings.value = true;
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

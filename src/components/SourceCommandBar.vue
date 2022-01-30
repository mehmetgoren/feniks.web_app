<template>
  <!--  <q-separator />-->
  <!--  <q-space />-->
  <q-btn-group>
    <!--    <q-btn color="primary" rounded glossy icon="PhotoSizeSelectActual"/>-->
    <q-btn color='cyan' rounded glossy icon-right='settings' :label='source.name' @click='onSettingsClick'>
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
    <q-layout view='lHh lpr lFf' container style='height: 600px' class='shadow-2 rounded-borders'>
      <q-header elevated class='bg-cyan'>
        <q-toolbar>
          <q-btn flat round dense icon='dvr' />
          <q-toolbar-title>
            <label style='text-transform: uppercase;font-size: medium'> {{ source.name }}</label>
          </q-toolbar-title>
          <q-space />
          <q-btn dense flat icon='close' v-close-popup>
            <q-tooltip class='bg-white text-primary'>Close</q-tooltip>
          </q-btn>
        </q-toolbar>
      </q-header>

      <q-page-container>
        <q-page padding style='background-color: whitesmoke;'>
          <SourceSettings :edit-source='source' />
        </q-page>
      </q-page-container>
    </q-layout>
  </q-dialog>

  <q-dialog v-model='showRecording' full-width full-height transition-show='flip-down' transition-hide='flip-up'>
    <SourceRecordings :source='source' />
  </q-dialog>


</template>

<script lang='ts'>
import { ref } from 'vue';
import SourceSettings from 'components/SourceSettings.vue';
import SourceRecordings from 'components/SourceRecordings.vue';
import { PublishService } from 'src/utils/services/websocket-services';
import { NodeService } from 'src/utils/services/node-service';
import { SourceModel } from 'src/utils/models/source_model';
import { StreamingModel } from 'src/utils/models/streaming_model';

export default {
  name: 'SourceCommandBar',
  components: {
    SourceSettings,
    SourceRecordings
  },
  emits: ['full-screen', 'streaming-stop', 'connect', 'take-screenshot', 'refresh'],
  props: {
    source: {
      type: Object, // type is StreamingModel
      required: true
    }
  },
  //@ts-ignore
  setup(props: any, { emit }) {
    const showSettings = ref<boolean>(false);
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
      showSettings,
      onSettingsClick() {
        showSettings.value = true;
      },
      showRecording,
      onRecordingClick
    };
  }
};
</script>

<style scoped>

</style>

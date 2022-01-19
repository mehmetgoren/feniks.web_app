<template>
  <!--  <q-separator />-->
<!--  <q-space />-->
  <q-btn-group rounded>
<!--    <q-btn color="primary" rounded glossy icon="PhotoSizeSelectActual"/>-->
    <q-btn color="amber" rounded glossy icon="settings" :label='source.name' @click='onSettingsClick'>
      <q-tooltip class="bg-warning">Settings</q-tooltip>
    </q-btn>
    <q-btn color="secondary" rounded glossy icon="sync" @click='onRefresh'>
      <q-tooltip class="bg-secondary">Refresh</q-tooltip>
    </q-btn>
    <q-btn color="secondary" rounded glossy icon="power" @click='onConnectClick'>
      <q-tooltip class="bg-secondary">Connect</q-tooltip>
    </q-btn>
    <q-btn color="deep-orange" rounded glossy icon="block" @click='onStreamingStopClick'>
      <q-tooltip class="bg-deep-orange">Stop</q-tooltip>
    </q-btn>
    <q-btn color="purple" rounded glossy icon="dvr" @click='onRecordingClick'>
      <q-tooltip class="bg-accent">Playback</q-tooltip>
    </q-btn>
    <q-btn color="purple" rounded glossy icon="photo_camera" @click='onTakeScreenshot'>
      <q-tooltip class="bg-accent">Take a screenshot</q-tooltip>
    </q-btn>
    <q-btn color="purple" rounded glossy icon="cast"  @click='onFullScreenClick'>
      <q-tooltip class="bg-accent">Fullscreen</q-tooltip>
    </q-btn>
  </q-btn-group>

  <q-dialog v-model="showSettings" transition-show="flip-down" transition-hide="flip-up">
    <q-card class="bg-primary text-white">
      <q-bar>
        <q-icon name="settings" />
        <div>{{source.name}}</div>
        <q-space />
        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip class="bg-white text-primary">Close</q-tooltip>
        </q-btn>
      </q-bar>
      <q-card-section>

        <SourceSettings />

      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog v-model="showRecording" transition-show="flip-down" transition-hide="flip-up">
    <SourceRecordings :source='source' style="width: 45%; max-width: 80vw; height: 68%;" />
  </q-dialog>


</template>

<script lang='ts'>
import { ref } from 'vue';
import SourceSettings from 'components/SourceSettings.vue'
import SourceRecordings from 'components/SourceRecordings.vue';

export default {
  name: 'SourceSettingsBar',
  components:{
    SourceSettings,
    SourceRecordings
  },
  emits: ['full-screen', 'streaming-stop', 'connect', 'take-screenshot', 'refresh'],
  props: {
    source: {
      type: Object,
      required: true
    }
  },
  //@ts-ignore
  setup(props: any, {emit}) {
    const showSettings = ref<boolean>(false);
    const onSettingsClick = () => {
      showSettings.value = true;
    };

    const showRecording = ref<boolean>(false);
    const onRecordingClick = () => {
      showRecording.value = true;
    };

    return {
      onFullScreenClick() {
        emit('full-screen', props.source);
      },
      onStreamingStopClick(){
        emit('streaming-stop', props.source);
      },
      onConnectClick(){
        emit('connect', props.source);
      },
      onTakeScreenshot(){
        emit('take-screenshot', props.source);
      },
      onRefresh(){
        emit('refresh', props.source);
      },
      showSettings,
      onSettingsClick,
      showRecording,
      onRecordingClick,
    }
  }
};
</script>

<style scoped>

</style>

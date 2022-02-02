<template>
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

        <div class='q-pa-md q-gutter-sm' style='margin-bottom: -25px'>
          <CommandBar :show-restore='false' @on-save='onSave' @on-delete='onDelete' />
        </div>
        <div class='q-pa-md'>
          <q-btn-group push>
            <q-btn push label='Basics' color='cyan' icon='videocam' @click='step=1' />
            <q-btn push label='Connection' color='cyan' icon='power' @click='step=2' />
            <q-btn push label='Input' color='cyan' icon='input' @click='step=3' />
            <q-btn push label='Stream' color='cyan' icon='live_tv' @click='step=4' />
            <q-btn push label='Jpeg Snapshot' color='cyan' icon='image' @click='step=5' />
            <q-btn v-if='source.recording' push label='Recording' color='cyan' icon='radio_button_checked'
                   @click='step=6' />
            <q-btn push label='Logging' color='cyan' icon='announcement' @click='step=100' />
          </q-btn-group>
          <q-space style='margin-bottom: 5px;' />

          <q-stepper v-model='step' vertical color='cyan' animated>
            <q-step :name='1' color='cyan' title='Source Basic Settings' icon='settings' :done='step > 1'>
              <q-form class='q-gutter-md'>
                <q-checkbox :dense='dense' v-model='source.enabled' color='cyan' label='Enable' />
                <q-input :dense='dense' filled v-model.trim='source.name' label='Name' color='cyan'
                         lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']" />
                <q-input :dense='dense' filled v-model.trim='source.brand' label='Brand' color='cyan' />
                <q-input :dense='dense' filled v-model.trim='source.description' label='Description' color='cyan' />
                <q-input :dense='dense' filled v-model.number='source.need_reload_interval' type='number'
                         label='Reload Interval (In Seconds)' color='cyan' />
                <q-toggle :dense='dense' v-model='source.recording' color='red'
                          :label='"Recording " + (source.recording ? "On" : "Off")' />
              </q-form>
              <q-stepper-navigation>
                <q-btn @click='step = 2' color='cyan' label='Continue' />
              </q-stepper-navigation>
            </q-step>

            <q-step :name='2' title='Connection' icon='power' color='cyan' :done='step > 2'>
              <q-form class='q-gutter-md'>
                <q-input :dense='dense' filled v-model.trim='source.rtsp_address' color='cyan' label='Address'
                         lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']" />
                <q-select :dense='dense' emit-value map-options filled v-model='source.input_type'
                          :options='inputTypes'
                          label='Input Type' transition-show='flip-up' transition-hide='flip-down' color='cyan' />
                <q-select :dense='dense' emit-value map-options filled v-model='source.rtsp_transport'
                          :options='rtspTransports' label='RTSP Transport' transition-show='flip-up'
                          transition-hide='flip-down' color='cyan' />
              </q-form>
              <q-stepper-navigation>
                <q-btn @click='step = 3' color='cyan' label='Continue' />
                <q-btn flat @click='step = 1' color='cyan' label='Back' class='q-ml-sm' />
              </q-stepper-navigation>
            </q-step>

            <q-step :name='3' title='Input' icon='input' color='cyan' disable>
              <q-form class='q-gutter-md'>
                <q-input :dense='dense' filled v-model.number='source.analyzation_duration' type='number'
                         label='Analyzation Duration' color='cyan' />
                <q-input :dense='dense' filled v-model.number='source.probe_size' type='number' label='Probe Size'
                         color='cyan' />
                <q-input :dense='dense' filled v-model.number='source.input_frame_rate' type='number' label='FPS'
                         hint='Frame Rate' color='cyan' />
                <q-toggle :dense='dense' v-model='source.use_camera_timestamp' checked-icon='check'
                          label='Use Camera Timestamps' color='cyan' />
                <q-space />
                <q-toggle :dense='dense' v-model='source.use_hwaccel' checked-icon='check'
                          label='Use Hardware Accelerator' color='cyan' />
                <q-select v-if='source.use_hwaccel' :dense='dense' emit-value map-options filled
                          v-model='source.hwaccel_engine' color='cyan'
                          :options='accelerationEngines' label='Acceleration Engine' transition-show='scale'
                          transition-hide='scale' />
                <q-select v-if='source.use_hwaccel' :dense='dense' emit-value map-options filled
                          v-model='source.video_decoder' color='cyan'
                          :options='videoDecoders' label='Video Decoders' transition-show=''
                          transition-hide='scale' />
                <q-input v-if='source.use_hwaccel' :dense='dense' filled v-model.trim='source.hwaccel_device'
                         label='HWAccel Device' color='cyan' />
              </q-form>
              <q-stepper-navigation>
                <q-btn @click='step = 4' color='cyan' label='Continue' />
                <q-btn flat @click='step = 2' color='cyan' label='Back' class='q-ml-sm' />
              </q-stepper-navigation>
            </q-step>

            <q-step :name='4' title='Stream' caption='Optional' icon='live_tv' color='cyan' :done='step > 4'>
              <q-form class='q-gutter-md'>
                <q-select :dense='dense' emit-value map-options filled
                          v-model='source.stream_type' color='cyan'
                          :options='streamTypes' label='Stream Type' transition-show='flip-up'
                          transition-hide='flip-down' />
                <q-select v-if='source.stream_type===1' :dense='dense' emit-value map-options filled
                          v-model='source.rtmp_server_type' color='cyan'
                          :options='rtmpServerTypes' label='RTMP Server' transition-show='flip-up'
                          transition-hide='flip-down' />
                <q-select v-if='source.stream_type===1&&source.rtmp_server_type===2' :dense='dense' emit-value
                          map-options filled
                          v-model='source.flv_player_connection_type' color='cyan'
                          :options='flvPlayerConnectionTypes' label='Connection Type' transition-show='flip-up'
                          transition-hide='flip-down' />
                <q-select v-if='source.stream_type !== 2' :dense='dense' emit-value map-options filled
                          v-model='source.stream_video_codec' color='cyan'
                          :options='streamVideoCodecs' label='Video Codec' transition-show='scale'
                          transition-hide='scale' />
                <q-input v-if='source.stream_video_codec !== 3 && source.stream_type===0' :dense='dense' filled
                         v-model.number='source.hls_time' type='number' color='cyan'
                         label='HLS Segment Length' />
                <q-input v-if='source.stream_video_codec !== 3 && source.stream_type===0' :dense='dense' filled
                         v-model.number='source.hls_list_size' color='cyan'
                         type='number'
                         label='HLS List Size' />
                <q-select v-if='source.stream_type!==2 && source.stream_video_codec !== 3' :dense='dense' emit-value
                          map-options filled color='cyan'
                          v-model='source.hls_preset'
                          :options='hlsPresets' label='HLS Preset' transition-show='scale' transition-hide='scale' />
                <q-input v-if='source.stream_type!==2 && source.stream_video_codec !== 3' :dense='dense' filled
                         v-model.number='source.stream_quality' color='cyan'
                         type='number' min='2' max='31'
                         label='Quality' />
                <q-input v-if='source.stream_type===2 || source.stream_video_codec !== 3' :dense='dense' filled
                         v-model.number='source.stream_frame_rate' color='cyan'
                         type='number' label='Frame Rate' />
                <q-input v-if='source.stream_type===2 || source.stream_video_codec !== 3' :dense='dense' filled
                         v-model.number='source.stream_width' color='cyan'
                         type='number' label='Width' />
                <q-input v-if='source.stream_type===2 || source.stream_video_codec !== 3' :dense='dense' filled
                         v-model.number='source.stream_height' color='cyan'
                         type='number' label='Height' />
                <q-select v-if='source.stream_type!==2 && source.stream_video_codec !== 3' :dense='dense' emit-value
                          map-options filled v-model='source.stream_rotate' color='cyan'
                          :options='streamRotations' label='Rotate' transition-show='scale' transition-hide='scale' />
                <q-select v-if='source.stream_type !== 2' :dense='dense' emit-value map-options filled
                          v-model='source.stream_audio_codec' color='cyan'
                          :options='streamAudioCodecs' label='Audio Codec' transition-show='scale'
                          transition-hide='scale' />
                <q-select v-if='source.stream_type !== 2 && source.stream_audio_codec !== 1' :dense='dense' emit-value
                          map-options filled
                          v-model='source.stream_audio_channel' color='cyan'
                          :options='audioChannels' label='Audio Channel' transition-show='flip-up'
                          transition-hide='flip-down' />
                <q-select v-if='source.stream_type !== 2 && source.stream_audio_codec !== 1' :dense='dense' emit-value
                          map-options filled
                          v-model='source.stream_audio_quality' color='cyan'
                          :options='audioQualities' label='Audio Quality' transition-show='scale'
                          transition-hide='scale' />
                <q-select v-if='source.stream_type !== 2 && source.stream_audio_codec !== 1' :dense='dense' emit-value
                          map-options filled
                          v-model='source.stream_audio_sample_rate' color='cyan'
                          :options='audioSampleRates' label='Audio SampleRate' transition-show='scale'
                          transition-hide='scale' />
                <q-input v-if='source.stream_type !== 2 && source.stream_audio_codec !== 1' :dense='dense' filled
                         v-model.number='source.stream_audio_volume'
                         label='Audio Volume' color='cyan' />
              </q-form>

              <q-stepper-navigation>
                <q-btn @click='step = 5' color='cyan' label='Continue' />
                <q-btn flat @click='step = 3' color='cyan' label='Back' class='q-ml-sm' />
              </q-stepper-navigation>
            </q-step>

            <q-step :name='5' title='Jpeg Snapshot' icon='image' color='cyan' :done='step > 5'>
              <q-form class='q-gutter-md'>
                <q-toggle :dense='dense' v-model='source.jpeg_enabled' checked-icon='check' color='cyan'
                          :label='"Jpeg Snapshot " + (source.jpeg_enabled ? "Enabled" : "Disabled")' />
                <q-input v-if='source.jpeg_enabled' :dense='dense' filled v-model.number='source.jpeg_frame_rate'
                         type='number' label='Frame Rate' color='cyan' />
                <q-input v-if='source.jpeg_enabled' :dense='dense' filled v-model.number='source.jpeg_width'
                         type='number' label='Width' />
                <q-input v-if='source.jpeg_enabled' :dense='dense' filled v-model.number='source.jpeg_height'
                         type='number' label='Height' color='cyan' />
              </q-form>
              <q-stepper-navigation>
                <q-btn @click='step = source.recording ? 6 : 100' color='cyan' label='Continue' />
                <q-btn flat @click='step = 4' color='cyan' label='Back' class='q-ml-sm' />
              </q-stepper-navigation>
            </q-step>

            <q-step v-if='source.recording' :name='6' title='Recording' icon='radio_button_checked' color='cyan'
                    :done='step > 6'>
              <q-form class='q-gutter-md'>
                <q-select :dense='dense' emit-value map-options filled
                          v-model='source.record_file_type' color='cyan'
                          :options='recordFileTypes' label='Record File Type'
                          transition-show='scale' transition-hide='scale' />
                <q-select :dense='dense' emit-value map-options filled v-model='source.record_video_codec'
                          :options='recordVideoCodecs' label='Record Video Codec' color='cyan'
                          transition-show='scale' transition-hide='scale' />
                <q-input v-if='showRecordingDetail' :dense='dense' filled v-model.number='source.record_quality'
                         type='number' label='Record Quality' color='cyan' />
                <q-select v-if='showRecordingDetail' :dense='dense' emit-value map-options filled
                          v-model='source.record_preset' color='cyan'
                          :options='recordPresets' label='Record Preset'
                          transition-show='scale' transition-hide='scale' />
                <q-input v-if='showRecordingDetail' :dense='dense' filled v-model.number='source.record_frame_rate'
                         type='number' label='Video Record Frame Rate' color='cyan' />
                <q-input v-if='showRecordingDetail' :dense='dense' filled v-model.number='source.record_width'
                         type='number'
                         label='Record Width' color='cyan' />
                <q-input v-if='showRecordingDetail' :dense='dense' filled v-model.number='source.record_height'
                         type='number'
                         label='Record Height' color='cyan' />
                <q-input :dense='dense' filled v-model.number='source.record_segment_interval'
                         type='number' label='Recording Segment Interval' color='cyan' />
                <q-select v-if='showRecordingDetail' :dense='dense' emit-value map-options filled
                          v-model='source.record_rotate' color='cyan'
                          :options='recordRotations' label='Record Rotate' transition-show='scale'
                          transition-hide='scale' />
                <q-select :dense='dense' emit-value map-options filled v-model='source.record_audio_codec'
                          :options='recordAudioCodecs' label='Record Audio Codec' color='cyan'
                          transition-show='scale' transition-hide='scale' />
                <q-select v-if='source.record_audio_codec !== 1' :dense='dense' emit-value map-options filled
                          v-model='source.record_audio_channel' color='cyan'
                          :options='audioChannels' label='Audio Channel' transition-show='flip-up'
                          transition-hide='flip-down' />
                <q-select v-if='source.record_audio_codec !== 1' :dense='dense' emit-value map-options filled
                          v-model='source.record_audio_quality' color='cyan'
                          :options='audioQualities' label='Audio Quality' transition-show='scale'
                          transition-hide='scale' />
                <q-select v-if='source.record_audio_codec !== 1' :dense='dense' emit-value map-options filled
                          v-model='source.record_audio_sample_rate' color='cyan'
                          :options='audioSampleRates' label='Audio SampleRate' transition-show='scale'
                          transition-hide='scale' />
                <q-input v-if='source.record_audio_codec !== 1' :dense='dense' filled
                         v-model.number='source.record_audio_volume'
                         label='Audio Volume' color='cyan' />
              </q-form>
              <q-stepper-navigation>
                <q-btn @click='step = 100' color='cyan' label='Continue' />
                <q-btn flat @click='step = 5' color='cyan' label='Back' class='q-ml-sm' />
              </q-stepper-navigation>
            </q-step>

            <q-step :name='100' title='Logging' icon='announcement' color='cyan'>
              <q-select :dense='dense' emit-value map-options filled v-model='source.log_level' :options='logLevels'
                        label='Log Level' transition-show='scale' transition-hide='scale' color='cyan' />
              <q-stepper-navigation>
                <q-btn flat @click='step = source.recording ? 6 : 5' color='cyan' label='Back' class='q-ml-sm' />
              </q-stepper-navigation>
            </q-step>
          </q-stepper>
        </div>

      </q-page>
    </q-page-container>

  </q-layout>
</template>

<script lang='ts'>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'src/store';
import { SourceModel } from 'src/utils/models/source_model';
import CommandBar from 'src/components/CommandBar.vue';
import { NodeService } from 'src/utils/services/node-service';
import { useQuasar } from 'quasar';
import { PublishService } from 'src/utils/services/websocket-services';
import { isNullEmpty, isNullOrUndefined } from 'src/utils/utils';
import { LocalService } from 'src/utils/services/local-service';

export default {
  name: 'SourceSettings',
  components: { CommandBar },
  emits: ['on-save', 'on-delete'],
  props: {
    editSource: {
      type: Object,
      required: false,
      default: null
    }
  },
  //@ts-ignore
  setup(props: any, { emit }) {
    const $store = useStore();
    const dense = computed(() => $store.getters['settings/dense']);
    const source = ref<SourceModel>(createEmptySource());
    const showRecordingDetail = computed(() => {
      //@ts-ignore
      return source.value.record_video_codec != 5 && source.value.record_video_codec < 14;
    });
    const nodeService = new NodeService();
    onMounted(async () => {
      if (props.editSource != null) {
        source.value = await nodeService.getSource(<string>props.editSource.id);
      }
    });
    const localService = new LocalService();
    const inputTypes = ref(localService.createInputType());
    const rtspTransports = ref(localService.createRtspTransport());
    const logLevels = ref(localService.createLogLevels());
    const accelerationEngines = ref(localService.createAccelerationEngines());
    const videoDecoders = ref(localService.createVideoDecoders());
    const streamTypes = ref(localService.createStreamTypes());
    const flvPlayerConnectionTypes = ref(localService.createFlvPlayerConnectionTypes());
    const streamVideoCodecs = ref(localService.createStreamVideoCodecs());
    const streamAudioCodecs = ref(localService.createStreamAudioCodecs());
    const hlsPresets = ref(localService.createPresets());
    const streamRotations = ref(localService.createRotations());
    const rtmpServerTypes = ref(localService.createRtmpServerTypes());
    const audioChannels = ref(localService.createAudioChannels());
    const audioQualities = ref(localService.createAudioQualities());
    const audioSampleRates = ref(localService.createAudioSampleRates());
    const recordFileTypes = ref(localService.createRecordFileTypes());
    const recordVideoCodecs = ref(localService.createRecordVideoCodecs());
    const recordAudioCodecs = ref(localService.createRecordAudioCodecs());
    const recordPresets = ref(localService.createPresets());
    const recordRotations = ref(localService.createRotations());

    const publishService = new PublishService();
    const $q = useQuasar();

    async function onSave(e: any) {
      let model = source.value;
      if (!model.name || !model.rtsp_address) {
        $q.notify({
          message: 'Please enter both "Name" and  "Address" fields',
          caption: 'Invalid',
          color: 'red-14',
          position: 'bottom-right'
        });
        return;
      }
      const isAdded = isNullEmpty(<string>source.value.id);
      source.value = await nodeService.saveSource(model);
      model = source.value;
      publishService.publishEditor({
        id: model.id,
        brand: model.brand,
        name: model.name,
        rtsp_address: model.rtsp_address,
        event_type: 2
      }).then().catch(console.error);
      if (isAdded) {
        $store.commit('settings/addSourceToLeftMenu', source.value);
      } else {
        $store.commit('settings/updateSourceToLeftMenu', source.value);
      }
      $q.notify({
        message: model.name + (' has been ' + (isAdded ? 'added' : 'saved')),
        color: 'green',
        position: 'bottom-right'
      });
      emit('on-save', e);
    }

    async function onDelete(e: any) {
      const model = source.value;
      if (isNullOrUndefined(model)) {
        return;
      }
      const result = await nodeService.removeSource(<string>model.id);
      if (!result) {
        $q.notify({
          message: 'No source has been deleted',
          color: 'green',
          position: 'bottom-right'
        });
        return;
      }
      emit('on-delete', e);
      $store.commit('settings/removeSourceFromLeftMenu', model.id);
      $q.notify({
        message: model.name + ' has been removed permanently',
        color: 'green',
        position: 'bottom-right'
      });
    }

    return {
      dense,
      source,
      showRecordingDetail,
      inputTypes,
      rtspTransports,
      logLevels,
      accelerationEngines,
      videoDecoders,
      streamTypes,
      streamAudioCodecs,
      flvPlayerConnectionTypes,
      streamVideoCodecs,
      hlsPresets,
      streamRotations,
      rtmpServerTypes,
      audioChannels,
      audioQualities,
      audioSampleRates,
      recordFileTypes,
      recordVideoCodecs,
      recordAudioCodecs,
      recordPresets,
      recordRotations,
      step: ref(1),
      onSave,
      onDelete
    };
  }
};

function createEmptySource(): SourceModel {
  return {
    enabled: true,
    id: '',
    brand: '',
    name: 'bitch',
    description: '',
    recording: false,

    rtsp_address: 'rtsp://Admin1:Admin1@192.168.0.15/live0',
    input_type: 0,
    rtsp_transport: 0,
    analyzation_duration: 1000000, // or set to 100000 if you are using RTSP and having stream issues.
    probe_size: 1000000, //or set to 100000 if you are using RTSP and having stream issues.
    input_frame_rate: 0,
    use_camera_timestamp: false,
    use_hwaccel: false,
    hwaccel_engine: 0,
    video_decoder: 0,
    hwaccel_device: '',

    stream_type: 1,
    rtmp_server_type: 0,
    flv_player_connection_type: 0,
    rtmp_server_address: '',
    need_reload_interval: 300,
    stream_video_codec: 3, // copy
    stream_audio_codec: 9, // copy
    stream_audio_channel: 0,
    stream_audio_quality: 0,
    stream_audio_sample_rate: 0,
    stream_audio_volume: 100,
    hls_time: 2,
    hls_list_size: 3,
    hls_preset: 0,
    stream_quality: 0,
    stream_frame_rate: 0,
    stream_width: 0,
    stream_height: 0,
    stream_rotate: 0,

    jpeg_enabled: false,
    jpeg_frame_rate: 0,
    jpeg_width: 0,
    jpeg_height: 0,

    record_file_type: 0,
    record_video_codec: 5,
    record_quality: 0,
    record_preset: 0,
    record_frame_rate: 0,
    record_width: 0,
    record_height: 0,
    record_segment_interval: 15,
    record_rotate: 0,
    record_audio_codec: 9,
    record_audio_channel: 0,
    record_audio_quality: 0,
    record_audio_sample_rate: 0,
    record_audio_volume: 100,

    log_level: 0
  };
}
</script>

<template>
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
          <q-input :dense='dense' filled v-model='source.name' label='Name' color='cyan'
                   lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']" />
          <q-input :dense='dense' filled v-model='source.brand' label='Brand' color='cyan' />
          <q-input :dense='dense' filled v-model='source.description' label='Description' color='cyan' />
          <q-toggle :dense='dense' v-model='source.recording' color='red'
                    :label='"Recording " + (source.recording ? "On" : "Off")' />
        </q-form>
        <q-stepper-navigation>
          <q-btn @click='step = 2' color='cyan' label='Continue' />
        </q-stepper-navigation>
      </q-step>

      <q-step :name='2' title='Connection' icon='power' color='cyan' :done='step > 2'>
        <q-form class='q-gutter-md'>
          <q-input :dense='dense' filled v-model='source.rtsp_address' color='cyan' label='Address'
                   lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']" />
          <q-select :dense='dense' emit-value map-options filled v-model='source.input_type' :options='inputTypes'
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
          <q-input :dense='dense' filled v-model='source.analyzation_duration' type='number'
                   label='Analyzation Duration' color='cyan' />
          <q-input :dense='dense' filled v-model='source.probe_size' type='number' label='Probe Size' color='cyan' />
          <q-input :dense='dense' filled v-model='source.input_frame_rate' type='number' label='FPS'
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
          <q-input v-if='source.use_hwaccel' :dense='dense' filled v-model='source.hwaccel_device'
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
                    v-model='source.stream_rtmp_server' color='cyan'
                    :options='rtmpServers' label='RTMP Server' transition-show='flip-up'
                    transition-hide='flip-down' />
          <q-select v-if='source.stream_type===1' :dense='dense' emit-value map-options filled
                    v-model='source.stream_connection_type' color='cyan'
                    :options='flvConnectionTypes' label='Connection Type' transition-show='flip-up'
                    transition-hide='flip-down' />
          <q-select v-if='source.stream_type !== 2' :dense='dense' emit-value map-options filled
                    v-model='source.stream_video_codec' color='cyan'
                    :options='streamVideoCodecs' label='Video Codec' transition-show='scale' transition-hide='scale' />
          <q-input v-if='source.stream_video_codec !== 3 && source.stream_type===0' :dense='dense' filled
                   v-model='source.hls_time' type='number' color='cyan'
                   label='HLS Segment Length' />
          <q-input v-if='source.stream_video_codec !== 3 && source.stream_type===0' :dense='dense' filled
                   v-model='source.hls_list_size' color='cyan'
                   type='number'
                   label='HLS List Size' />
          <q-select v-if='source.stream_type!==2 && source.stream_video_codec !== 3' :dense='dense' emit-value
                    map-options filled color='cyan'
                    v-model='source.hls_preset'
                    :options='hlsPresets' label='HLS Preset' transition-show='scale' transition-hide='scale' />
          <q-input v-if='source.stream_type!==2 && source.stream_video_codec !== 3' :dense='dense' filled
                   v-model='source.stream_quality' color='cyan'
                   type='number' min='2' max='31'
                   label='Quality' />
          <q-input v-if='source.stream_type===2 || source.stream_video_codec !== 3' :dense='dense' filled
                   v-model='source.stream_frame_rate' color='cyan'
                   type='number' label='Frame Rate' />
          <q-input v-if='source.stream_type===2 || source.stream_video_codec !== 3' :dense='dense' filled
                   v-model='source.stream_width' color='cyan'
                   type='number' label='Width' />
          <q-input v-if='source.stream_type===2 || source.stream_video_codec !== 3' :dense='dense' filled
                   v-model='source.stream_height' color='cyan'
                   type='number' label='Height' />
          <q-select v-if='source.stream_type!==2 && source.stream_video_codec !== 3' :dense='dense' emit-value
                    map-options filled v-model='source.stream_rotate' color='cyan'
                    :options='streamRotations' label='Rotate' transition-show='scale' transition-hide='scale' />
          <q-select v-if='source.stream_type !== 2' :dense='dense' emit-value map-options filled
                    v-model='source.stream_audio_codec' color='cyan'
                    :options='streamAudioCodecs' label='Audio Codec' transition-show='scale' transition-hide='scale' />
          <q-select v-if='source.stream_type !== 2 && source.stream_audio_codec !== 1' :dense='dense' emit-value
                    map-options filled
                    v-model='source.stream_audio_channel' color='cyan'
                    :options='audioChannels' label='Audio Channel' transition-show='flip-up'
                    transition-hide='flip-down' />
          <q-select v-if='source.stream_type !== 2 && source.stream_audio_codec !== 1' :dense='dense' emit-value
                    map-options filled
                    v-model='source.stream_audio_quality' color='cyan'
                    :options='audioQualities' label='Audio Quality' transition-show='scale' transition-hide='scale' />
          <q-select v-if='source.stream_type !== 2 && source.stream_audio_codec !== 1' :dense='dense' emit-value
                    map-options filled
                    v-model='source.stream_audio_sample_rate' color='cyan'
                    :options='audioSampleRates' label='Audio SampleRate' transition-show='scale'
                    transition-hide='scale' />
          <q-input v-if='source.stream_type !== 2 && source.stream_audio_codec !== 1' :dense='dense' filled
                   v-model='source.stream_audio_volume'
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
          <q-input v-if='source.jpeg_enabled' :dense='dense' filled v-model='source.jpeg_frame_rate'
                   type='number' label='Frame Rate' color='cyan' />
          <q-input v-if='source.jpeg_enabled' :dense='dense' filled v-model='source.jpeg_width'
                   type='number' label='Width' />
          <q-input v-if='source.jpeg_enabled' :dense='dense' filled v-model='source.jpeg_height'
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
          <q-input v-if='showRecordingDetail' :dense='dense' filled v-model='source.record_quality'
                   type='number' label='Record Quality' color='cyan' />
          <q-select v-if='showRecordingDetail' :dense='dense' emit-value map-options filled
                    v-model='source.record_preset' color='cyan'
                    :options='recordPresets' label='Record Preset'
                    transition-show='scale' transition-hide='scale' />
          <q-input v-if='showRecordingDetail' :dense='dense' filled v-model='source.record_frame_rate'
                   type='number' label='Video Record Frame Rate' color='cyan' />
          <q-input v-if='showRecordingDetail' :dense='dense' filled v-model='source.record_width' type='number'
                   label='Record Width' color='cyan' />
          <q-input v-if='showRecordingDetail' :dense='dense' filled v-model='source.record_height' type='number'
                   label='Record Height' color='cyan' />
          <q-input :dense='dense' filled v-model='source.record_segment_interval'
                   type='number' label='Recording Segment Interval' color='cyan' />
          <q-select v-if='showRecordingDetail' :dense='dense' emit-value map-options filled
                    v-model='source.record_rotate' color='cyan'
                    :options='recordRotations' label='Record Rotate' transition-show='scale' transition-hide='scale' />
          <q-select :dense='dense' emit-value map-options filled v-model='source.record_audio_codec'
                    :options='recordAudioCodecs' label='Record Audio Codec' color='cyan'
                    transition-show='scale' transition-hide='scale' />
          <q-select v-if='source.record_audio_codec !== 1' :dense='dense' emit-value map-options filled
                    v-model='source.record_audio_channel' color='cyan'
                    :options='audioChannels' label='Audio Channel' transition-show='flip-up'
                    transition-hide='flip-down' />
          <q-select v-if='source.record_audio_codec !== 1' :dense='dense' emit-value map-options filled
                    v-model='source.record_audio_quality' color='cyan'
                    :options='audioQualities' label='Audio Quality' transition-show='scale' transition-hide='scale' />
          <q-select v-if='source.record_audio_codec !== 1' :dense='dense' emit-value map-options filled
                    v-model='source.record_audio_sample_rate' color='cyan'
                    :options='audioSampleRates' label='Audio SampleRate' transition-show='scale'
                    transition-hide='scale' />
          <q-input v-if='source.record_audio_codec !== 1' :dense='dense'  filled v-model='source.record_audio_volume'
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
</template>

<script lang='ts'>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'src/store';
import { SourceModel } from 'src/utils/models/source_model';
import CommandBar from 'src/components/CommandBar.vue';
import { NodeService } from 'src/utils/services/node-service';
import { useQuasar } from 'quasar';
import { PublishService } from 'src/utils/services/websocket-services';
import { isNullEmpty } from 'src/utils/utils';

export default {
  name: 'SourceSettings',
  components: { CommandBar },
  props: {
    editSource: {
      type: Object,
      required: false,
      default: null
    }
  },
  setup(props: any) {
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
        console.warn(JSON.stringify(source.value));
        source.value = await nodeService.getSource(<string>props.editSource.id);
        console.error(JSON.stringify(source.value));
      }
    });
    const inputTypes = ref(createInputType());
    const rtspTransports = ref(createRtspTransport());
    const logLevels = ref(createLogLevels());
    const accelerationEngines = ref(createAccelerationEngines());
    const videoDecoders = ref(createVideoDecoders());
    const streamTypes = ref(createStreamTypes());
    const flvConnectionTypes = ref(createFlvConnectionTypes());
    const streamVideoCodecs = ref(createStreamVideoCodecs());
    const streamAudioCodecs = ref(createStreamAudioCodecs());
    const hlsPresets = ref(createPresets());
    const streamRotations = ref(createRotations());
    const rtmpServers = ref(createRtmpServers());
    const audioChannels = ref(createAudioChannels());
    const audioQualities = ref(createAudioQualities());
    const audioSampleRates = ref(createAudioSampleRates());
    const recordFileTypes = ref(createRecordFileTypes());
    const recordVideoCodecs = ref(createRecordVideoCodecs());
    const recordAudioCodecs = ref(createRecordAudioCodecs());
    const recordPresets = ref(createPresets());
    const recordRotations = ref(createRotations());

    const publishService = new PublishService();
    const $q = useQuasar();

    async function onSave() {
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
    }

    async function onDelete() {
      const model = source.value;
      await nodeService.removeSource(<string>model.id);
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
      flvConnectionTypes,
      streamVideoCodecs,
      hlsPresets,
      streamRotations,
      rtmpServers,
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
    name: '',
    description: '',
    recording: false,

    rtsp_address: '',
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

    stream_type: 0,
    stream_rtmp_server: 0,
    stream_connection_type: 0,
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

function createInputType() {
  return [
    { value: 0, label: 'H.264 / H.265 / H.265+' },
    { value: 1, label: 'MPEG4' },
    { value: 2, label: 'HLS' }
  ];
}

function createRtspTransport() {
  return [
    { value: 0, label: 'Auto' },
    { value: 1, label: 'TCP' },
    { value: 2, label: 'UDP' },
    { value: 3, label: 'HTTP' }
  ];
}

function createLogLevels() {
  return [
    { value: 0, label: 'None' },
    { value: 1, label: 'Quiet' },
    { value: 2, label: 'Panic' },
    { value: 3, label: 'Fatal' },
    { value: 4, label: 'Error' },
    { value: 5, label: 'Warning' },
    { value: 6, label: 'Info' },
    { value: 7, label: 'Verbose' },
    { value: 8, label: 'Debug' },
    { value: 9, label: 'Trace' }
  ];
}

function createAccelerationEngines() {
  return [
    { value: 0, label: 'Auto' },
    { value: 1, label: 'vdpau' },
    { value: 2, label: 'cuda (NVIDIA NVENC)' },
    { value: 3, label: 'vaapi (VA-API)' },
    { value: 4, label: 'DRM object sharing' },
    { value: 5, label: 'OpenCL' },
    { value: 6, label: 'cuvid (NVIDIA NVENC)' }
  ];
}

function createVideoDecoders() {
  return [
    { value: 0, label: 'Auto' },
    { value: 1, label: 'NVIDIA H.264 CUVID' },
    { value: 2, label: 'NVIDIA H.265 CUVID' },
    { value: 3, label: 'NVIDIA MJPEG CUVID' },
    { value: 4, label: 'NVIDIA MPEG4 CUVID' },
    { value: 5, label: 'Quick Sync Video H.264' },
    { value: 6, label: 'Quick Sync Video H.265' },
    { value: 7, label: 'Quick Sync Video MPEG2' },
    { value: 8, label: 'Raspberry Pi H.264' },
    { value: 9, label: 'Raspberry Pi MPEG-2' },
    { value: 10, label: 'Raspberry Pi MPEG-4' }
  ];
}

function createStreamTypes() {
  return [
    { value: 0, label: 'HLS' },
    { value: 1, label: 'FLV' },
    { value: 2, label: 'Direct Read' }
  ];
}

function createStreamVideoCodecs() {
  return [
    { value: 0, label: 'Auto' },
    { value: 1, label: 'libx264' },
    { value: 2, label: 'libx265' },
    { value: 3, label: 'copy' },
    { value: 4, label: 'H.264 VA-API (Intel HW Accel)' },
    { value: 5, label: 'H.265 VA-API (Intel HW Accel)' },
    { value: 6, label: 'H.264 NVENC (NVIDIA HW Accel)' },
    { value: 7, label: 'H.265 NVENC (NVIDIA HW Accel)' },
    { value: 8, label: 'H.264 (Quick Sync Video)' },
    { value: 9, label: 'H.265 (Quick Sync Video)' },
    { value: 10, label: 'MPEG2 (Quick Sync Video)' },
    { value: 11, label: 'H.264 openMAX (Raspberry Pi)' },
    { value: 12, label: 'AV1' },
    { value: 13, label: 'VP8' },
    { value: 14, label: 'VP9' }
  ];
}

function createPresets() {
  return [
    { value: 0, label: 'Auto' },
    { value: 1, label: 'Ultra Fast' },
    { value: 2, label: 'Super Fast' },
    { value: 3, label: 'Very Fast' },
    { value: 4, label: 'Faster' },
    { value: 5, label: 'Fast' },
    { value: 6, label: 'Medium' },
    { value: 7, label: 'Slow' },
    { value: 8, label: 'Slower' },
    { value: 9, label: 'Very Slow' },
    { value: 10, label: 'Placebo' }
  ];
}

function createRotations() {
  return [
    { value: 0, label: 'No Rotation' },
    { value: 1, label: '180 Degrees' },
    { value: 2, label: '90 Counter Clockwise and Vertical Flip (default)' },
    { value: 3, label: '90 Clockwise' },
    { value: 4, label: '90 Clockwise and Vertical Flip' },
    { value: 5, label: '90 Counter' }
  ];
}

function createStreamAudioCodecs() {
  return [
    { value: 0, label: 'Auto' },
    { value: 1, label: 'No Audio' },
    { value: 2, label: 'Vorbis' },
    { value: 3, label: 'Opus' },
    { value: 4, label: 'MP3LAME' },
    { value: 5, label: 'AAC' },
    { value: 6, label: 'AC3' },
    { value: 7, label: 'DTS' },
    { value: 8, label: 'ALAC' },
    { value: 9, label: 'copy' }
  ];
}

function createRtmpServers() {
  return [
    { value: 0, label: 'SRS' },
    { value: 1, label: 'LiveGo' },
    { value: 2, label: 'Node Media Server' }
  ];
}

function createFlvConnectionTypes() {
  return [
    { value: 0, label: 'HTTP' },
    { value: 1, label: 'Websocket' }
  ];
}

function createAudioChannels() {
  return [
    { value: 0, label: 'Source' },
    { value: 1, label: 'Mono' },
    { value: 2, label: 'Stereo' },
    { value: 9, label: '5.1' }
  ];
}

function createAudioQualities() {
  return [
    { value: 0, label: 'Auto' },
    { value: 1, label: '400' },
    { value: 2, label: '320' },
    { value: 3, label: '256' },
    { value: 4, label: '224' },
    { value: 5, label: '192' },
    { value: 6, label: '160' },
    { value: 7, label: '128' },
    { value: 8, label: '96' },
    { value: 9, label: 'Mute' }
  ];
}

function createAudioSampleRates() {
  return [
    { value: 0, label: 'Auto' },
    { value: 1, label: '7.35k' },
    { value: 2, label: '8k' },
    { value: 2, label: '11.025k' },
    { value: 3, label: '12k' },
    { value: 4, label: '16k' },
    { value: 3, label: '22.05k' },
    { value: 3, label: '24k' },
    { value: 3, label: '32k' },
    { value: 3, label: '44.1k' },
    { value: 3, label: '48k' }
  ];
}

function createRecordFileTypes() {
  return [
    { value: 0, label: 'MP4' },
    { value: 1, label: 'WebM' },
    { value: 2, label: 'FLV' },
    { value: 3, label: 'MKV' },
    { value: 4, label: 'AVI' },
    { value: 5, label: 'MPG' },
    { value: 6, label: 'OGV' }
  ];
}

function createRecordVideoCodecs() {
  return [
    { value: 0, label: 'Auto' },
    { value: 1, label: 'libvpx (WebM Default)' },
    { value: 2, label: 'libvpx-vp9 (WebM VP9)' },
    { value: 3, label: 'libx265 (MP4)' },
    { value: 4, label: 'libx264 (MP4 Default)' },
    { value: 5, label: 'copy' },
    { value: 6, label: 'H.264 VA-API (MP4 Intel HW Accel)' },
    { value: 7, label: 'H.c265 VA-API (MP4 Intel HW Accel)' },
    { value: 8, label: 'H.264 NVENC (MP4 NVIDIA HW Accel)' },
    { value: 9, label: 'H.265 NVENC (MP4 NVIDIA HW Accel)' },
    { value: 10, label: 'H.264 (MP4 Quick Sync Video)' },
    { value: 11, label: 'H.265 (MP4 Quick Sync Video)' },
    { value: 12, label: 'MPEG2 (MP4 Quick Sync Video)' },
    { value: 13, label: 'H.264 OpenMAX (MP4 Raspberry Pi)' },
    { value: 14, label: 'VP8 NVENC (WebM NVIDIA HW Accel)' },
    { value: 15, label: 'VP9 NVENC (WebM NVIDIA HW Accel)' },
    { value: 16, label: 'VP8 (WebM Quick Sync Video)' }
  ];
}

function createRecordAudioCodecs() {
  return [
    { value: 0, label: 'Auto' },
    { value: 1, label: 'No Audio' },
    { value: 2, label: 'Vorbis (WebM Default)' },
    { value: 3, label: 'Opus (WebM)' },
    { value: 4, label: 'MP3LAME (MP4)' },
    { value: 5, label: 'AAC (MP4 Default)' },
    { value: 6, label: 'AC3 (MP4)' },
    { value: 7, label: 'DTS' },
    { value: 8, label: 'ALAC' },
    { value: 9, label: 'copy' }
  ];
}
</script>

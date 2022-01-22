<template>
  <div class='q-pa-md'>
    <q-btn-group push>
      <q-btn push label='Basics' color='primary' icon='videocam' @click='step=1' />
      <q-btn push label='Connection' color='primary' icon='power' @click='step=2' />
      <q-btn push label='Input' color='primary' icon='input' @click='step=3' />
      <q-btn push label='Stream' color='primary' icon='live_tv' @click='step=4' />
      <q-btn push label='Logging' color='primary' icon='announcement' @click='step=100' />
    </q-btn-group>
    <q-space style='margin-bottom: 5px;' />
    <q-stepper v-model='step' vertical color='primary' animated>
      <q-step :name='1' title='Source Basic Settings' icon='settings' :done='step > 1'>
        <q-form class='q-gutter-md'>
          <q-checkbox :dense='dense' v-model='source.enabled' label='Enable' />
          <q-input :dense='dense' filled v-model='source.name' label='Name'
                   lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']" />
          <q-input :dense='dense' filled v-model='source.brand' label='Brand' />
          <q-input :dense='dense' filled v-model='source.description' label='Description' />
          <q-toggle :dense='dense' v-model='source.recording' checked-icon='check' color='red'
                    :label='"Recording " + (source.recording ? "On" : "Off")' />
        </q-form>
        <q-stepper-navigation>
          <q-btn @click='step = 2' color='primary' label='Continue' />
        </q-stepper-navigation>
      </q-step>

      <q-step :name='2' title='Connection' icon='power' :done='step > 2'>
        <q-form class='q-gutter-md'>
          <q-select :dense='dense' emit-value map-options filled v-model='source.input_type' :options='inputTypes'
                    label='Input Type' transition-show='flip-up' transition-hide='flip-down' />
          <q-select :dense='dense' emit-value map-options filled v-model='source.rtsp_transport'
                    :options='rtspTransports' label='RTSP Transport' transition-show='flip-up'
                    transition-hide='flip-down' />
        </q-form>
        <q-stepper-navigation>
          <q-btn @click='step = 3' color='primary' label='Continue' />
          <q-btn flat @click='step = 1' color='primary' label='Back' class='q-ml-sm' />
        </q-stepper-navigation>
      </q-step>

      <q-step :name='3' title='Input' icon='input' disable>
        <q-form class='q-gutter-md'>
          <q-input :dense='dense' filled v-model='source.analyzation_duration' type='number'
                   label='Analyzation Duration' />
          <q-input :dense='dense' filled v-model='source.probe_size' type='number' label='Probe Size' />
          <q-input :dense='dense' filled v-model='source.fps' type='number' label='FPS' hint='Frame Rate' />
          <q-toggle :dense='dense' v-model='source.use_camera_timestamp' checked-icon='check'
                    label='Use Camera Timestamps' />
          <q-space />
          <q-toggle :dense='dense' v-model='source.use_hwaccel' checked-icon='check'
                    label='Use Hardware Accelerator' />
          <q-select v-if='source.use_hwaccel' :dense='dense' emit-value map-options filled
                    v-model='source.hwaccel_engine'
                    :options='accelerationEngines' label='Acceleration Engine' transition-show='scale'
                    transition-hide='scale' />
          <q-select v-if='source.use_hwaccel' :dense='dense' emit-value map-options filled
                    v-model='source.video_decoder'
                    :options='videoDecoders' label='Video Decoders' transition-show=''
                    transition-hide='scale' />
          <q-input v-if='source.use_hwaccel' :dense='dense' filled v-model='source.hwaccel_device'
                   label='HWAccel Device' />
        </q-form>
        <q-stepper-navigation>
          <q-btn @click='step = 4' color='primary' label='Continue' />
          <q-btn flat @click='step = 2' color='primary' label='Back' class='q-ml-sm' />
        </q-stepper-navigation>
      </q-step>

      <q-step :name='4' title='Stream' caption='Optional' icon='live_tv' :done='step > 4'>
        <q-form class='q-gutter-md'>
          <q-select :dense='dense' emit-value map-options filled
                    v-model='source.stream_type'
                    :options='streamTypes' label='Stream Type' transition-show='flip-up'
                    transition-hide='flip-down' />
          <q-select :dense='dense' emit-value map-options filled
                    v-model='source.stream_audio_codec'
                    :options='audioCodecs' label='Audio Codec' transition-show='scale' transition-hide='scale' />
          <q-select :dense='dense' emit-value map-options filled
                    v-model='source.stream_video_codec'
                    :options='streamVideoCodecs' label='Video Codec' transition-show='scale' transition-hide='scale' />
          <q-input v-if='source.stream_video_codec !== 3' :dense='dense' filled v-model='source.hls_time' type='number'
                   label='HLS Segment Length' />
          <q-input v-if='source.stream_video_codec !== 3' :dense='dense' filled v-model='source.hls_list_size'
                   type='number'
                   label='HLS List Size' />
          <q-select v-if='source.stream_video_codec !== 3' :dense='dense' emit-value map-options filled
                    v-model='source.hls_preset'
                    :options='hlsPresets' label='HLS Preset' transition-show='scale' transition-hide='scale' />
          <q-input v-if='source.stream_video_codec !== 3' :dense='dense' filled v-model='source.stream_quality'
                   type='number' min='2' max='31'
                   label='Quality' />
          <q-input v-if='source.stream_video_codec !== 3' :dense='dense' filled v-model='source.stream_width'
                   type='number'
                   label='Width' />
          <q-input v-if='source.stream_video_codec !== 3' :dense='dense' filled v-model='source.stream_height'
                   type='number'
                   label='Height' />
          <q-select v-if='source.stream_video_codec !== 3' :dense='dense' emit-value map-options filled
                    v-model='source.stream_rotate'
                    :options='streamRotations' label='Rotate' transition-show='scale' transition-hide='scale' />
          <q-input v-if='source.stream_video_codec !== 3' :dense='dense' filled v-model='source.stream_video_filter'
                   label='Video Filter' />
        </q-form>

        <q-stepper-navigation>
          <q-btn @click='step = 100' color='primary' label='Continue' />
          <q-btn flat @click='step = 3' color='primary' label='Back' class='q-ml-sm' />
        </q-stepper-navigation>
      </q-step>

      <q-step :name='100' title='Logging' icon='announcement'>
        <q-select :dense='dense' emit-value map-options filled v-model='source.log_level' :options='logLevels'
                  label='Log Level' transition-show='flip-up' transition-hide='flip-down' />

        <q-stepper-navigation>
          <q-btn color='primary' label='Finish' />
          <q-btn flat @click='step = 4' color='primary' label='Back' class='q-ml-sm' />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </div>
</template>

<script lang='ts'>
import { ref, computed } from 'vue';
import { useStore } from 'src/store';
import { SourceSettings } from 'src/utils/entities';

export default {
  name: 'SourceSettings',
  setup() {
    const $store = useStore();
    const dense = computed(() => $store.getters['settings/dense']);
    const source = ref<SourceSettings>(createEmptySource());
    const inputTypes = ref(createInputType());
    const rtspTransports = ref(createRtspTransport());
    const logLevels = ref(createLogLevels());
    const accelerationEngines = ref(createAccelerationEngines());
    const videoDecoders = ref(createVideoDecoders());
    const streamTypes = ref(createStreamTypes());
    const streamVideoCodecs = ref(createStreamVideoCodecs());
    const hlsPresets = ref(createPresets());
    const streamRotations = ref(createRotations());
    const audioCodecs = ref(createAudioCodecs());

    return {
      dense,
      source,
      inputTypes,
      rtspTransports,
      logLevels,
      accelerationEngines,
      videoDecoders,
      streamTypes,
      streamVideoCodecs,
      hlsPresets,
      streamRotations,
      audioCodecs,
      step: ref(1)
    };
  }
};

function createEmptySource(): SourceSettings {
  return {
    enabled: true,
    name: '',
    brand: '',
    description: '',
    recording: false,
    input_type: 0,
    rtsp_transport: 1,
    analyzation_duration: 1000000, // or set to 100000 if you are using RTSP and having stream issues.
    probe_size: 1000000, //or set to 100000 if you are using RTSP and having stream issues.
    fps: null,
    use_camera_timestamp: false,
    use_hwaccel: true,
    hwaccel_engine: 0,
    video_decoder: 0,
    hwaccel_device: '',
    stream_type: 0,
    stream_video_codec: 3,
    hls_time: 2,
    hls_list_size: 3,
    hls_preset: 1,
    stream_quality: 0,
    stream_width: 0,
    stream_height: 0,
    stream_rotate: 0,
    stream_video_filter: '',
    stream_audio_codec:1,

    log_level: 1
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
    { value: 0, label: 'Info'},
    { value: 1, label: 'Silent' },
    { value: 2, label: 'Warning' },
    { value: 3, label: 'Error' },
    { value: 4, label: 'Fatal' }
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
    { value:1, label: 'MP4'},
    { value:2, label: 'HEVC (H.265)'},
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
    { value: 11, label: 'H.264 openMAX (Raspberry Pi)' }
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

function createAudioCodecs() {
  return [
    { value: 0, label: 'Auto' },
    { value: 1, label: 'No Audio' },
    { value: 2, label: 'libvorbis' },
    { value: 3, label: 'libopus' },
    { value: 4, label: 'libmp3lame' },
    { value: 5, label: 'aac' },
    { value: 6, label: 'ac3' },
    { value: 7, label: 'copy' }
  ];
}
</script>

<template>
  <q-layout view='lHh lpr lFf' container style='height: 600px' class='shadow-2 rounded-borders'>
    <q-header elevated class='bg-cyan'>
      <q-toolbar>
        <q-btn flat round dense icon='settings' />
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
          <CommandBar :show-restore='false' @on-save='onSave' :inactive-save='inactives.save' @on-delete='onDelete' :inactive-delete='inactives.delete' />
        </div>
        <div class='q-pa-md'>
          <q-btn-group push>
            <q-btn push label='Basics' color='cyan' icon='videocam' @click='step=1' />
            <q-btn push label='Connection' color='cyan' icon='power' @click='step=2' />
            <q-btn push label='Input' color='cyan' icon='input' @click='step=3' />
            <q-btn push label='Stream' color='cyan' icon='live_tv' @click='step=4' />
            <q-btn push label='Snapshot for AI' color='cyan' icon='psychology' @click='step=5' />
            <q-btn v-if='source.record_enabled' push label='Recording' color='cyan' icon='radio_button_checked' @click='step=6' />
            <q-btn push label='Logging' color='cyan' icon='announcement' @click='step=7' />
          </q-btn-group>
          <q-space style='margin-bottom: 5px;' />

          <q-stepper v-model='step' vertical color='cyan' animated>
            <q-step id='step1' :name='1' color='cyan' title='Source Basic Settings' icon='settings' :done='step > 1'>
              <q-form class='q-gutter-md'>
                <q-checkbox dense v-model='source.enabled' color='cyan' label='Enable' />
                <q-input dense filled v-model.trim='source.name' label='Name' color='cyan'
                         lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']" />
                <q-input dense filled v-model.trim='source.brand' label='Brand' color='cyan' />
                <q-input dense filled v-model.trim='source.description' label='Description' color='cyan' />
                <q-toggle dense v-model='source.record_enabled' color='red' @update:model-value='onRecordChange'
                          :label='"Record " + (source.record_enabled ? "On" : "Off")' />
              </q-form>
              <q-stepper-navigation>
                <q-btn @click='onStep1Click' color='cyan' label='Continue' />
              </q-stepper-navigation>
            </q-step>

            <q-step id='step2' :name='2' title='Connection' icon='power' color='cyan' :done='step > 2'>
              <q-form class='q-gutter-md'>
                <q-input dense filled v-model.trim='source.address' color='cyan' label='Address'
                         lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']">
                  <template v-slot:after>
                    <q-btn dense color='brown-5' flat icon='settings_ethernet' label='Hack By ONVIF©' @click='showOnvif = true' />
                  </template>
                </q-input>
                <q-select dense emit-value map-options filled v-model='source.rtsp_transport'
                          :options='rtspTransports' label='RTSP Transport' transition-show='flip-up'
                          transition-hide='flip-down' color='cyan' />
              </q-form>
              <q-stepper-navigation>
                <q-btn @click='step = 3' color='cyan' label='Continue' />
                <q-btn flat @click='step = 1' color='cyan' label='Back' class='q-ml-sm' />
              </q-stepper-navigation>
            </q-step>

            <q-step id='step3' :name='3' title='Input' icon='input' color='cyan'>
              <q-form class='q-gutter-md'>
                <q-input dense filled v-model.number='source.analyzation_duration' type='number'
                         label='Analyzation Duration' color='cyan' />
                <q-input dense filled v-model.number='source.probe_size' type='number' label='Probe Size'
                         color='cyan' />
                <q-input dense filled v-model.number='source.input_frame_rate' type='number' label='FPS'
                         hint='Frame Rate' color='cyan' />
                <q-toggle dense v-model='source.use_camera_timestamp' checked-icon='check'
                          label='Use Camera Timestamps' color='cyan' />
                <q-space />
                <q-toggle dense v-model='source.use_hwaccel' checked-icon='check'
                          label='Use Hardware Accelerator' color='cyan' />
                <q-select v-if='source.use_hwaccel' dense emit-value map-options filled
                          v-model='source.hwaccel_engine' color='cyan'
                          :options='accelerationEngines' label='Acceleration Engine' transition-show='scale'
                          transition-hide='scale' />
                <q-select v-if='source.use_hwaccel' dense emit-value map-options filled
                          v-model='source.video_decoder' color='cyan'
                          :options='videoDecoders' label='Video Decoders' transition-show=''
                          transition-hide='scale' />
                <q-input v-if='source.use_hwaccel' dense filled v-model.trim='source.hwaccel_device'
                         label='HWAccel Device' color='cyan' />
              </q-form>
              <q-stepper-navigation>
                <q-btn @click='step = 4' color='cyan' label='Continue' />
                <q-btn flat @click='step = 2' color='cyan' label='Back' class='q-ml-sm' />
              </q-stepper-navigation>
            </q-step>

            <q-step id='step4' :name='4' title='Stream' icon='live_tv' color='cyan' :done='step > 4'>
              <q-form class='q-gutter-md'>
                <q-select dense emit-value map-options filled
                          v-model='source.rtmp_server_type' color='cyan'
                          :options='rtmpServerTypes' label='RTMP Server' transition-show='flip-up'
                          transition-hide='flip-down' />
                <q-select dense emit-value map-options filled
                          v-model='source.stream_type' color='cyan' @update:model-value='onStreamTypeChanged'
                          :options='streamTypes' label='Stream Type' transition-show='flip-up'
                          transition-hide='flip-down' />
                <q-toggle v-if='source.stream_type < 2' dense v-model='source.booster_enabled' checked-icon='check' color='cyan'
                          :label='"Booster " + (source.booster_enabled ? "Enabled" : "Disabled")' />
                <q-select dense emit-value map-options filled v-model='source.stream_video_codec' color='cyan'
                          :options='streamVideoCodecs' label='Video Codec' transition-show='scale' transition-hide='scale' />
                <q-select v-if='source.stream_video_codec !== 3' dense emit-value
                          map-options filled color='cyan' v-model='source.preset'
                          :options='presets' label='Preset' transition-show='scale' transition-hide='scale' />
                <q-input v-if='source.stream_video_codec !== 3' dense filled
                         v-model.number='source.stream_quality' color='cyan'
                         type='number' min='2' max='31'
                         label='Quality' />
                <q-input v-if='source.stream_video_codec !== 3' dense filled
                         v-model.number='source.stream_frame_rate' color='cyan'
                         type='number' label='Frame Rate' />
                <q-input v-if='source.stream_video_codec !== 3' dense filled
                         v-model.number='source.stream_width' color='cyan'
                         type='number' label='Width' />
                <q-input v-if='source.stream_video_codec !== 3' dense filled
                         v-model.number='source.stream_height' color='cyan'
                         type='number' label='Height' />
                <q-select v-if='source.stream_video_codec !== 3' dense emit-value
                          map-options filled v-model='source.stream_rotate' color='cyan'
                          :options='streamRotations' label='Rotate' transition-show='scale' transition-hide='scale' />
                <q-select dense emit-value map-options filled
                          v-model='source.stream_audio_codec' color='cyan' :disable='source.stream_type>1&&!source.record_enabled'
                          :options='audioCodecs' label='Audio Codec' transition-show='scale'
                          transition-hide='scale' />
                <q-select v-if='source.stream_audio_codec !== 0 && source.stream_audio_codec !== 8' dense emit-value
                          map-options filled
                          v-model='source.stream_audio_channel' color='cyan'
                          :options='audioChannels' label='Audio Channel' transition-show='flip-up'
                          transition-hide='flip-down' />
                <q-select v-if='source.stream_audio_codec !== 0 && source.stream_audio_codec !== 8' dense emit-value
                          map-options filled
                          v-model='source.stream_audio_quality' color='cyan'
                          :options='audioQualities' label='Audio Quality' transition-show='scale'
                          transition-hide='scale' />
                <q-select v-if='source.stream_audio_codec !== 0 && source.stream_audio_codec !== 8' dense emit-value
                          map-options filled
                          v-model='source.stream_audio_sample_rate' color='cyan'
                          :options='audioSampleRates' label='Audio SampleRate' transition-show='scale'
                          transition-hide='scale' />
                <q-input v-if='source.stream_audio_codec !== 0 && source.stream_audio_codec !== 8' dense filled
                         v-model.number='source.stream_audio_volume'
                         label='Audio Volume' color='cyan' />

                <q-input v-if='source.stream_type>1' dense filled
                         v-model.number='source.ffmpeg_reader_frame_rate'
                         type='number' label='Reader Frame Rate' color='cyan' />
                <q-input v-if='source.stream_type>1' dense filled
                         v-model.number='source.ffmpeg_reader_width' color='cyan'
                         type='number' label='Reader Width' />
                <q-input v-if='source.stream_type>1' dense filled
                         v-model.number='source.ffmpeg_reader_height' color='cyan'
                         type='number' label='Reader Height' />

                <q-input v-if='source.stream_video_codec === 2 && source.stream_type===1' dense filled
                         v-model.number='source.hls_time' type='number' color='cyan'
                         label='HLS Segment Length' />
                <q-input v-if='source.stream_video_codec === 2 && source.stream_type===1' dense filled
                         v-model.number='source.hls_list_size' color='cyan'
                         type='number'
                         label='HLS List Size' />
              </q-form>

              <q-stepper-navigation>
                <q-btn @click='step = 5' color='cyan' label='Continue' />
                <q-btn flat @click='step = 3' color='cyan' label='Back' class='q-ml-sm' />
              </q-stepper-navigation>
            </q-step>

            <q-step id='step5' :name='5' title='Snapshot for AI' icon='psychology' color='cyan' :done='step > 5'>
              <q-form class='q-gutter-md'>
                <q-separator style='margin: 5px;' />
                <q-toggle dense v-model='source.snapshot_enabled' checked-icon='check' color='cyan'
                          :label='"AI Snapshot " + (source.snapshot_enabled ? "Enabled" : "Disabled")' />
                <q-input v-if='source.snapshot_enabled' dense filled v-model.number='source.snapshot_frame_rate'
                         type='number' label='Frame Rate' color='cyan' />
                <q-input v-if='source.snapshot_enabled' dense filled v-model.number='source.snapshot_width'
                         type='number' label='Width' />
                <q-input v-if='source.snapshot_enabled' dense filled v-model.number='source.snapshot_height'
                         type='number' label='Height' color='cyan' />
                <q-toggle dense v-if='source.snapshot_enabled&&source.record_enabled' v-model='source.ai_clip_enabled'
                          checked-icon='check' color='cyan' :label='"AI Clip Enabled " + (source.ai_clip_enabled ? "Enabled" : "Disabled")' />
              </q-form>
              <q-stepper-navigation>
                <q-btn @click='step = source.record_enabled ? 6 : 7' color='cyan' label='Continue' />
                <q-btn flat @click='step = 4' color='cyan' label='Back' class='q-ml-sm' />
              </q-stepper-navigation>
            </q-step>

            <q-step v-if='source.record_enabled' id='step6' :name='6' title='Record' icon='radio_button_checked' color='cyan'
                    :done='step > 6'>
              <q-form class='q-gutter-md'>
                <q-select dense emit-value map-options filled
                          v-model='source.record_file_type' color='cyan'
                          :options='recordFileTypes' label='Record File Type'
                          transition-show='scale' transition-hide='scale' />
                <q-select dense emit-value map-options filled v-model='source.record_video_codec'
                          :options='recordVideoCodecs' label='Record Video Codec' color='cyan'
                          transition-show='scale' transition-hide='scale' />
                <q-input v-if='showRecordDetail' dense filled v-model.number='source.record_quality'
                         type='number' label='Record Quality' color='cyan' />
                <q-select v-if='showRecordDetail' dense emit-value map-options filled
                          v-model='source.record_preset' color='cyan'
                          :options='recordPresets' label='Record Preset'
                          transition-show='scale' transition-hide='scale' />
                <q-input v-if='showRecordDetail' dense filled v-model.number='source.record_frame_rate'
                         type='number' label='Video Record Frame Rate' color='cyan' />
                <q-input v-if='showRecordDetail' dense filled v-model.number='source.record_width'
                         type='number'
                         label='Record Width' color='cyan' />
                <q-input v-if='showRecordDetail' dense filled v-model.number='source.record_height'
                         type='number'
                         label='Record Height' color='cyan' />
                <q-input dense filled v-model.number='source.record_segment_interval'
                         type='number' label='Record Segment Interval' color='cyan' />
                <q-select v-if='showRecordDetail' dense emit-value map-options filled
                          v-model='source.record_rotate' color='cyan'
                          :options='recordRotations' label='Record Rotate' transition-show='scale'
                          transition-hide='scale' />
                <q-select emit-value map-options dense filled v-model='source.record_audio_codec'
                          :options='audioCodecs' label='Record Audio Codec' color='cyan'
                          transition-show='scale' transition-hide='scale' />
                <q-select v-if='source.record_audio_codec !== 0 && source.record_audio_codec !== 8' dense emit-value map-options filled
                          v-model='source.record_audio_channel' color='cyan'
                          :options='audioChannels' label='Audio Channel' transition-show='flip-up'
                          transition-hide='flip-down' />
                <q-select v-if='source.record_audio_codec !== 0 && source.record_audio_codec !== 8' dense emit-value map-options filled
                          v-model='source.record_audio_quality' color='cyan'
                          :options='audioQualities' label='Audio Quality' transition-show='scale'
                          transition-hide='scale' />
                <q-select v-if='source.record_audio_codec !== 0 && source.record_audio_codec !== 8' dense emit-value map-options filled
                          v-model='source.record_audio_sample_rate' color='cyan'
                          :options='audioSampleRates' label='Audio SampleRate' transition-show='scale'
                          transition-hide='scale' />
                <q-input v-if='source.record_audio_codec !== 0 && source.record_audio_codec !== 8' dense filled
                         v-model.number='source.record_audio_volume'
                         label='Audio Volume' color='cyan' />
              </q-form>
              <q-stepper-navigation>
                <q-btn @click='step = 7' color='cyan' label='Continue' />
                <q-btn flat @click='step = 5' color='cyan' label='Back' class='q-ml-sm' />
              </q-stepper-navigation>
            </q-step>

            <q-step id='step7' :name='7' title='Logging' icon='announcement' color='cyan'>
              <q-select dense emit-value map-options filled v-model='source.log_level' :options='logLevels'
                        label='Log Level' transition-show='scale' transition-hide='scale' color='cyan' />
              <q-stepper-navigation>
                <q-btn flat @click='step = source.record_enabled ? 6 : 5' color='cyan' label='Back' class='q-ml-sm' />
              </q-stepper-navigation>
            </q-step>
          </q-stepper>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>

  <q-dialog v-model='showOnvif' full-width full-height>
    <OnvifSettings :color='"cyan"' :address='source.address' />
  </q-dialog>

</template>

<script lang='ts'>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useStore } from 'src/store';
import { SourceModel } from 'src/utils/models/source_model';
import CommandBar from 'src/components/CommandBar.vue';
import OnvifSettings from 'components/OnvifSettings.vue';
import { NodeService } from 'src/utils/services/node_service';
import { useQuasar } from 'quasar';
import { PublishService } from 'src/utils/services/websocket_services';
import { isNullOrEmpty, isNullOrUndefined } from 'src/utils/utils';
import { LocalService } from 'src/utils/services/local_service';

declare var $: any;
export default {
  name: 'SourceSettings',
  components: { CommandBar, OnvifSettings },
  emits: ['on-save', 'on-delete'],
  props: {
    sourceId: {
      type: String,
      required: false,
      default: null
    }
  },
  //@ts-ignore
  setup(props: any, { emit }) {
    const $store = useStore();
    const localService = new LocalService();
    const source = ref<SourceModel>(localService.createEmptySource());
    const showRecordDetail = computed(() => {
      //@ts-ignore
      return source.value.record_video_codec != 5 && source.value.record_video_codec < 14;
    });
    const step = ref<number>(1);
    const nodeService = new NodeService();
    const rtspTransports = ref(localService.createRtspTransport());
    const logLevels = ref(localService.createLogLevels());
    const accelerationEngines = ref(localService.createAccelerationEngines());
    const videoDecoders = ref(localService.createVideoDecoders());
    const streamTypes = ref(localService.createStreamTypes());
    const streamVideoCodecs = ref(localService.createStreamVideoCodecs());
    const audioCodecs = ref(localService.createAudioCodecs());
    const presets = ref(localService.createPresets());
    const streamRotations = ref(localService.createRotations());
    const rtmpServerTypes = ref(localService.createRtmpServerTypes());
    const audioChannels = ref(localService.createAudioChannels());
    const audioQualities = ref(localService.createAudioQualities());
    const audioSampleRates = ref(localService.createAudioSampleRates());
    const recordFileTypes = ref(localService.createRecordFileTypes());
    const recordVideoCodecs = ref(localService.createRecordVideoCodecs());
    const recordPresets = ref(localService.createPresets());
    const recordRotations = ref(localService.createRotations());
    const inactives = ref({ save: false, delete: false });
    const showOnvif = ref<boolean>(false);

    const publishService = new PublishService();
    const $q = useQuasar();

    onMounted(async () => {
      if (!isNullOrEmpty(props.sourceId)) {
        source.value = await nodeService.getSource(props.sourceId);
      }
      setTimeout(() => {
        for (let j = 1; j <= 7; ++j) {
          jqueryWorks(j);
        }
      }, 100);
    });

    const jqueryWorks = (divIdIndex: number) => {
      const div = $(`#step${divIdIndex}`).find('div');
      div.css('cursor', 'pointer');
      div.click(function() {
        step.value = divIdIndex;
      });
    };

    const makeItCursorable = () => {
      if (source.value.record_enabled) {
        nextTick().then(() => {
          jqueryWorks(5);  // jpeg
          jqueryWorks(6);  // record
        }).catch(console.error);
      }
    };

    function onStep1Click() {
      setTimeout(() => {
        step.value = 2;
      }, 25);
    }

    function onRecordChange() {
      if (source.value.record_enabled) {
        makeItCursorable();
      }
      onStreamTypeChanged();
    }

    async function onSave(e: any) {
      let model = source.value;
      if (!model.name || !model.address) {
        $q.notify({
          message: 'Please enter both "Name" and  "Address" fields',
          caption: 'Invalid',
          color: 'red-14',
          position: 'bottom-right'
        });
        return;
      }
      const isAdded = isNullOrEmpty(<string>source.value.id);
      try {
        inactives.value.save = true;
        source.value = await nodeService.saveSource(model);
      } finally {
        inactives.value.save = false;
      }
      model = source.value;
      publishService.publishEditor({
        id: model.id,
        brand: model.brand,
        name: model.name,
        address: model.address,
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
      $store.commit('settings/notifySourceStreamStatusChanged');
    }

    async function onDelete(e: any) {
      const model = source.value;
      if (isNullOrUndefined(model)) {
        return;
      }
      let result = false;
      try {
        inactives.value.delete = true;
        result = await nodeService.removeSource(<string>model.id);
      } finally {
        inactives.value.delete = false;
      }
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

    const onStreamTypeChanged = () => {
      if (!source.value.stream_type) {
        return;
      }
      if (source.value.stream_type > 1) {
        source.value.booster_enabled = false;
        if (!source.value.record_enabled){
          source.value.stream_audio_codec = 0; // No Audio
        }
      }
    };

    return {
      source, showRecordDetail, step, rtspTransports, logLevels,
      accelerationEngines, videoDecoders, streamTypes,
      audioCodecs, streamVideoCodecs, presets,
      streamRotations, rtmpServerTypes, audioChannels, inactives, showOnvif,
      audioQualities, audioSampleRates, recordFileTypes, recordVideoCodecs,
      recordPresets, recordRotations, onSave, onDelete, onStep1Click, onRecordChange, onStreamTypeChanged
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

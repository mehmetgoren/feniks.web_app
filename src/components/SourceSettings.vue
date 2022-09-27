<template>
  <q-layout view='lHh lpr lFf' container style='height: 600px' class='shadow-2 rounded-borders'>
    <q-header elevated class='bg-cyan'>
      <q-toolbar>
        <q-toolbar-title>
          <CommandBar :show-restore='false' @on-save='onSave' :inactive-save='inactives.save' @on-delete='onDelete' :show-delete="!insertMode"
                      :inactive-delete='inactives.delete' :show-refresh="false"  :disable="!insertMode&&!source.enabled"/>
          <q-btn v-if="insertMode" class="gt-xs" dense flat icon='auto_awesome' :label="$t('add_new_source_quickly')"
                 @click="showQuickWizard=true">
            <q-tooltip>{{ $t('t_add_new_source_quickly') }}</q-tooltip>
          </q-btn>
          <q-btn v-if="!insertMode" class="gt-xs" style="margin-left: 15px" dense flat @click="onMakeEnabledOrDisabled"
                 :label="source.enabled ? $t('make_disabled') : $t('make_enabled')" :icon="source.enabled ? 'videocam_off' : 'videocam'"
                 :disable="loadingMakeEnabledOrDisabled">
            <q-inner-loading :showing="loadingMakeEnabledOrDisabled"/>
          </q-btn>
        </q-toolbar-title>
        <label v-if="!insertMode" style='text-transform: uppercase;font-size: medium'> {{ source.name }}</label>
        <q-space/>
        <q-btn dense flat icon='close' v-close-popup>
          <q-tooltip class='bg-white text-primary'>{{ $t('close') }}</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page padding style='background-color: whitesmoke;'>
        <div class='q-pa-md'>
          <q-btn-group class="gt-xs">
            <q-btn push :label="$t('basics')" color='cyan' icon='videocam' @click='step=1' :disable="!source.enabled"/>
            <q-btn push :label="$t('connection')" color='cyan' icon='power' @click='step=2' :disable="!source.enabled"/>
            <q-btn push :label="$t('input')" color='cyan' icon='input' @click='step=3' :disable="!source.enabled"/>
            <q-btn push :label="$t('stream')" color='cyan' icon='live_tv' @click='step=4' :disable="!source.enabled"/>
            <q-btn push :label="$t('snapshot_for_ai')" color='cyan' icon='psychology' @click='step=5' :disable="!source.enabled"/>
            <q-btn v-if='source.record_enabled' push :label="$t('recording')" color='cyan' icon='radio_button_checked' @click='step=6'
                   :disable="!source.enabled"/>
            <q-btn push :label="$t('logging')" color='cyan' icon='announcement' @click='step=7' :disable="!source.enabled"/>
          </q-btn-group>
          <q-space style='margin-bottom: 5px;'/>

          <q-stepper v-model='step' vertical color='cyan' animated>
            <q-step id='step1' :name='1' color='cyan' :title="$t('basics')" icon='settings' :done='step > 1'>
              <div class="q-gutter-md row" v-if='insertMode&&copyPrevSources.length' style="margin-bottom: 25px;">
                <q-select dense emit-value map-options filled v-model='copySelectedSourceId' color='cyan' style="width: 400px;"
                          :options='copyPrevSources' transition-show='scale' transition-hide='scale' option-value="id" option-label="name"
                          :label="$t('select_source_copy_from')"/>
                <q-btn square color="cyan" text-color="white" icon="content_copy" :label="$t('copy_settings_from')" size="12px"
                       @click="onCopySettingsFromChanged"/>
              </div>
              <q-space v-if='insertMode&&copyPrevSources.length' style="margin-top: 15px;"/>
              <q-form class='q-gutter-md'>
                <q-checkbox v-if="!insertMode" dense v-model='source.enabled' color='cyan'
                            :label="source.enabled ? $t('enabled') : $t('disabled')" disable/>
                <q-input dense filled v-model.trim='source.name' :label="$t('name')" color='cyan' :disable="!source.enabled"
                         lazy-rules :rules="[ val => val && val.length > 0 || $t('v_enter_valid_name')]"/>
                <q-input dense filled v-model.trim='source.brand' :label="$t('brand')" color='cyan' :disable="!source.enabled"/>
                <q-input dense filled v-model.trim='source.description' :label="$t('description')" color='cyan' :disable="!source.enabled"/>
                <q-toggle dense v-model='source.record_enabled' color='red' @update:model-value='onRecordChange'
                          :label="$t('record') + ' ' + (source.record_enabled ? $t('on') : $t('off'))" :disable="!source.enabled"/>
                <q-input v-if="!insertMode" dense filled v-model.trim='source.id' :label="$t('id')" color='cyan' disable/>
                <q-select v-if="!insertMode" dense emit-value map-options filled v-model='source.state' disable
                          :options='sourceStates' :label="$t('source_state')" color='cyan'/>
              </q-form>
              <q-stepper-navigation>
                <q-btn @click='onStep1Click' color='cyan' :label="$t('continue')" :disable="!source.enabled"/>
              </q-stepper-navigation>
            </q-step>

            <q-step id='step2' :name='2' :title="$t('connection')" icon='power' color='cyan' :done='step > 2'>
              <q-form class='q-gutter-md'>
                <q-input dense filled v-model.trim='source.address' color='cyan' :label="$t('address')"
                         lazy-rules :rules="[ val => val && val.length > 0 || $t('v_enter_valid_address')]" :disable="!source.enabled">
                  <template v-slot:prepend v-if="recommendedRtspAddresses.length">
                    <q-icon name="list">
                      <q-popup-proxy>
                        <q-list bordered separator>
                          <q-item clickable v-ripple v-for="ra in recommendedRtspAddresses" :key="ra" @click="() => source.address = ra">
                            <q-item-section>{{ ra }}</q-item-section>
                          </q-item>
                        </q-list>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  <template v-slot:after>
                    <q-btn flat icon="query_stats" @click="onFindOptimalSettings" :disable="showFindOptimalSettings||!source.enabled" >
                      <q-tooltip transition-show="rotate" transition-hide="rotate">
                        {{ $t('find_optimal_settings') }}
                      </q-tooltip>
                      <q-inner-loading :showing='showFindOptimalSettings'/>
                    </q-btn>
                    <q-btn dense color='brown-5' flat icon='settings_ethernet' :label="$t('start_onvif')" @click='showOnvif = true'
                           :disable="!source.enabled"/>
                  </template>
                </q-input>
                <q-select dense emit-value map-options filled v-model='source.rtsp_transport'
                          :options='rtspTransports' :label="$t('rtsp_transport')" transition-show='flip-up'
                          transition-hide='flip-down' color='cyan' :disable="!source.enabled"/>
              </q-form>
              <q-stepper-navigation>
                <q-btn @click='step = 3' color='cyan' :label="$t('continue')" :disable="!source.enabled"/>
                <q-btn flat @click='step = 1' color='cyan' :label="$t('back')" class='q-ml-sm' :disable="!source.enabled"/>
              </q-stepper-navigation>
            </q-step>

            <q-step id='step3' :name='3' :title="$t('input')" icon='input' color='cyan'>
              <q-form class='q-gutter-md'>
                <q-input dense filled v-model.number='source.analyzation_duration' type='number'
                         :label="$t('analysis_duration')" color='cyan' :disable="!source.enabled"/>
                <q-input dense filled v-model.number='source.probe_size' type='number' :label="$t('probe_size')"
                         color='cyan' :disable="!source.enabled"/>
                <q-input dense filled v-model.number='source.input_frame_rate' type='number' :label="$t('fps')"
                         hint='Frame Rate' color='cyan'/>
                <q-toggle dense v-model='source.use_camera_timestamp' checked-icon='check'
                          :label="$t('use_camera_timestamps')" color='cyan' :disable="!source.enabled"/>
                <q-space/>
                <q-toggle dense v-model='source.use_hwaccel' checked-icon='check'
                          :label="$t('use_hardware_accelerator')" color='cyan' :disable="!source.enabled"/>
                <q-select v-if='source.use_hwaccel' dense emit-value map-options filled
                          v-model='source.hwaccel_engine' color='cyan'
                          :options='accelerationEngines' :label="$t('acceleration_engine')" transition-show='scale'
                          transition-hide='scale' :disable="!source.enabled"/>
                <q-select v-if='source.use_hwaccel' dense emit-value map-options filled
                          v-model='source.video_decoder' color='cyan'
                          :options='videoDecoders' :label="$t('video_decoders')" transition-show=''
                          transition-hide='scale' :disable="!source.enabled"/>
                <q-input v-if='source.use_hwaccel' dense filled v-model.trim='source.hwaccel_device'
                         :label="$t('hwaccel_device')" color='cyan' :disable="!source.enabled"/>
              </q-form>
              <q-stepper-navigation>
                <q-btn @click='step = 4' color='cyan' :label="$t('continue')" :disable="!source.enabled"/>
                <q-btn flat @click='step = 2' color='cyan' :label="$t('back')" class='q-ml-sm' :disable="!source.enabled"/>
              </q-stepper-navigation>
            </q-step>

            <q-step id='step4' :name='4' :title="$t('stream')" icon='live_tv' color='cyan' :done='step > 4'>
              <q-form class='q-gutter-md'>
                <q-select dense emit-value map-options filled
                          v-model='source.rtmp_server_type' color='cyan'
                          :options='rtmpServerTypes' :label="$t('rtmp_server')" transition-show='flip-up'
                          transition-hide='flip-down' :disable="!source.enabled"/>
                <q-select dense emit-value map-options filled
                          v-model='source.stream_type' color='cyan' @update:model-value='onStreamTypeChanged'
                          :options='streamTypes' :label="$t('stream_type')" transition-show='flip-up'
                          transition-hide='flip-down' :disable="!source.enabled"/>
                <q-select v-if="source.stream_type===0" dense emit-value map-options filled
                          v-model='source.flv_player_type' color='cyan'
                          :options='flvPlayerTypes' :label="$t('flv_player')" transition-show='flip-up'
                          transition-hide='flip-down' :disable="!source.enabled"/>
                <q-toggle v-if='source.stream_type < 2&&(source.stream_type === 1 || source.flv_player_type===1)'
                          dense v-model='source.booster_enabled' checked-icon='check' color='cyan'
                          :label="$t('booster') + ' ' + (source.booster_enabled ? $t('enabled') : $t('disabled'))"
                          :disable="!source.enabled"/>
                <q-select dense emit-value map-options filled v-model='source.stream_video_codec' color='cyan'
                          :options='streamVideoCodecs' :label="$t('video_codec')" transition-show='scale' transition-hide='scale'
                          :disable="!source.enabled"/>
                <q-select v-if='source.stream_video_codec !== 3' dense emit-value
                          map-options filled color='cyan' v-model='source.preset'
                          :options='presets' :label="$t('preset')" transition-show='scale' transition-hide='scale'
                          :disable="!source.enabled"/>
                <q-input v-if='source.stream_video_codec !== 3' dense filled
                         v-model.number='source.stream_quality' color='cyan'
                         type='number' min='2' max='31'
                         :label="$t('quality')" :disable="!source.enabled"/>
                <q-input v-if='source.stream_video_codec !== 3' dense filled
                         v-model.number='source.stream_frame_rate' color='cyan'
                         type='number' :label="$t('frame_rate')" :disable="!source.enabled"/>
                <q-input v-if='source.stream_video_codec !== 3' dense filled
                         v-model.number='source.stream_width' color='cyan'
                         type='number' :label="$t('width')" :disable="!source.enabled"/>
                <q-input v-if='source.stream_video_codec !== 3' dense filled
                         v-model.number='source.stream_height' color='cyan'
                         type='number' :label="$t('height')" :disable="!source.enabled"/>
                <q-select v-if='source.stream_video_codec !== 3' dense emit-value
                          map-options filled v-model='source.stream_rotate' color='cyan'
                          :options='streamRotations' :label="$t('rotate')" transition-show='scale' transition-hide='scale'
                          :disable="!source.enabled"/>
                <q-select dense emit-value map-options filled
                          v-model='source.stream_audio_codec' color='cyan' :disable='(source.stream_type>1&&!source.record_enabled)||!source.enabled'
                          :options='audioCodecs' :label="$t('audio_codec')" transition-show='scale' transition-hide='scale'/>
                <q-select v-if='source.stream_audio_codec !== 0 && source.stream_audio_codec !== 8' dense emit-value
                          map-options filled
                          v-model='source.stream_audio_channel' color='cyan'
                          :options='audioChannels' :label="$t('audio_channel')" transition-show='flip-up'
                          transition-hide='flip-down' :disable="!source.enabled"/>
                <q-select v-if='source.stream_audio_codec !== 0 && source.stream_audio_codec !== 8' dense emit-value
                          map-options filled
                          v-model='source.stream_audio_quality' color='cyan'
                          :options='audioQualities' :label="$t('audio_quality')" transition-show='scale'
                          transition-hide='scale' :disable="!source.enabled"/>
                <q-select v-if='source.stream_audio_codec !== 0 && source.stream_audio_codec !== 8' dense emit-value
                          map-options filled
                          v-model='source.stream_audio_sample_rate' color='cyan'
                          :options='audioSampleRates' :label="$t('audio_sample_rate')" transition-show='scale'
                          transition-hide='scale' :disable="!source.enabled"/>
                <q-input v-if='source.stream_audio_codec !== 0 && source.stream_audio_codec !== 8' dense filled
                         v-model.number='source.stream_audio_volume'
                         :label="$t('audio_volume')" color='cyan' :disable="!source.enabled"/>

                <q-input v-if='source.stream_type>1' dense filled
                         v-model.number='source.ffmpeg_reader_frame_rate'
                         type='number' :label="$t('reader_frame_rate')" color='cyan' :disable="!source.enabled"/>
                <q-input v-if='source.stream_type>1' dense filled
                         v-model.number='source.ffmpeg_reader_width' color='cyan'
                         type='number' :label="$t('reader_width')" :disable="!source.enabled"/>
                <q-input v-if='source.stream_type>1' dense filled
                         v-model.number='source.ffmpeg_reader_height' color='cyan'
                         type='number' :label="$t('reader_height')" :disable="!source.enabled"/>

                <q-input v-if='source.stream_video_codec === 2 && source.stream_type===1' dense filled
                         v-model.number='source.hls_time' type='number' color='cyan'
                         :label="$t('hls_segment_length')" :disable="!source.enabled"/>
                <q-input v-if='source.stream_video_codec === 2 && source.stream_type===1' dense filled
                         v-model.number='source.hls_list_size' color='cyan'
                         type='number' :label="$t('hls_list_size')" :disable="!source.enabled"/>
              </q-form>

              <q-stepper-navigation>
                <q-btn @click='step = 5' color='cyan' :label="$t('continue')" :disable="!source.enabled"/>
                <q-btn flat @click='step = 3' color='cyan' :label="$t('back')" class='q-ml-sm' :disable="!source.enabled"/>
              </q-stepper-navigation>
            </q-step>

            <q-step id='step5' :name='5' :title="$t('snapshot_for_ai')" icon='psychology' color='cyan' :done='step > 5'>
              <q-form class='q-gutter-md'>
                <q-toggle dense v-model='source.snapshot_enabled' checked-icon='check' color='cyan'
                          :label="$t('snapshot_for_ai') + ' ' + (source.snapshot_enabled ? $t('enabled') : $t('disabled'))"
                          :disable="!source.enabled"/>
                <q-select v-if='source.snapshot_enabled' dense emit-value map-options filled v-model='source.snapshot_type' color='cyan'
                          :options='snapshotTypes' :label="$t('snapshot_type')" transition-show='scale' transition-hide='scale'
                          :disable="!source.enabled">
                  <q-tooltip><strong>{{ $t('t_snapshot_type') }}</strong></q-tooltip>
                </q-select>
                <q-input v-if='source.snapshot_enabled' dense filled v-model.number='source.snapshot_frame_rate'
                         type='number' :label="$t('frame_rate')" color='cyan' :disable="!source.enabled"/>
                <q-input v-if='source.snapshot_enabled' dense filled v-model.number='source.snapshot_width'
                         type='number' :label="$t('width')" :disable="!source.enabled"/>
                <q-input v-if='source.snapshot_enabled' dense filled v-model.number='source.snapshot_height'
                         type='number' :label="$t('height')" color='cyan' :disable="!source.enabled"/>
                <q-toggle dense v-if='source.snapshot_enabled&&source.record_enabled' v-model='source.ai_clip_enabled' checked-icon='check'
                          color='cyan' :label="$t('ai_clip') + ' ' + (source.ai_clip_enabled ? $t('enabled') : $t('disabled'))"
                          :disable="!source.enabled"/>
              </q-form>
              <q-stepper-navigation>
                <q-btn @click='step = source.record_enabled ? 6 : 7' color='cyan' :label="$t('continue')" :disable="!source.enabled"/>
                <q-btn flat @click='step = 4' color='cyan' :label="$t('back')" class='q-ml-sm' :disable="!source.enabled"/>
              </q-stepper-navigation>
            </q-step>

            <q-step v-if='source.record_enabled' id='step6' :name='6' :title="$t('recording')" icon='radio_button_checked' color='cyan'
                    :done='step > 6'>
              <q-form class='q-gutter-md'>
                <q-select dense emit-value map-options filled v-model='source.record_file_type' color='cyan' :options='recordFileTypes'
                          :label="$t('record_file_type')" transition-show='scale' transition-hide='scale' :disable="!source.enabled"/>
                <q-select dense emit-value map-options filled v-model='source.record_video_codec' :options='recordVideoCodecs'
                          :label="$t('record_video_codec')" color='cyan' transition-show='scale' transition-hide='scale'
                          :disable="!source.enabled"/>
                <q-input v-if='showRecordDetail' dense filled v-model.number='source.record_quality' type='number' :label="$t('record_quality')"
                         color='cyan' :disable="!source.enabled"/>
                <q-select v-if='showRecordDetail' dense emit-value map-options filled v-model='source.record_preset' color='cyan'
                          :options='recordPresets' :label="$t('record_preset')" transition-show='scale' transition-hide='scale'
                          :disable="!source.enabled"/>
                <q-input v-if='showRecordDetail' dense filled v-model.number='source.record_frame_rate' type='number'
                         :label="$t('record_frame_rate')" color='cyan' :disable="!source.enabled"/>
                <q-input v-if='showRecordDetail' dense filled v-model.number='source.record_width' type='number' :label="$t('record_width')"
                         color='cyan' :disable="!source.enabled"/>
                <q-input v-if='showRecordDetail' dense filled v-model.number='source.record_height' type='number' :label="$t('record_height')"
                         color='cyan' :disable="!source.enabled"/>
                <q-input dense filled v-model.number='source.record_segment_interval' type='number' :label="$t('record_segment_interval')"
                         color='cyan' :disable="!source.enabled"/>
                <q-select v-if='showRecordDetail' dense emit-value map-options filled v-model='source.record_rotate' color='cyan'
                          :options='recordRotations' :label="$t('record_rotate')" transition-show='scale' transition-hide='scale'
                          :disable="!source.enabled"/>
                <q-select emit-value map-options dense filled v-model='source.record_audio_codec'
                          :options='audioCodecs' :label="$t('record_audio_codec')" color='cyan' transition-show='scale' transition-hide='scale'
                          :disable="!source.enabled"/>
                <q-select v-if='source.record_audio_codec !== 0 && source.record_audio_codec !== 8' dense emit-value map-options filled
                          v-model='source.record_audio_channel' color='cyan' :options='audioChannels' :label="$t('record_audio_channel')"
                          transition-show='flip-up' transition-hide='flip-down' :disable="!source.enabled"/>
                <q-select v-if='source.record_audio_codec !== 0 && source.record_audio_codec !== 8' dense emit-value map-options filled
                          v-model='source.record_audio_quality' color='cyan' :options='audioQualities' :label="$t('record_audio_quality')"
                          transition-show='scale' transition-hide='scale' :disable="!source.enabled"/>
                <q-select v-if='source.record_audio_codec !== 0 && source.record_audio_codec !== 8' dense emit-value map-options filled
                          v-model='source.record_audio_sample_rate' color='cyan' :options='audioSampleRates'
                          :label="$t('record_audio_sample_rate')" transition-show='scale'
                          transition-hide='scale' :disable="!source.enabled"/>
                <q-input v-if='source.record_audio_codec !== 0 && source.record_audio_codec !== 8' dense filled
                         v-model.number='source.record_audio_volume' :label="$t('record_audio_codec')" color='cyan' :disable="!source.enabled"/>
              </q-form>
              <q-stepper-navigation>
                <q-btn @click='step = 7' color='cyan' :label="$t('continue')" :disable="!source.enabled"/>
                <q-btn flat @click='step = 5' color='cyan' :label="$t('back')" class='q-ml-sm' :disable="!source.enabled"/>
              </q-stepper-navigation>
            </q-step>

            <q-step id='step7' :name='7' :title="$t('logging')" icon='announcement' color='cyan'>
              <q-select dense emit-value map-options filled v-model='source.log_level' :options='logLevels'
                        :label="$t('log_level')" transition-show='scale' transition-hide='scale' color='cyan' :disable="!source.enabled"/>
              <q-stepper-navigation>
                <q-btn flat @click='step = source.record_enabled ? 6 : 5' color='cyan' :label="$t('back')" class='q-ml-sm' :disable="!source.enabled"/>
              </q-stepper-navigation>
            </q-step>

          </q-stepper>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>

  <q-dialog v-model='showOnvif' full-width full-height>
    <OnvifSettings :color='"brown-5"' :address='source.address'/>
  </q-dialog>

  <q-dialog v-model="showQuickWizard">
    <q-card class="my-card" style="overflow: hidden;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h10">Add a New Source Quickly</div>
        <q-space/>
        <q-btn icon="close" flat round dense v-close-popup/>
      </q-card-section>
      <q-card-section>
        <div class="q-pa-md" style="width: 400px;">
          <q-input dense filled v-model.trim='source.name' :label="$t('name')" color='cyan'
                   lazy-rules :rules="[ val => val && val.length > 0 || $t('v_enter_valid_name')]"/>
          <q-input dense filled v-model.trim='source.address' color='cyan' :label="$t('address')"
                   lazy-rules :rules="[ val => val && val.length > 0 || $t('v_enter_valid_address')]"/>
        </div>
      </q-card-section>
      <q-separator/>
      <q-card-actions align="right">
        <q-btn flat color="cyan" :label="$t('find_best_settings')" icon-right="auto_awesome" @click="onFindOptimalSettings2"
               :disable="quickWizardShowing">
          <q-inner-loading :showing="quickWizardShowing"/>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>

<script lang='ts'>
import {ref, computed, onMounted, nextTick, onBeforeUnmount} from 'vue';
import {SourceModel} from 'src/utils/models/source_model';
import CommandBar from 'src/components/CommandBar.vue';
import OnvifSettings from 'components/OnvifSettings.vue';
import {NodeService} from 'src/utils/services/node_service';
import {useQuasar} from 'quasar';
import {PublishService, SubscribeService} from 'src/utils/services/websocket_services';
import {databindWithLoading, findBestSettings, isNullOrEmpty, isNullOrUndefined} from 'src/utils/utils';
import {LocalService} from 'src/utils/services/local_service';
import {StoreService} from 'src/utils/services/store_service';
import {WsConnection} from 'src/utils/ws/connection';
import {ProbeResponseEvent, ProbeResult} from 'src/utils/models/various';
import {List} from 'linqts';
import {useI18n} from 'vue-i18n';
import {StreamCommandBarActions} from 'src/store/module-settings/state';

declare var $: any;
export default {
  name: 'SourceSettings',
  components: {CommandBar, OnvifSettings},
  emits: ['on-save', 'on-delete'],
  props: {
    sourceId: {
      type: String,
      required: false,
      default: null
    }
  },
  //@ts-ignore
  setup(props: any, {emit}) {
    const {t} = useI18n({useScope: 'global'});
    const localService = new LocalService();
    const source = ref<SourceModel>(localService.createEmptySource());
    const showRecordDetail = computed(() => {
      //@ts-ignore
      return source.value.record_video_codec != 5 && source.value.record_video_codec < 14;
    });
    const step = ref<number>(1);
    const nodeService = new NodeService();
    const storeService = new StoreService();
    const rtspTransports = ref(localService.createRtspTransport());
    const logLevels = ref(localService.createLogLevels(t));
    const accelerationEngines = ref(localService.createAccelerationEngines());
    const videoDecoders = ref(localService.createVideoDecoders());
    const streamTypes = ref(localService.createStreamTypes());
    const streamVideoCodecs = ref(localService.createStreamVideoCodecs());
    const audioCodecs = ref(localService.createAudioCodecs());
    const presets = ref(localService.createPresets(t));
    const streamRotations = ref(localService.createRotations(t));
    const rtmpServerTypes = ref(localService.createRtmpServerTypes());
    const audioChannels = ref(localService.createAudioChannels());
    const audioQualities = ref(localService.createAudioQualities());
    const audioSampleRates = ref(localService.createAudioSampleRates());
    const recordFileTypes = ref(localService.createRecordFileTypes());
    const recordVideoCodecs = ref(localService.createRecordVideoCodecs());
    const recordPresets = ref(localService.createPresets(t));
    const recordRotations = ref(localService.createRotations(t));
    const snapshotTypes = ref(localService.createSnapshotTypes());
    const flvPlayerTypes = ref(localService.createFlvPlayerTypes(t));
    const sourceStates = ref(localService.createSourceStates(t));
    const inactives = ref({save: false, delete: false});
    const showOnvif = ref<boolean>(false);
    const recommendedRtspAddresses = ref<string[]>([]);
    const showFindOptimalSettings = ref<boolean>(false);
    const showQuickWizard = ref<boolean>(false);
    const quickWizardShowing = ref<boolean>(false);
    const copySelectedSourceId = ref<string>('');
    const copyPrevSources = ref<SourceModel[]>([]);
    const loadingMakeEnabledOrDisabled = ref<boolean>(false);

    const insertMode = computed(() => {
      return isNullOrEmpty(source.value.id);
    });

    const publishService = new PublishService();
    const $q = useQuasar();
    let to: NodeJS.Timer | null = null;
    let conn: WsConnection | null = null;

    onMounted(async () => {
      if (!isNullOrEmpty(props.sourceId)) {
        source.value = await nodeService.getSource(props.sourceId);
      } else {
        const onfn = await nodeService.getOnvifNetwork();
        if (onfn && onfn.results) {
          for (const r of onfn.results) {
            if (r.address) {
              recommendedRtspAddresses.value.push(`rtsp://user:password@${r.address}/route`);
            }
          }
        }
      }

      copyPrevSources.value = await nodeService.getSourceList();

      const subscribeService = new SubscribeService(await nodeService.LocalService.getNodeIP(),
        await nodeService.LocalService.getNodePort());
      conn = subscribeService.subscribeProbe((event: MessageEvent) => {
        try {
          const responseModel: ProbeResponseEvent = JSON.parse(event.data);
          if (!responseModel?.result_b64) {
            return;
          }
          const probeResult: ProbeResult = JSON.parse(atob(responseModel.result_b64));
          findBestSettings(source.value, probeResult);
        } finally {
          showFindOptimalSettings.value = false;
        }
      });

      to = setTimeout(() => {
        for (let j = 1; j <= 7; ++j) {
          jqueryWorks(j);
        }
      }, 100);
    });

    onBeforeUnmount(() => {
      if (conn) {
        conn.close();
      }
      if (to) {
        clearTimeout(to);
      }
    });

    const jqueryWorks = (divIdIndex: number) => {
      const div = $(`#step${divIdIndex}`).find('div');
      div.css('cursor', 'pointer');
      div.click(function () {
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
          message: t('v_enter_both_name_and_address'),
          caption: t('invalid'),
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
        storeService.addSourceToLeftMenu(source.value);
      } else {
        storeService.updateSourceToLeftMenu(source.value);
      }
      $q.notify({
        message: model.name + t(isAdded ? 'has_been_added' : 'has_been_saved'),
        color: 'green',
        position: 'bottom-right'
      });
      emit('on-save', e);
      storeService.setNotifySourceStreamStatusChanged();
    }

    function onDelete(e: any) {
      const model = source.value;
      if (isNullOrUndefined(model)) {
        return;
      }

      $q.dialog({
        title: t('confirm'),
        message: t('delete_are_you_sure'),
        cancel: true,
        persistent: false
      }).onOk(() => {
        void doDelete();
      });

      const doDelete = async () => {
        let result = false;
        try {
          inactives.value.delete = true;
          result = await nodeService.removeSource(<string>model.id);
        } finally {
          inactives.value.delete = false;
        }
        if (!result) {
          $q.notify({
            message: t('no_source_has_been_deleted'),
            color: 'green',
            position: 'bottom-right'
          });
          return;
        }
        emit('on-delete', e);
        storeService.removeSourceFromLeftMenu(<string>model.id);
        $q.notify({
          message: model.name + t('has_been_removed_permanently'),
          color: 'green',
          position: 'bottom-right'
        });
      };
    }

    const onStreamTypeChanged = () => {
      if (!source.value.stream_type) {
        return;
      }
      if (source.value.stream_type > 1) {
        source.value.booster_enabled = false;
        if (!source.value.record_enabled) {
          source.value.stream_audio_codec = 0; // No Audio
        }
      }
    };

    const onFindOptimalSettings = () => {
      if (!source.value.address) {
        $q.notify({
          message: t('v_enter_address_field'),
          caption: t('invalid'),
          color: 'red-14',
          position: 'bottom-right'
        });
        return;
      }
      const fn = (address: string) => {
        showFindOptimalSettings.value = true;
        void publishService.publishProbe(address);
      };
      if (!source.value.id) { //new
        fn(source.value.address);
      } else { //edit
        $q.dialog({
          title: t('confirm'),
          message: t('are_you_sure_load_optimal_settings'),
          cancel: true,
          persistent: false
        }).onOk(() => {
          //@ts-ignore
          fn(source.value.address);
        });
      }
    };

    const onCopySettingsFromChanged = () => {
      if (!copySelectedSourceId.value || !copyPrevSources.value.length) {
        $q.notify({
          message: t('please_select_source_first'),
          color: 'red',
          position: 'bottom-right'
        });
      }
      const selectedSource = new List(copyPrevSources.value).FirstOrDefault((x: any) => x.id === copySelectedSourceId.value);
      if (!selectedSource) {
        return;
      }
      $q.dialog({
        title: t('confirm'),
        message: t('are_you_sure_copy_settings_from') + selectedSource.name + '?',
        cancel: true,
        persistent: false
      }).onOk(() => {
        nodeService.getSource(copySelectedSourceId.value).then(data => {
          data.id = '';
          data.name += ' Copy'
          source.value = data;
        }).catch(console.error);
      }).onCancel(() => {
        copySelectedSourceId.value = '';
      });
    };

    const onMakeEnabledOrDisabled = async () => {
      await databindWithLoading(loadingMakeEnabledOrDisabled, async () => {
        source.value = await nodeService.setSourceEnabled({id: <string>source.value.id, enabled: !source.value.enabled});
        setTimeout(() =>{
          storeService.setNotifySourceStreamStatusChanged();
          if (!source.value.enabled){
            storeService.setStreamCommandBar({ source: {...source.value}, action: StreamCommandBarActions.CloseSourceSettings});
          }
        }, 3000);
      });
    };

    return {
      source, showRecordDetail, step, rtspTransports, logLevels,
      accelerationEngines, videoDecoders, streamTypes,
      audioCodecs, streamVideoCodecs, presets, recommendedRtspAddresses,
      streamRotations, rtmpServerTypes, audioChannels, inactives, showOnvif,
      audioQualities, audioSampleRates, recordFileTypes, recordVideoCodecs,
      recordPresets, recordRotations, showFindOptimalSettings, snapshotTypes, flvPlayerTypes, sourceStates, loadingMakeEnabledOrDisabled,
      onSave, onDelete, onStep1Click, onRecordChange, onStreamTypeChanged, onFindOptimalSettings, onMakeEnabledOrDisabled,
      insertMode, showQuickWizard, quickWizardShowing,
      onFindOptimalSettings2() {
        let model = source.value;
        if (!model.name || !model.address) {
          $q.notify({
            message: t('v_enter_both_name_and_address'),
            caption: 'Invalid',
            color: 'red-14',
            position: 'bottom-right'
          });
          return;
        }
        showQuickWizard.value = true;
        quickWizardShowing.value = true;
        onFindOptimalSettings();
        setTimeout(() => {
          quickWizardShowing.value = false;
          showQuickWizard.value = false;
        }, 3000);
      },
      copySelectedSourceId, copyPrevSources,
      onCopySettingsFromChanged
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

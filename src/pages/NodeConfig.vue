<template>
  <div class='q-pa-md q-gutter-sm' style='margin-bottom: -35px;'>
    <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='width: 99.5%'>
      <q-tabs v-model='tab' narrow-indicator inline-label dense shrink stretch align='left' :breakpoint="0">
        <q-tab name='config' icon='settings_applications' :label="$t('config')" />
        <q-tab name='cloud' icon='cloud' :label="$t('cloud')" />
        <q-tab name='general' icon='developer_board' :label="$t('general')" />
        <q-tab name='ai_modules' icon='auto_awesome' :label="$t('ai_modules')" />
        <q-tab name='info' icon='analytics' :label="$t('info')" />
      </q-tabs>
    </q-toolbar>
  </div>

  <div class='q-pa-md q-gutter-sm' v-if='config&&tab==="config"'>
    <div class='row'>

      <div class='col-xs-12 col-sm-6 col-md-4'>
        <q-card class="my-card" flat bordered>
          <q-card-section class="bg-cyan text-white">
            <CommandBar v-if='tab==="config"' :show-delete='false' @on-save='onSave' @on-restore='onRestore'
                        :show-refresh="true" :inactive-refresh="loadingConfig" @on-refresh="configDatabind" />
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-input v-model.trim='device.device_name' filled dense :label="$t('device') + ' ' + $t('name')" disable />
            <q-space style='height: 10px;' />
            <q-select emit-value map-options filled disable dense
                      v-model='device.device_arch' :options='optDeviceArchitectures' :label="$t('device') + ' ' + $t('architecture')" />
          </q-card-section>
        </q-card>
        <q-space style='height: 10px;' />

        <q-card class="my-card" flat bordered>
          <q-card-section class="bg-cyan text-white">
            <div class="text-subtitle2">
              <div class="text-subtitle2"><label style='text-transform: uppercase;font-size: medium'>{{ $t('general') }}</label></div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-table dense :title="'Disks'" :rows='disks' color="bg-cyan"
                     :columns='disksColumns' row-key='name' :rows-per-page-options="[0]" :pagination='noPagination'
                     :loading-label="$t('loading')" :no-data-label="$t('no_data')" :no-results-label="$t('no_results')"
                     :selected-rows-label="() => $t('selected_rows')" :rows-per-page-label="$t('rows_per_page')">
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="no" :props="props">
                    {{ props.row.no }}
                  </q-td>
                  <q-td key="path" :props="props">
                    <q-input dense v-model="props.row.path" filled />
                  </q-td>
                  <q-td key="delete" :props='props'>
                    <q-btn dense round color='cyan' icon='delete' @click='onDeleteDisk(props.row.no-1)'>
                      <q-tooltip>{{ $t('delete_disk_path') }}</q-tooltip>
                    </q-btn>
                  </q-td>
                </q-tr>
              </template>

              <template v-slot:top-left>
                <q-btn dense icon='add' :label="$t('add')" color='cyan' style='margin-right: 15px;' @click='onAddNewDisk'>
                  <q-tooltip>{{ $t('add_new_disk_path') }}</q-tooltip>
                </q-btn>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
        <q-space style='height: 10px;' />

        <q-card class="my-card" flat bordered>
          <q-card-section class="bg-cyan text-white">
            <div class="text-subtitle2">
              <label style='text-transform: uppercase;font-size: medium'>{{ $t('database') }}</label>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-select emit-value map-options filled dense v-model='db.type' :options='dbTypes' :label="$t('database')" />
            <q-space style='height: 10px;' />
            <q-input v-model.trim='db.connection_string' filled dense :label="$t('connection_string')" />
          </q-card-section>
        </q-card>
        <q-space style='height: 10px;' />

        <q-card class="my-card" flat bordered>
          <q-card-section class="bg-cyan text-white">
            <div class="text-subtitle2">
              <label style='text-transform: uppercase;font-size: medium'>{{ $t('archive') }}</label>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-input type="number" v-model.number='archive.limit_percent' filled dense :label="$t('limit_percent')" />
            <q-space style='height: 10px;' />
            <q-select emit-value map-options filled dense v-model='archive.action_type' :options='archiveActionTypes' :label="$t('action_type')" />
            <q-space v-show="archive.action_type===1" style='height: 10px;' />
            <q-input v-show="archive.action_type===1" v-model.trim='archive.move_location' filled dense :label="$t('move_location')" />
          </q-card-section>
        </q-card>
        <q-space style='height: 10px;' />

      </div>

      <div class='col-xs-12 col-sm-6 col-md-4'>

        <q-card class="my-card" flat bordered style="margin: 0 5px 0 5px;">
          <q-card-section class="bg-cyan text-white">
            <div class="text-subtitle2">
              <label style='text-transform: uppercase;font-size: medium'>FFmpeg</label>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-toggle v-model='ffmpeg.use_double_quotes_for_path' filled dense :label="$t('use_double_quotes_for_path')" />
            <q-space style='height: 10px;' />
            <q-input v-model.number='ffmpeg.max_operation_retry_count' type='number' filled dense :label="$t('max_retry_count')" />
            <q-space style='height: 10px;' />
            <q-input v-model.number='ffmpeg.ms_init_interval' type='number' filled dense :label="$t('ms_init_interval')" />
            <q-space style='height: 10px;' />
            <q-input v-model.number='ffmpeg.watch_dog_interval' type='number' filled dense :label="$t('watch_dog_interval')" />
            <q-space style='height: 10px;' />
            <q-input v-model.number='ffmpeg.watch_dog_failed_wait_interval' type='number' filled dense
                     :label="$t('watch_dog_failed_wait_interval')" />
            <q-space style='height: 10px;' />
            <q-input v-model.number='ffmpeg.start_task_wait_for_interval' type='number' filled dense :label="$t('start_task_wait_for_interval')" />
            <q-space style='height: 10px;' />
            <q-input v-model.number='ffmpeg.record_concat_limit' type='number' filled dense :label="$t('record_concat_limit')" />
            <q-space style='height: 10px;' />
            <q-input v-model.number='ffmpeg.record_video_file_indexer_interval' type='number' filled dense
                     :label="$t('record_video_file_indexer_interval')" />
            <q-space style='height: 10px;' />
            <q-input v-model.number='ffmpeg.ms_port_start' type='number' filled dense :label="$t('ms_port_start')" />
            <q-space style='height: 10px;' />
            <q-input v-model.number='ffmpeg.ms_port_end' type='number' filled dense :label="$t('ms_port_end')" />
          </q-card-section>
        </q-card>
        <q-space style='height: 10px;' />

        <q-card class="my-card" flat bordered style="margin: 0 5px 0 5px;">
          <q-card-section class="bg-cyan text-white">
            <div class="text-subtitle2">
              <label style='text-transform: uppercase;font-size: medium'>{{ $t('recurring_jobs') }}</label>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-toggle v-model='jobs.mac_ip_matching_enabled' filled dense :label="$t('mac_ip_match_enabled')" />
            <q-space style='height: 10px;' />
            <q-input type="number" v-model.number='jobs.mac_ip_matching_interval' filled dense :label="$t('mac_ip_matching_interval')" />
            <q-toggle v-model='jobs.black_screen_monitor_enabled' filled dense :label="$t('black_screen_monitor_enabled')" />
            <q-space style='height: 10px;' />
            <q-input type="number" v-model.number='jobs.black_screen_monitor_interval' filled dense :label="$t('black_screen_monitor_interval')" />
          </q-card-section>
        </q-card>
        <q-space style='height: 10px;' />

      </div>

      <div class='col-xs-12 col-sm-6 col-md-4'>

        <q-card class="my-card" flat bordered style="margin: 0 5px 0 5px;">
          <q-card-section class="bg-cyan text-white">
            <div class="text-subtitle2">
              <label style='text-transform: uppercase;font-size: medium'>{{ $t('snapshot') }}</label>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-input v-model.number='snapshot.process_count' type='number' filled dense :label="$t('process_count')" />
            <q-space style='height: 10px;' />
            <q-toggle v-model='snapshot.overlay' filled dense :label="$t('overlay')" />
            <q-space style='height: 10px;' />
          </q-card-section>
        </q-card>
        <q-space style='height: 10px;' />

        <q-card class="my-card" flat bordered>
          <q-card-section class="bg-cyan text-white">
            <div class="text-subtitle2">
              <label style='text-transform: uppercase;font-size: medium'>{{ $t('ai') }}</label>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-input type="number" v-model.number='ai.video_clip_duration' filled dense :label="$t('video_clip_duration')" />
          </q-card-section>
        </q-card>
        <q-space style='height: 10px;' />

        <q-card class="my-card" flat bordered>
          <q-card-section class="bg-cyan text-white">
            <div class="text-subtitle2">
              <label style='text-transform: uppercase;font-size: medium'>{{ $t('sense_ai_config') }}</label>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-select emit-value map-options filled dense v-model='sense_ai.image' :options='senseAiImages'
                      :label="$t('sense_ai_image')" />
            <q-space style='height: 10px;' />
            <q-input v-model='sense_ai.host' filled dense :label="$t('sense_ai_host')" />
            <q-space style='height: 10px;' />
            <q-input type="number" v-model.number='sense_ai.port' filled dense :label="$t('sense_ai_port')" />
            <q-space style='height: 10px;' />
          </q-card-section>
        </q-card>
        <q-space style='height: 10px;' />

        <q-card class="my-card" flat bordered>
          <q-card-section class="bg-cyan text-white">
            <div class="text-subtitle2">
              <label style='text-transform: uppercase;font-size: medium'>{{ $t('desima') }}</label>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-toggle v-model='desima.enabled' filled dense :label="$t('desima_enabled')" />
            <q-input v-model.trim='desima.address' filled dense :label="$t('desima_address')" />
            <q-space style='height: 10px;' />
            <q-input v-model.trim='desima.token' filled dense :label="$t('desima_token')" />
            <q-space style='height: 10px;' />
            <q-input v-model.trim='desima.web_app_address' filled dense :label="$t('desima_web_app_address')" />
            <q-space style='height: 10px;' />
            <q-input type="number" v-model.number='desima.max_retry' filled dense :label="$t('desima_max_retry')" />
          </q-card-section>
        </q-card>
        <q-space style='height: 10px;' />

      </div>

    </div>
  </div>
  <div class='q-pa-md q-gutter-sm' v-if='config&&tab==="cloud"'>
    <Cloud />
  </div>
  <div class='q-pa-md q-gutter-sm' v-if='config&&tab==="general"' style='margin-top: -45px;'>
    <q-space style='height: 1px;' />
    <q-card class="my-card" flat bordered>
      <q-card-section class="bg-yellow-9 text-white">
        <div class="text-subtitle2">
          <label style='text-transform: uppercase;font-size: medium'>{{ $t('running_services') }}</label>
        </div>
      </q-card-section>
      <q-separator />
      <q-table :pagination='initialPagination' :rows='services' row-key='name' :columns='servicesColumns' color='yellow-9'
               :rows-per-page-label="$t('rows_per_page')" :filter="filterServices" :loading="loadingServices">

        <template v-slot:body-cell-restart='props'>
          <q-td :props='props' v-if="props.row.instance_type===1">
            <q-btn color='primary' icon='restart_alt' @click='onRestartService(props.row)' :disable="!props.row.restart_button_enabled">
              <q-tooltip>{{ $t('restart_service') }}</q-tooltip>
              <q-inner-loading :showing='restartLoading[props.row.name]' />
            </q-btn>
          </q-td>
        </template>

        <template v-slot:body-cell-start='props'>
          <q-td :props='props' v-if="props.row.instance_type===1">
            <q-btn color='secondary' icon='play_circle' @click='onStartService(props.row)' :disable="!props.row.start_button_enabled">
              <q-tooltip>{{ $t('start_service') }}</q-tooltip>
              <q-inner-loading :showing='startLoading[props.row.name]' />
            </q-btn>
          </q-td>
        </template>

        <template v-slot:body-cell-stop='props'>
          <q-td :props='props' v-if="props.row.instance_type===1">
            <q-btn color='red' icon='stop_circle' @click='onStopService(props.row)' :disable="!props.row.stop_button_enabled">
              <q-tooltip>{{ $t('stop_service') }}</q-tooltip>
              <q-inner-loading :showing='stopLoading[props.row.name]' />
            </q-btn>
          </q-td>
        </template>

        <template v-slot:top-right>
          <q-btn icon='refresh' :label="$t('refresh')" color='yellow-9' style='margin-right: 15px;' @click='serviceDataBind' />
          <q-input borderless dense debounce='300' v-model='filterServices' :placeholder="$t('search')">
            <template v-slot:append>
              <q-icon name='search' />
            </template>
          </q-input>
        </template>

        <template v-slot:loading>
          <q-inner-loading showing color="lime-6" />
        </template>

      </q-table>
    </q-card>
    <q-space style='height: 10px;' />

    <q-card class="my-card" flat bordered v-if="!readonlyMode">
      <q-card-section class="bg-teal text-white">
        <div class="text-subtitle2">
          <label style='text-transform: uppercase;font-size: medium'>{{ $t('users2') }}</label>
        </div>
      </q-card-section>
      <q-separator />
      <q-table :pagination='initialPagination' :rows='users' row-key='id' :columns='userColumns' color='teal'
               :rows-per-page-label="$t('rows_per_page')" :filter="filterUsers" :loading="loadingUsers">
        <template v-slot:body-cell-delete='props'>
          <q-td :props='props'>
            <div>
              <q-btn round color='deep-orange' icon='delete' @click='onDeleteUser(props.row)'>
                <q-tooltip>{{ $t('delete') }}</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <template v-slot:top-right>
          <q-btn icon='refresh' :label="$t('refresh')" color='teal' style='margin-right: 15px;' @click='userDataBind' />
          <q-input borderless dense debounce='300' v-model='filterUsers' :placeholder="$t('search')">
            <template v-slot:append>
              <q-icon name='search' />
            </template>
          </q-input>
        </template>

        <template v-slot:loading>
          <q-inner-loading showing color="teal" />
        </template>

      </q-table>
    </q-card>
    <q-space style='height: 10px;' v-if="!readonlyMode" />

    <q-card class="my-card" flat bordered>
      <q-card-section class="bg-blue-6 text-white">
        <div class="text-subtitle2">
          <label style='text-transform: uppercase;font-size: medium'>RTSP {{ $t('templates') }}</label>
        </div>
      </q-card-section>
      <q-separator />
      <q-table :pagination='initialPagination' :rows='msTemplates' row-key='id' :columns='msTemplatesColumns' color='light-blue-6'
               :rows-per-page-label="$t('rows_per_page')" :loading="loadingMsTemplates" :filter="filterMsTemplates">
        <template v-slot:top-right>
          <q-btn icon='refresh' :label="$t('refresh')" color='light-blue-6' style='margin-right: 15px;' @click='msTemplatesDataBind' />
          <q-input borderless dense debounce='300' v-model='filterMsTemplates' :placeholder="$t('search')">
            <template v-slot:append>
              <q-icon name='search' />
            </template>
          </q-input>
        </template>

        <template v-slot:loading>
          <q-inner-loading showing color="light-blue-6" />
        </template>
      </q-table>
    </q-card>
    <q-space style='height: 10px;' />

  </div>
  <div class='q-pa-md q-gutter-sm' v-if='config&&tab==="ai_modules"'>
    <AiModules />
  </div>
  <div class='q-pa-md q-gutter-sm' v-if='config&&tab==="info"'>
    <q-toolbar class='bg-lime-7 text-white shadow-2 rounded-borders' style='width: 99.5%;margin-bottom: -20px;'>
      <q-tabs v-model='otherTabs' narrow-indicator inline-label dense shrink stretch align='left'>
        <q-tab name="gpu" icon="memory" :label="$t('gpu')" />
        <q-tab name='failedstreams' icon='sms_failed' :label="$t('failed_streams')" />
        <q-tab name='recstucks' icon='radio_button_checked' :label="$t('stuck_records')" />
        <q-tab name='smartvisions' icon='auto_awesome' :label="$t('smart_vision_models')" />
        <q-tab name='various' icon='notes' :label="$t('various_infos')" />
      </q-tabs>
    </q-toolbar>
    <div v-if='otherTabs==="gpu"' style="margin-top: 25px;">
      <GpuInfo />
    </div>
    <div v-if='otherTabs==="failedstreams"' style="margin-top: 25px;">
      <q-table :pagination='initialPagination' :rows='failedStreams' row-key='id' :columns='failedStreamsColumns'
               :rows-per-page-label="$t('rows_per_page')" color='lime-6' :loading="loadingFailedStreams">
        <template v-slot:top-right>
          <q-btn icon='refresh' :label="$t('refresh')" color='lime-6' style='margin-right: 15px;' @click='failedStreamsDatabind' />
        </template>
        <template v-slot:loading>
          <q-inner-loading showing color="lime-6" />
        </template>
      </q-table>
    </div>
    <div v-if='otherTabs==="recstucks"' style="margin-top: 25px;">
      <q-table :pagination='initialPagination' :rows='recStucks' row-key='id' :columns='recStucksColumns' color='lime-6'
               :rows-per-page-label="$t('rows_per_page')" :loading="loadingRecStucks">
        <template v-slot:top-right>
          <q-btn icon='refresh' :label="$t('refresh')" color='lime-6' style='margin-right: 15px;' @click='recStucksDatabind' />
        </template>
        <template v-slot:loading>
          <q-inner-loading showing color="lime-6" />
        </template>
      </q-table>
    </div>
    <div v-if='otherTabs==="smartvisions"' style="margin-top: 25px;">
      <q-table :pagination='initialPagination' :rows='smartVisionRows' row-key='id' :columns='aiColumns' color='lime-6'
               :rows-per-page-label="$t('rows_per_page')" :loading="loadingSmartVisions">
        <template v-slot:top-right>
          <q-btn icon='refresh' :label="$t('refresh')" color='lime-6' style='margin-right: 15px;' @click='smartVisionsDatabind' />
        </template>
        <template v-slot:loading>
          <q-inner-loading showing color="lime-6" />
        </template>
      </q-table>
    </div>
    <div v-if='otherTabs==="various"' style="margin-top: 35px">
      <ImportExportSource />
      <q-separator style="margin: 15px 0 15px 0;" />
      <table style='width: 500px;' class="bg-teal-1">
        <tr>
          <td>
            <q-input v-model='variousInfos.ms_port_counter' type='number' :label="$t('ms_counter')" readonly />
          </td>
          <td>
            <q-btn icon='refresh' :label="$t('refresh')" color='lime-6' style='margin-right: 15px;' @click='variousInfosDataBind'
                   :disable="loadingVariousInfo">
              <q-inner-loading :showing="loadingVariousInfo" color="lime-6" />
            </q-btn>
          </td>
        </tr>
        <tr>
          <td>
            <q-input v-model='variousInfos.ffmpeg_process_zombies.length' type='number' :label="$t('total_detected_zombie_ffmpeg_processes')"
                     readonly />
          </td>
        </tr>
      </table>
      <q-separator style="margin: 15px 0 15px 0;" />
      <q-list bordered class='rounded-borders bg-teal-1' style="max-width: 300px;margin-top: 15px;">
        <q-item-label header>{{ $t('zombie_ms_containers') }}</q-item-label>
        <q-item clickable v-ripple v-for='zr in variousInfos.ms_container_zombies' :key='zr'>
          <q-item-section>
            <q-item-label caption lines='2'>
              {{ zr }}
            </q-item-label>
          </q-item-section>
          <q-separator inset='item' />
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { NodeService } from 'src/utils/services/node_service';
import { onMounted, ref } from 'vue';
import {
  Config, DeviceConfig,
  FFmpegConfig, AiConfig, GeneralConfig, DbConfig, JobsConfig, ArchiveConfig, SnapshotConfig, DesimaConfig, SenseAIConfig
} from 'src/utils/models/config';
import { databindWithLoading, fixArrayDates, validateModel } from 'src/utils/utils';
import { ServiceModel } from 'src/utils/models/service_model';
import { User } from 'src/utils/models/user_model';
import { useQuasar } from 'quasar';
import CommandBar from 'src/components/CommandBar.vue';
import AiModules from 'components/AiModules.vue';
import GpuInfo from 'components/GpuInfo.vue';
import { FailedStreamModel, RecStuckModel, RtspTemplateModel, VariousInfos } from 'src/utils/models/others_models';
import { SmartVisionModel } from 'src/utils/models/ai_model';
import Cloud from 'components/Cloud.vue';
import ImportExportSource from 'components/ImportExportSource.vue';
import { SelectOption } from 'src/utils/services/local_service';
import { useI18n } from 'vue-i18n';
import { StoreService } from 'src/utils/services/store_service';
import { List } from 'linqts';

const { t } = useI18n({ useScope: 'global' });
const $q = useQuasar();
const nodeService = new NodeService();
const localService = nodeService.LocalService;
const storeService = new StoreService();
const config = ref<Config>();
const loadingConfig = ref<boolean>(false);
// @ts-ignore
const device = ref<DeviceConfig>({});
// @ts-ignore
const general = ref<GeneralConfig>({});
// @ts-ignore
const db = ref<DbConfig>({});
const dbTypes = ref(localService.createDbTypes());
const senseAiImages = ref(localService.createSenseAiImages());


const optDeviceArchitectures = ref(localService.getDeviceArchitectures());
//@ts-ignore
const ffmpeg = ref<FFmpegConfig>({});
// @ts-ignore
const ai = ref<AiConfig>({});
// @ts-ignore
const sense_ai = ref<SenseAIConfig>({});
//@ts-ignore
const desima = ref<DesimaConfig>({});
// @ts-ignore
const jobs = ref<JobsConfig>({});

// @ts-ignore
const archive = ref<ArchiveConfig>({});
// @ts-ignore
const snapshot = ref<SnapshotConfig>({});
const archiveActionTypes = ref<SelectOption[]>(localService.createArchiveActionTypes(t));


const services = ref<ServiceModel[]>([]);
const loadingServices = ref<boolean>(false);
const filterServices = ref<string>('');
const restartLoading = ref<any>({});
const startLoading = ref<any>({});
const stopLoading = ref<any>({});
const users = ref<User[]>([]);
const loadingUsers = ref<boolean>(false);
const filterUsers = ref<string>('');
const msTemplates = ref<RtspTemplateModel[]>([]);
const loadingMsTemplates = ref<boolean>(false);
const filterMsTemplates = ref<string>('');

const failedStreams = ref<FailedStreamModel[]>([]);
const loadingFailedStreams = ref<boolean>(false);
const recStucks = ref<RecStuckModel[]>([]);
const loadingRecStucks = ref<boolean>(false);
const variousInfos = ref<VariousInfos>({ ms_port_counter: 0, ms_container_zombies: [], ffmpeg_process_zombies: [] });
const loadingVariousInfo = ref<boolean>(false);
const smartVisionRows = ref<SmartVisionModel[]>([]);
const disks = ref<Disk[]>([]);
const loadingSmartVisions = ref<boolean>(false);
const readonlyMode = storeService.readonlyMode;

const setConfigValue = (c: Config) => {
  device.value = c.device;
  general.value = c.general;
  db.value = c.db;
  ffmpeg.value = c.ffmpeg;
  ai.value = c.ai;
  sense_ai.value = c.sense_ai;
  desima.value = c.desima;
  jobs.value = c.jobs;
  archive.value = c.archive;
  snapshot.value = c.snapshot;

  if (c.general.dir_paths?.length) {
    disks.value = c.general.dir_paths.map((dir, index) => {
      return { no: index + 1, path: dir };
    });
  }
};

const configDatabind = async () => {
  await databindWithLoading(loadingConfig, async () => {
    config.value = await nodeService.getConfig();
    setConfigValue(config.value);
  });
};

const serviceDataBind = async () => {
  await databindWithLoading(loadingServices, async () => {
    const svcs = await nodeService.getServices();
    for (const svc of svcs) {
      restartLoading.value[svc.name] = false;
    }
    fixArrayDates(svcs, 'created_at');
    services.value = svcs;
  });
};

const userDataBind = async () => {
  if (readonlyMode.value) {
    return;
  }
  await databindWithLoading(loadingUsers, async () => {
    const usrs = await nodeService.getUsers();
    fixArrayDates(usrs, 'last_login_at');
    users.value = usrs;
  });
};

const failedStreamsDatabind = async () => {
  await databindWithLoading(loadingFailedStreams, async () => {
    failedStreams.value = await nodeService.getFailedStreams();
    fixArrayDates(failedStreams.value, 'last_check_at');
  });
};

const recStucksDatabind = async () => {
  await databindWithLoading(loadingRecStucks, async () => {
    recStucks.value = await nodeService.getRecStucks();
    fixArrayDates(recStucks.value, 'last_check_at');
  });
};

const smartVisionsDatabind = async () => {
  await databindWithLoading(loadingSmartVisions, async () => {
    smartVisionRows.value = await nodeService.getSmartVisions();
    fixArrayDates(smartVisionRows.value, 'created_at');
  });
};
const variousInfosDataBind = async () => {
  await databindWithLoading(loadingVariousInfo, async () => {
    variousInfos.value = await nodeService.getVariousInfos();
  });
};

const msTemplatesDataBind = async () => {
  await databindWithLoading(loadingMsTemplates, async () => {
    msTemplates.value = await nodeService.getRtspTemplates();
  });
};

onMounted(async () => {
  await configDatabind();

  await serviceDataBind();
  await userDataBind();

  await msTemplatesDataBind();

  await failedStreamsDatabind();
  await recStucksDatabind();
  await smartVisionsDatabind();
  await variousInfosDataBind();
});

const onSave = async () => {
  if (!disks.value.length) {
    $q.notify({
      message: t('v_min_disk'),
      caption: t('invalid'),
      color: 'red',
      position: 'bottom-right'
    });
    return;
  }
  //@ts-ignore
  config.value.general.dir_paths = new List(disks.value).Select(x => x.path.trim()).ToArray();
  const prevConfig = await nodeService.getConfig();
  const validationResult = validateModel(t, prevConfig, config.value);
  if (validationResult.length > 0) {
    for (const result of validationResult) {
      $q.notify({
        message: result,
        caption: t('invalid'),
        color: 'red',
        position: 'bottom-right'
      });
    }
    return;
  }
  const portDiff = (config.value?.ffmpeg.ms_port_end ?? 0) - (config.value?.ffmpeg.ms_port_start ?? 0);
  if (portDiff < 1) {
    $q.notify({
      message: t('v_ms_server_port_start'),
      caption: t('invalid'),
      color: 'red',
      position: 'bottom-right'
    });
    return;
  }
  if ((config.value?.ffmpeg.ms_port_start ?? 0) < 1024) {
    $q.notify({
      message: t('v_l_ms_server_port_start'),
      caption: t('invalid'),
      color: 'red',
      position: 'bottom-right'
    });
    return;
  }
  if ((config.value?.ffmpeg.ms_port_end ?? 0) > 65535) {
    $q.notify({
      message: t('v_g_ms_port_end'),
      caption: t('invalid'),
      color: 'red',
      position: 'bottom-right'
    });
    return;
  }
  const source = await nodeService.getSourceList();
  if (source.length * 5 > portDiff) {
    $q.notify({
      message: t('v_ms_port_start_source'),
      caption: t('invalid'),
      color: 'red',
      position: 'bottom-right'
    });
    return;
  }

  await nodeService.saveConfig(<Config>config.value);
  await nodeService.restartAllServices();
};

const onRestore = async () => {
  config.value = await nodeService.restoreConfig();
  setConfigValue(config.value);
};

const onDoDeleteUser = async (user: User) => {
  await nodeService.deleteUser(user.id);
  await userDataBind();
};


const onRestartService = async (service: ServiceModel) => {
  restartLoading.value[service.name] = true;
  try {
    await nodeService.restartService(service);
  } finally {
    restartLoading.value[service.name] = false;
  }
  await serviceDataBind();
};

const onStartService = async (service: ServiceModel) => {
  startLoading.value[service.name] = true;
  try {
    await nodeService.startService(service);
  } finally {
    startLoading.value[service.name] = false;
  }
  await serviceDataBind();
};

const onStopService = async (service: ServiceModel) => {
  stopLoading.value[service.name] = true;
  try {
    await nodeService.stopService(service);
  } finally {
    stopLoading.value[service.name] = false;
  }
  await serviceDataBind();
};


const tab = ref<string>('config');

const initialPagination = {
  rowsPerPage: 15
};
const servicesColumns = createServiceColumns(t);
const userColumns = createUserColumns(t);

function onDeleteUser(user: User) {
  $q.dialog({
    title: 'Confirm',
    message: 'Are you sure you want to delete this user?',
    cancel: true,
    persistent: false
  }).onOk(() => {
    void onDoDeleteUser(user);
  });
}

const msTemplatesColumns = createMsTemplatesColumns(t);
const otherTabs = ref<string>('gpu');
const failedStreamsColumns = createFailedStreamsColumns(t);

const recStucksColumns = createRecStucksColumns(t);
const aiColumns = createAiColumns(t);
const disksColumns = createDisksColumns();

function onAddNewDisk() {
  disks.value.push({
    no: -1,
    path: ''
  });
  disks.value.forEach((disk, index) => {
    disk.no = index + 1;
  });
}

const noPagination = {
  page: 1,
  rowsPerPage: 0
};

function onDeleteDisk(index: number) {
  if (disks.value.length < 2) {
    $q.notify({
      message: t('v_min_disk'),
      caption: t('invalid'),
      color: 'red',
      position: 'bottom-right'
    });
    return;
  }
  const list = new List(disks.value);
  list.RemoveAt(index);
  disks.value = list.ToArray();
  disks.value.forEach((disk, index) => {
    disk.no = index + 1;
  });
}

function createServiceColumns(t: any) {
  return [
    { name: 'restart', align: 'center', label: '', field: 'restart' },
    { name: 'start', align: 'center', label: '', field: 'start' },
    { name: 'stop', align: 'center', label: '', field: 'stop' },
    { name: 'name', align: 'left', label: t('name'), field: 'name', sortable: true },
    { name: 'instance_name', align: 'left', label: t('instance_name'), field: 'instance_name', sortable: true },
    { name: 'description', align: 'left', label: t('description'), field: 'description', sortable: true },
    { name: 'platform', align: 'left', label: t('platform'), field: 'platform', sortable: true },
    {
      name: 'created_at',
      align: 'left',
      label: t('created_at'),
      field: 'created_at',
      format: (val: any) => `${val.toLocaleString()}`,
      sortable: true
    },
    { name: 'platform_version', align: 'left', label: t('platform_version'), field: 'platform_version', sortable: true },
    {
      name: 'instance_type', align: 'left', label: t('instance_type'), field: 'instance_type',
      format: (val: number) => val === 1 ? 'Docker Container' : 'Systemd', sortable: true
    },
    { name: 'hostname', align: 'left', label: t('hostname'), field: 'hostname', sortable: true },
    { name: 'ip_address', align: 'left', label: t('ip_address'), field: 'ip_address', sortable: true },
    { name: 'mac_address', align: 'left', label: t('mac_address'), field: 'mac_address', sortable: true },
    { name: 'processor', align: 'left', label: t('processor'), field: 'processor', sortable: true },
    { name: 'cpu_count', align: 'left', label: t('cpu_count'), field: 'cpu_count', sortable: true },
    { name: 'ram', align: 'left', label: t('ram'), field: 'ram', sortable: true },
    { name: 'pid', align: 'left', label: t('pid'), field: 'pid', sortable: true }
  ];
}

function createUserColumns(t: any) {
  const align = 'left';
  return [
    { name: 'username', align, label: t('username'), field: 'username', sortable: true },
    { name: 'email', align, label: t('email'), field: 'email', sortable: true },
    {
      name: 'last_login_at',
      align,
      label: t('last_login_at'),
      field: 'last_login_at',
      format: (val: any) => `${val.toLocaleString()}`,
      sortable: true
    },
    { name: 'delete', align: 'center', label: '', field: 'delete' }
  ];
}

function createMsTemplatesColumns(t: any) {
  const align = 'left';
  return [
    { name: 'name', align, label: t('name'), field: 'name', sortable: true },
    { name: 'description', align, label: t('description'), field: 'description', sortable: true },
    { name: 'brand', align, label: t('brand'), field: 'brand', sortable: true },
    { name: 'default_user', align, label: t('default_user'), field: 'default_user', sortable: true },
    { name: 'default_password', align, label: t('default_password'), field: 'default_password', sortable: true },
    { name: 'default_port', align, label: t('default_port'), field: 'default_port', sortable: true },
    { name: 'route', align, label: t('route'), field: 'route', sortable: true },
    { name: 'templates', align, label: t('templates2'), field: 'templates', sortable: true }
  ];
}

function createFailedStreamsColumns(t: any) {
  const align = 'left';
  return [
    { name: 'brand', align, label: t('brand'), field: 'brand', sortable: true },
    { name: 'name', align, label: t('name'), field: 'name', sortable: true },
    { name: 'address', align, label: t('address'), field: 'address', sortable: true },

    { name: 'ms_container_failed_count', align, label: t('ms_container_failed_count'), field: 'ms_container_failed_count', sortable: true },
    { name: 'ms_feeder_failed_count', align, label: t('ms_feeder_failed_count'), field: 'ms_feeder_failed_count', sortable: true },
    { name: 'hls_failed_count', align, label: t('hls_failed_count'), field: 'hls_failed_count', sortable: true },
    { name: 'ffmpeg_reader_failed_count', align, label: t('ffmpeg_reader_failed_count'), field: 'ffmpeg_reader_failed_count', sortable: true },
    { name: 'record_failed_count', align, label: t('record_failed_count'), field: 'record_failed_count', sortable: true },
    { name: 'snapshot_failed_count', align, label: t('snapshot_failed_count'), field: 'snapshot_failed_count', sortable: true },
    { name: 'record_stuck_process_count', align, label: t('record_stuck_process_count'), field: 'record_stuck_process_count', sortable: true },
    { name: 'source_state_conflict_count', align, label: t('source_state_conflict_count'), field: 'source_state_conflict_count', sortable: true },
    {
      name: 'last_check_at',
      align,
      label: t('last_check_at'),
      field: 'last_check_at',
      format: (val: any) => `${val.toLocaleString()}`,
      sortable: true
    }
  ];
}

function createRecStucksColumns(t: any) {
  const align = 'left';
  return [
    { name: 'brand', align, label: t('brand'), field: 'brand', sortable: true },
    { name: 'name', align, label: t('name'), field: 'name', sortable: true },
    { name: 'address', align, label: t('address'), field: 'address', sortable: true },

    { name: 'record_segment_interval', align, label: t('record_segment_interval'), field: 'record_segment_interval', sortable: true },
    { name: 'record_output_dir', align, label: t('record_output_dir'), field: 'record_output_dir', sortable: true },
    { name: 'file_ext', align, label: t('file_ext'), field: 'file_ext', sortable: true },
    { name: 'last_modified_file', align, label: t('last_modified_file'), field: 'last_modified_file', sortable: true },
    { name: 'last_modified_size', align, label: t('last_modified_size'), field: 'last_modified_size', sortable: true },
    { name: 'failed_count', align, label: t('failed_count'), field: 'failed_count', sortable: true },
    { name: 'failed_modified_file', align, label: t('failed_modified_file'), field: 'failed_modified_file', sortable: true },
    {
      name: 'last_check_at',
      align,
      label: t('last_check_at'),
      field: 'last_check_at',
      format: (val: any) => `${val.toLocaleString()}`,
      sortable: true
    }
  ];
}

function createAiColumns(t: any) {
  const align = 'left';
  const style = 'max-width:200px;white-space: nowrap;overflow: hidden !important;text-overflow: ellipsis;';
  return [
    { name: 'brand', align, label: t('brand'), field: 'brand', sortable: true },
    { name: 'name', align, label: t('name'), field: 'name', sortable: true },
    { name: 'address', align, label: t('address'), field: 'address', sortable: true },

    { name: 'created_at', align, label: t('created_at'), field: 'created_at', format: (val: any) => `${val.toLocaleString()}`, sortable: true },

    { name: 'threshold_list', align, label: t('threshold_list'), field: 'threshold_list', sortable: true, style },
    { name: 'selected_list', align, label: t('selected_list'), field: 'selected_list', sortable: true, style },
    { name: 'zones_list', align, label: t('zones_list'), field: 'zones_list', sortable: true },
    { name: 'masks_list', align, label: t('masks_list'), field: 'masks_list', sortable: true },
    { name: 'start_time', align, label: t('start_time'), field: 'start_time', sortable: true },
    { name: 'end_time', align, label: t('end_time'), field: 'end_time', sortable: true }
  ];
}

function createDisksColumns() {
  const align = 'left';
  return [
    { name: 'no', align, label: 'Disk No', field: 'no', sortable: false },
    { name: 'path', align, label: 'Disk Path', field: 'path', sortable: false },
    { name: 'delete', align: 'center', label: '', field: 'delete' }
  ];
}

interface Disk {
  no: number;
  path: string;
}

</script>

<style scoped>

</style>

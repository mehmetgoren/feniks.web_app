<template>
  <div class='q-pa-md q-gutter-sm' style='margin-bottom: -35px;'>
    <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='width: 99.5%'>
      <label style='text-transform: uppercase;font-size: medium; font-weight: bold;margin-right: 15px;'> {{ currentNode.name }}</label>
      <q-tabs v-model='tab' narrow-indicator inline-label align='left'>
        <q-tab name='config' icon='settings_applications' label='Config'/>
        <q-tab name='cloud' icon='cloud' label='Cloud'/>
        <q-tab name='general' icon='developer_board' label='General'/>
        <q-tab name='info' icon='analytics' label='Info'/>
        <q-tab name="others" icon="dashboard" label="Others"/>
      </q-tabs>
      <q-toolbar-title></q-toolbar-title>
      <CommandBar v-if='tab==="config"' :show-delete='false' @on-save='onSave' @on-restore='onRestore'></CommandBar>
    </q-toolbar>
  </div>

  <div class='q-pa-md q-gutter-sm' v-if='config&&tab==="config"'>
    <div class='row'>

      <div class='col-4'>
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>Device Config</label>
        </q-toolbar>
        <q-space style='margin-bottom: 2px;'/>
        <q-form id='frm1' class='q-pa-xs'>
          <q-input v-model.trim='device.device_name' filled dense label='Device Name' disable/>
          <q-space style='height: 10px;'/>
          <q-select emit-value map-options filled disable dense
                    v-model='device.device_type' :options='optDeviceTypes' label='Device Type'/>
        </q-form>

        <q-space style='height: 10px;'/>
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin:0 5px 0 5px;width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>General Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;'/>
        <q-form class='q-pa-xs' style='margin:0 5px 0 5px;'>
          <q-input v-model.trim='general.root_folder_path' filled dense label='Root Folder Path'/>
          <q-space style='height: 10px;'/>
          <q-input v-model.number='general.heartbeat_interval' filled dense label='Heartbeat Interval'/>
        </q-form>

        <q-space style='height: 10px;'/>
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin:0 5px 0 5px;width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>Database Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;'/>
        <q-form class='q-pa-xs' style='margin:0 5px 0 5px;'>
          <q-select emit-value map-options filled dense v-model='db.type' :options='dbTypes' label='Database'/>
          <q-space style='height: 10px;'/>
          <q-input v-model.trim='db.connection_string' filled dense label='Connection String'/>
        </q-form>

        <q-space style='height: 10px;'/>
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin:0 5px 0 5px;width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>UI Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;'/>
        <q-form class='q-pa-xs' style='margin:0 5px 0 5px;'>
          <q-input v-model.number='ui.gs_width' filled dense label='Grid Stack Width'/>
          <q-space style='height: 10px;'/>
          <q-input v-model.number='ui.gs_height' filled dense label='Grid Stack Height'/>
          <q-space style='height: 10px;'/>
          <q-input v-model.number='ui.booster_interval' filled dense label='Booster Interval'/>
          <q-space style='height: 10px;'/>
          <q-input v-model.number='ui.seek_to_live_edge_internal' filled dense label='Seek to Live Edge Internal'/>
        </q-form>

        <q-space style='height: 10px;'/>
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin:0 5px 0 5px;width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>Recurrent Jobs Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;'/>
        <q-form class='q-pa-xs' style='margin:0 5px 0 5px;'>
          <q-toggle v-model='jobs.mac_ip_matching_enabled' filled dense label='Mac IP Matching Enabled'/>
          <q-space style='height: 10px;'/>
          <q-input v-model.number='jobs.mac_ip_matching_interval' filled dense label='Mac IP Matching Interval'/>
        </q-form>
      </div>

      <div class='col-4'>
        <q-space style='margin: 2px;'/>
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin: 0 10px 0 10px; width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>Object Detector Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;'/>
        <q-form id='frm6' class='q-pa-xs'>
          <q-input v-model.number='onceDetector.imagehash_threshold' type='number' filled dense
                   label='Imagehash Threshold'/>
          <q-space style='height: 10px;'/>
          <q-input v-model.number='onceDetector.psnr_threshold' type='number' filled dense
                   label='Psnr Threshold'/>
          <q-space style='height: 10px;'/>
          <q-input v-model.number='onceDetector.ssim_threshold' type='number' filled dense
                   label='Ssim Threshold'/>
        </q-form>

        <q-space style='height: 10px;'/>
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin:0 5px 0 5px;width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>OpenCV Reader Config</label>
        </q-toolbar>
        <q-space style='height: 2px;'/>
        <q-form id='frm7' class='q-pa-xs' style='margin:0 5px 0 5px;'>
          <q-toggle v-model='sourceReader.resize_img' filled dense label='Resize Image'>
            <q-tooltip><strong>Be careful about it. It costs too much CPU time.</strong></q-tooltip>
          </q-toggle>
          <q-space style='height: 10px;'/>
          <q-input v-model.number='sourceReader.buffer_size' type='number' filled dense label='Buffer Size'/>
          <q-space style='height: 10px;'/>
          <q-input v-model.number='sourceReader.max_retry' type='number' filled dense label='Max Retry'/>
          <q-space style='height: 10px;'/>
          <q-input v-model.number='sourceReader.max_retry_in' type='number' filled dense label='Max RetryIn'/>
          <q-space style='height: 10px;'/>
        </q-form>

        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin: 0 10px 0 10px; width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>FFmpeg Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;'/>
        <q-form id='frm9' class='q-pa-xs'>
          <q-toggle v-model='ffmpeg.use_double_quotes_for_path' filled dense
                    label='Use double quotes on FFmpeg Commands'/>
          <q-space style='height: 10px;'/>
          <q-input v-model.number='ffmpeg.max_operation_retry_count' type='number' filled dense
                   label='Max retry count'/>
          <q-space style='height: 10px;'/>
          <q-input v-model.number='ffmpeg.rtmp_server_init_interval' type='number' filled dense
                   label='RTMP Service initialization Interval'/>
          <q-space style='height: 10px;'/>
          <q-input v-model.number='ffmpeg.watch_dog_interval' type='number' filled dense
                   label='Watchdog Interval'/>
          <q-space style='height: 10px;'/>
          <q-input v-model.number='ffmpeg.watch_dog_failed_wait_interval' type='number' filled dense
                   label='Watchdog on Fail Wait Internal'/>
          <q-space style='height: 10px;'/>
          <q-input v-model.number='ffmpeg.start_task_wait_for_interval' type='number' filled dense
                   label='Start Task Wait For Interval'/>
          <q-space style='height: 10px;'/>
          <q-input v-model.number='ffmpeg.record_concat_limit' type='number' filled dense
                   label='Recording Concat Limit'/>
          <q-space style='height: 10px;'/>
          <q-input v-model.number='ffmpeg.record_video_file_indexer_interval' type='number' filled dense
                   label='Recording Video File Indexer Interval'/>
        </q-form>

      </div>

      <div class='col-4'>

        <q-space style='margin: 2px;'/>
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin: 0 10px 0 10px; width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>AI Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;'/>
        <q-form id='frm14' class='q-pa-xs'>
          <q-toggle v-model='ai.overlay' filled dense label='Overlay Detected Object'/>
          <q-space style='height: 10px;'/>
          <q-input v-model.number='ai.video_clip_duration' filled dense label='Video Clip Duration'/>
          <q-space style='height: 10px;'/>
          <q-input v-model.number='ai.face_recog_mtcnn_threshold' filled dense label='Face Recognition MTCNN Threshold'/>
          <q-space style='height: 10px;'/>
          <q-input v-model.number='ai.face_recog_prob_threshold' filled dense label='Face Recognition Probability Threshold'/>
          <q-space style='height: 10px;'/>
          <q-input v-model.number='ai.plate_recog_instance_count' filled dense label='Automatic Plate Recognition Instance Count'/>
        </q-form>

        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin: 0 10px 0 10px; width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>PyTorch Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;'/>
        <q-form id='frm5' class='q-pa-xs' style='margin: 0 10px 0 10px'>
          <q-input v-model.trim='torch.model_name' filled dense label='Model Name'/>
          <q-space style='height: 10px;'/>
          <q-input v-model.trim='torch.model_name_specific' filled dense label='Model Specific Name'/>

        </q-form>
        <q-space style='margin: 2px;'/>
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin: 0 10px 0 10px; width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>Tensorflow Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;'/>
        <q-form id='frm10' class='q-pa-xs' style='margin: 0 10px 0 10px'>
          <q-input v-model='tf.model_name' filled dense label='Model Name'/>
          <q-space style='height: 10px;'/>
          <q-input v-model='tf.cache_folder' filled dense label='Cache Folder'/>
        </q-form>

        <q-space style='height: 10px;'/>
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin: 0 10px 0 10px;width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>Jetson Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;'/>
        <q-form id='frm4' class='q-pa-xs' style='margin: 0 10px 0 10px'>
          <q-input v-model.trim='jetson.model_name' filled dense label='Model Name'/>
        </q-form>

        <q-space style='height: 10px;'/>
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin: 0 10px 0 10px;width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>DeepStack Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;'/>
        <q-form id='frm15' class='q-pa-xs' style='margin: 0 10px 0 10px'>
          <q-input v-model.trim='deepstack.server_url' filled dense label='Server URL'/>
          <q-space style='height: 10px;'/>
          <q-input v-model.number='deepstack.server_port' filled dense label='Server Port'/>
          <q-space style='height: 10px;'/>
          <q-select emit-value map-options filled dense v-model='deepstack.performance_mode' :options='deepStackPerOpts'
                    label='Performance Mode'/>
          <q-space style='height: 10px;'/>
          <q-input type="password" v-model.trim='deepstack.api_key' filled dense label='Api Key'/>
          <q-space style='height: 10px;'/>
          <q-toggle v-model='deepstack.od_enabled' filled dense label='Object Detection Enabled'/>
          <q-space style='height: 10px;'/>
          <q-input v-model.number='deepstack.od_threshold' filled dense label='Object Detection Threshold'/>
          <q-space style='height: 10px;'/>
          <q-toggle v-model='deepstack.fr_enabled' filled dense label='Face Recognition Enabled'/>
          <q-space style='height: 10px;'/>
          <q-input v-model.number='deepstack.fr_threshold' filled dense label='Face Recognition Threshold'/>
          <q-space style='height: 10px;'/>
          <q-select emit-value map-options filled dense v-model='deepstack.docker_type' :options='deepStackDockerTypes'
                    label='Performance Mode'/>
        </q-form>

      </div>

    </div>
  </div>
  <div class='q-pa-md q-gutter-sm' v-if='config&&tab==="cloud"'>
    <Cloud/>
  </div>
  <div class='q-pa-md q-gutter-sm' v-if='config&&tab==="general"' style='margin-top: -45px;'>
    <q-space style='height: 10px;'/>
    <q-toolbar class='bg-yellow-14 text-black shadow-2 rounded-borders' style='margin:0 5px 0 5px;width: auto;'>
      <label style='text-transform: uppercase;font-size: medium'>Running Services</label>
    </q-toolbar>
    <q-form class='q-pa-xs' style='margin:0 5px 0 5px;'>
      <q-table :pagination='initialPagination' :rows='services' row-key='name' :columns='servicesColumns' color='yellow-14'>

        <template v-slot:body-cell-restart='props'>
          <q-td :props='props' v-if="props.row.instance_type===1">
              <q-btn color='primary' icon='restart_alt' @click='onRestartService(props.row)' :disable="!props.row.restart_button_enabled">
                <q-tooltip>Restart the Service</q-tooltip>
                <q-inner-loading :showing='restartLoading[props.row.name]' />
              </q-btn>
          </q-td>
        </template>

        <template v-slot:body-cell-start='props'>
          <q-td :props='props' v-if="props.row.instance_type===1">
            <q-btn color='secondary' icon='play_circle' @click='onStartService(props.row)' :disable="!props.row.start_button_enabled">
              <q-tooltip>Start the Service</q-tooltip>
              <q-inner-loading :showing='startLoading[props.row.name]' />
            </q-btn>
          </q-td>
        </template>

        <template v-slot:body-cell-stop='props'>
          <q-td :props='props' v-if="props.row.instance_type===1">
            <q-btn color='red' icon='stop_circle' @click='onStopService(props.row)' :disable="!props.row.stop_button_enabled">
              <q-tooltip>Stop the Service</q-tooltip>
              <q-inner-loading :showing='stopLoading[props.row.name]' />
            </q-btn>
          </q-td>
        </template>

      </q-table>
    </q-form>

    <q-space style='height: 10px;'/>
    <q-toolbar class='bg-teal text-white shadow-2 rounded-borders' style='margin:0 5px 0 5px;width: auto;'>
      <label style='text-transform: uppercase;font-size: medium'>Users</label>
    </q-toolbar>
    <q-form class='q-pa-xs' style='margin:0 5px 0 5px;'>
      <q-table :pagination='initialPagination' :rows='users' row-key='id' :columns='userColumns' color='teal'>
        <template v-slot:body-cell-delete='props'>
          <q-td :props='props'>
            <div>
              <q-btn round color='deep-orange' icon='delete' @click='onDeleteUser(props.row)'/>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-form>

    <q-space style='height: 10px;'/>
    <q-toolbar class='bg-brown-5 text-white shadow-2 rounded-borders' style='margin:0 5px 0 5px;width: auto;'>
      <label style='text-transform: uppercase;font-size: medium'>Scan Network for IP Cameras</label>
    </q-toolbar>
    <q-form class='q-pa-xs' style='margin:0 5px 0 5px;'>
      <q-input v-model='networkScanResults.created_at' filled readonly dense label='Last Scan At'/>
      <q-space style='height: 10px;'/>
      <q-btn icon='radar' label='Scan Network for IP Cameras' color='brown-5' @click='onScanNetwork' :disable='showScanLoading'>
        <q-inner-loading :showing='showScanLoading'/>
      </q-btn>
      <q-space style='height: 10px;'/>
      <q-table title='Network Scan Results' :rows='networkScanResults.results' :columns='networkColumns'
               row-key='address' :pagination='initialPagination' color='brown-5'/>
    </q-form>

    <q-space style='height: 10px;'/>
    <q-toolbar class='bg-light-blue-6 text-white shadow-2 rounded-borders' style='margin:0 5px 0 5px;width: auto;'>
      <label style='text-transform: uppercase;font-size: medium'>RTSP Templates</label>
    </q-toolbar>
    <q-form class='q-pa-xs' style='margin:0 5px 0 5px;'>
      <q-table :pagination='initialPagination' :rows='rtmpTemplates' row-key='id' :columns='rtmpTemplatesColumns' color='light-blue-6'/>
    </q-form>

  </div>
  <div class='q-pa-md q-gutter-sm' v-if='config&&tab==="info"'>
    <div class='row'>
      <q-toolbar class='bg-lime-6 text-white shadow-2 rounded-borders' style='margin-bottom: -12px;'>
        <q-tabs v-model='otherTabs' narrow-indicator inline-label align='left'>
          <q-tab name="gpu" icon="memory" label="GPU"/>
          <q-tab name='failedstreams' icon='sms_failed' label='Failed Streams'/>
          <q-tab name='recstucks' icon='radio_button_checked' label='Stuck Records'/>
          <q-tab name='ods' icon='collections' label='Object Detection Models'/>
          <q-tab name='various' icon='notes' label='Various Infos'/>
        </q-tabs>
      </q-toolbar>
      <div v-if='otherTabs==="gpu"' class='q-pa-md q-gutter-sm' style='margin-left: -22px;'>
        <GpuInfo/>
      </div>
      <div v-if='otherTabs==="failedstreams"' class='q-pa-md q-gutter-sm' style='margin-left: -22px;width: 100%;'>
        <q-table :pagination='initialPagination' :rows='failedStreams' row-key='id' :columns='failedStreamsColumns' color='lime-6'/>
      </div>
      <div v-if='otherTabs==="recstucks"' class='q-pa-md q-gutter-sm' style='margin-left: -22px;width: 100%;'>
        <q-table :pagination='initialPagination' :rows='recStucks' row-key='id' :columns='recStucksColumns' color='lime-6'/>
      </div>
      <div v-if='otherTabs==="ods"' class='q-pa-md q-gutter-sm' style='margin-left: -22px;width: 100%;'>
        <q-table :pagination='initialPagination' :rows='ods' row-key='id' :columns='odColumns' color='lime-6'/>
      </div>
      <div v-if='otherTabs==="various"' class='q-pa-md q-gutter-sm' style='margin-left: -22px;'>
        <table style='width: 500px;' class="bg-teal-1">
          <tr>
            <td>
              <q-input v-model='variousInfos.rtmp_port_counter' type='number' label='RTMP Counter' readonly/>
            </td>
          </tr>
          <tr>
            <td>
              <q-input v-model='variousInfos.ffmpeg_process_zombies.length' type='number' label='Total detected Zombie FFmpeg Processes' readonly/>
            </td>
          </tr>
        </table>
        <q-list bordered class='rounded-borders bg-teal-1'>
          <q-item-label header>Zombie RTMP Containers</q-item-label>
          <q-item clickable v-ripple v-for='zr in variousInfos.rtmp_container_zombies' :key='zr'>
            <q-item-section>
              <q-item-label caption lines='2'>
                {{ zr }}
              </q-item-label>
            </q-item-section>
            <q-separator inset='item'/>
          </q-item>
        </q-list>
      </div>
    </div>
  </div>

  <div class='q-pa-md q-gutter-sm' v-if='config&&tab==="others"'>
    <div class='row'>
      <div class='col-6'>
        <Dashboard/>
      </div>
      <div class='col-6'>
        <Hub/>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import {NodeService} from 'src/utils/services/node_service';
import {onBeforeUnmount, onMounted, ref} from 'vue';
import {
  Config, JetsonConfig, DeviceConfig, TorchConfig, OnceDetectorConfig, SourceReaderConfig,
  FFmpegConfig, TensorflowConfig, AiConfig, GeneralConfig, UiConfig, DbConfig, JobsConfig,
  DeepStackConfig
} from 'src/utils/models/config';
import {PublishService, SubscribeService} from 'src/utils/services/websocket_services';
import {NetworkDiscoveryModel, OnvifAction, OnvifEvent} from 'src/utils/models/onvif_models';
import {fixArrayDates, myDateToJsDate} from 'src/utils/utils';
import {WsConnection} from 'src/utils/ws/connection';
import {ServiceModel} from 'src/utils/models/service_model';
import {User} from 'src/utils/models/user_model';
import {useQuasar} from 'quasar';
import {NodeRepository} from 'src/utils/db';
import {Node} from 'src/utils/entities';
import CommandBar from 'src/components/CommandBar.vue';
import Dashboard from 'components/Dashboard.vue';
import Hub from 'components/Hub.vue';
import GpuInfo from 'components/GpuInfo.vue';
import {FailedStreamModel, RecStuckModel, RtspTemplateModel, VariousInfos} from 'src/utils/models/others_models';
import {OdModel} from 'src/utils/models/od_model';
import Cloud from 'components/Cloud.vue';
import {SelectOption} from 'src/utils/services/local_service';

export default {
  name: 'NodeConfig',
  components: {Cloud, CommandBar, Dashboard, Hub, GpuInfo},
  setup() {
    const $q = useQuasar();
    const nodeService = new NodeService();
    const publishService = new PublishService();
    const config = ref<Config>();
    const device = ref<DeviceConfig>();
    const general = ref<GeneralConfig>();
    const db = ref<DbConfig>();
    const dbTypes = ref(nodeService.LocalService.createDbTypes());


    const optDeviceTypes = ref(getDeviceTypes());
    const onceDetector = ref<OnceDetectorConfig>();
    const sourceReader = ref<SourceReaderConfig>();
    const ffmpeg = ref<FFmpegConfig>();
    const ai = ref<AiConfig>();
    const ui = ref<UiConfig>();
    const jobs = ref<JobsConfig>();
    const deepstack = ref<DeepStackConfig>();
    const deepStackPerOpts = ref<SelectOption[]>(nodeService.LocalService.createDeepStackPerformanceModes());
    const deepStackDockerTypes = ref<SelectOption[]>(nodeService.LocalService.createDeepStackDockerTypes());

    //jetson
    const jetson = ref<JetsonConfig>();
    const jetsonFilter = ref<string>();

    //torch
    const torch = ref<TorchConfig>();
    const tf = ref<TensorflowConfig>();
    const torchFilter = ref<string>();
    const tfFilter = ref<string>();

    const showScanLoading = ref<boolean>(false);
    const networkScanResults = ref<NetworkDiscoveryModel>({});
    let connOnvif: WsConnection | null = null;

    const currentNode = ref<Node>(nodeService.LocalService.createEmptyNode());

    const services = ref<ServiceModel[]>([]);
    const restartLoading = ref<any>({});
    const startLoading = ref<any>({});
    const stopLoading = ref<any>({});
    const users = ref<User[]>([]);
    const rtmpTemplates = ref<RtspTemplateModel[]>([]);

    const failedStreams = ref<FailedStreamModel[]>([]);
    const recStucks = ref<RecStuckModel[]>([]);
    const variousInfos = ref<VariousInfos>({rtmp_port_counter: 0, rtmp_container_zombies: [], ffmpeg_process_zombies: []});
    const ods = ref<OdModel[]>([]);

    const setConfigValue = (c: Config) => {
      device.value = c.device;
      onceDetector.value = c.once_detector;
      sourceReader.value = c.source_reader;
      general.value = c.general;
      db.value = c.db;
      ffmpeg.value = c.ffmpeg;
      torch.value = c.torch;
      tf.value = c.tensorflow;
      jetson.value = c.jetson;
      ai.value = c.ai;
      ui.value = c.ui;
      jobs.value = c.jobs;
      deepstack.value = c.deep_stack;
    };

    const serviceDataBind = async () => {
      const svcs = await nodeService.getServices();
      for (const svc of svcs){
        restartLoading.value[svc.name] = false;
      }
      fixArrayDates(svcs, 'created_at', 'heartbeat');
      services.value = svcs;
    };

    const userDataBind = async () => {
      const usrs = await nodeService.getUsers();
      fixArrayDates(usrs, 'last_login_at');
      users.value = usrs;
    };

    onMounted(async () => {
      const nodeIp = await nodeService.LocalService.getNodeIP();
      const nodePort = await nodeService.LocalService.getNodePort();
      const subscribeService = new SubscribeService(nodeIp, nodePort);

      const an = await new NodeRepository().getActiveNode();
      if (an) {
        currentNode.value = an;
      }
      config.value = await nodeService.getConfig();
      setConfigValue(config.value);
      const on = await nodeService.getOnvifNetwork();
      if (on) {
        networkScanResults.value = on;
        networkScanResults.value.created_at = myDateToJsDate(<string>networkScanResults.value.created_at).toLocaleString();
      }

      await serviceDataBind();
      await userDataBind();

      rtmpTemplates.value = await nodeService.getRtspTemplates();

      failedStreams.value = await nodeService.getFailedStreams();
      fixArrayDates(failedStreams.value, 'last_check_at');

      recStucks.value = await nodeService.getRecStucks();
      fixArrayDates(recStucks.value, 'last_check_at');

      variousInfos.value = await nodeService.getVariousInfos();

      ods.value = await nodeService.getOds();
      fixArrayDates(ods.value, 'created_at');

      connOnvif = subscribeService.subscribeOnvif((event: MessageEvent) => {
        const result: OnvifEvent = JSON.parse(event.data);
        if (result.type === OnvifAction.NetworkDiscovery) {
          networkScanResults.value.results = JSON.parse(atob(result.base64_model));
          showScanLoading.value = false;
        }
      });
    });
    onBeforeUnmount(() => {
      if (connOnvif) {
        connOnvif.close();
      }
    });

    const onSave = async () => {
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
      try{
        await nodeService.restartService(service);
      }finally {
        restartLoading.value[service.name] = false;
      }
      await serviceDataBind();
    };

    const onStartService = async (service: ServiceModel) => {
      startLoading.value[service.name] = true;
      try{
        await nodeService.startService(service);
      }finally {
        startLoading.value[service.name] = false;
      }
      await serviceDataBind();
    };

    const onStopService = async (service: ServiceModel) => {
      stopLoading.value[service.name] = true;
      try{
        await nodeService.stopService(service);
      }finally {
        stopLoading.value[service.name] = false;
      }
      await serviceDataBind();
    };

    return {
      config, device, optDeviceTypes, onceDetector, sourceReader,
      jetson, jetsonFilter, ffmpeg, tf, ai, general, ui, jobs, db, dbTypes, deepstack,
      torch, torchFilter, tfFilter, showScanLoading, users, restartLoading, startLoading, stopLoading,
      deepStackPerOpts, deepStackDockerTypes,
      currentNode, tab: ref<string>('config'),
      imageExtensions: ['jpg', 'jpeg', 'png', 'bmp', 'gif'],
      onSave, onRestore, onScanNetwork: function () {
        void publishService.publishOnvif({}, OnvifAction.NetworkDiscovery);
        showScanLoading.value = true;
      },
      networkScanResults, services,
      networkColumns: createNetworkColumns(),
      initialPagination: {
        rowsPerPage: 10
      },
      servicesColumns: createServiceColumns(),
      userColumns: createUserColumns(),
      onDeleteUser(user: User) {
        $q.dialog({
          title: 'Confirm',
          message: 'Are you sure you want to delete this user?',
          cancel: true,
          persistent: false
        }).onOk(() => {
          void onDoDeleteUser(user);
        });
      },
      rtmpTemplates, rtmpTemplatesColumns: createRtmpTemplatesColumns(),
      otherTabs: ref<string>('gpu'),
      failedStreams, failedStreamsColumns: createFailedStreamsColumns(),
      recStucks, recStucksColumns: createRecStucksColumns(),
      variousInfos,
      ods, odColumns: createOdColumns(),
      onRestartService, onStartService, onStopService
    };
  }
};

function getDeviceTypes() {
  return [{value: 0, label: 'PC'}, {value: 1, label: 'IoT'}];
}

function createNetworkColumns() {
  const align = 'left';
  return [
    {name: 'address', align, label: 'Address', field: 'address', sortable: true},
    {name: 'route', align, label: 'Route', field: 'route', format: (val: any) => `${val.join(' ')}`, sortable: true},
    {name: 'port', align, label: 'port', field: 'port', sortable: true},
    {name: 'device', align, label: 'Device', field: 'device', sortable: true},
    {name: 'username', align, label: 'User Name', field: 'username', sortable: true},
    {name: 'password', align, label: 'Password', field: 'password', sortable: true},
    {name: 'credentials_found', align, label: 'Credentials Found', field: 'credentials_found', sortable: true},
    {name: 'route_found', align, label: 'Route Found', field: 'route_found', sortable: true},
    {name: 'available', align, label: 'Available', field: 'available', sortable: true},
    {name: 'authentication_type', align, label: 'Authentication Type', field: 'authentication_type', sortable: true}
  ];
}

function createServiceColumns() {
  return [
    {name: 'restart', align: 'center', label: '', field: 'restart'},
    {name: 'start', align: 'center', label: '', field: 'start'},
    {name: 'stop', align: 'center', label: '', field: 'stop'},
    {name: 'description', align: 'left', label: 'Description', field: 'description', sortable: true},
    {name: 'platform', align: 'left', label: 'Platform', field: 'platform', sortable: true},
    {name: 'created_at', align: 'left', label: 'Created At', field: 'created_at', format: (val: any) => `${val.toLocaleString()}`, sortable: true},
    {name: 'heartbeat', align: 'left', label: 'Heartbeat', field: 'heartbeat', format: (val: any) => `${val.toLocaleString()}`, sortable: true},
    {name: 'platform_version', align: 'left', label: 'Platform Version', field: 'platform_version', sortable: true},
    {name: 'instance_type', align: 'left', label: 'Instance Type', field: 'instance_type',
      format: (val: number) => val === 1 ? 'Docker Container' : 'Systemd', sortable: true},
    {name: 'hostname', align: 'left', label: 'Hostname', field: 'hostname', sortable: true},
    {name: 'ip_address', align: 'left', label: 'Ip Address', field: 'ip_address', sortable: true},
    {name: 'mac_address', align: 'left', label: 'Mac Address', field: 'mac_address', sortable: true},
    {name: 'processor', align: 'left', label: 'Processor', field: 'processor', sortable: true},
    {name: 'cpu_count', align: 'left', label: 'Cpu Count', field: 'cpu_count', sortable: true},
    {name: 'ram', align: 'left', label: 'Memory', field: 'ram', sortable: true},
    {name: 'pid', align: 'left', label: 'PID', field: 'pid', sortable: true},
    {name: 'name', align: 'left', label: 'Name', field: 'name', sortable: true},
    {name: 'instance_name', align: 'left', label: 'Instance Name', field: 'instance_name', sortable: true}
  ];
}

function createUserColumns() {
  const align = 'left';
  return [
    {name: 'username', align, label: 'User Name', field: 'username', sortable: true},
    {name: 'email', align, label: 'Email', field: 'email', sortable: true},
    {name: 'last_login_at', align, label: 'Last Login At', field: 'last_login_at', format: (val: any) => `${val.toLocaleString()}`, sortable: true},
    {name: 'delete', align: 'center', label: 'Delete', field: 'delete'}
  ];
}

function createRtmpTemplatesColumns() {
  const align = 'left';
  return [
    {name: 'name', align, label: 'Name', field: 'name', sortable: true},
    {name: 'description', align, label: 'Description', field: 'description', sortable: true},
    {name: 'brand', align, label: 'Brand', field: 'brand', sortable: true},
    {name: 'default_user', align, label: 'Default User', field: 'default_user', sortable: true},
    {name: 'default_password', align, label: 'DefaultPassword', field: 'default_password', sortable: true},
    {name: 'default_port', align, label: 'Default Port', field: 'default_port', sortable: true},
    {name: 'address', align, label: 'Address', field: 'address', sortable: true},
    {name: 'route', align, label: 'Route', field: 'route', sortable: true},
    {name: 'templates', align, label: 'Templates', field: 'templates', sortable: true}
  ];
}

function createFailedStreamsColumns() {
  const align = 'left';
  return [
    {name: 'brand', align, label: 'Brand', field: 'brand', sortable: true},
    {name: 'name', align, label: 'Name', field: 'name', sortable: true},
    {name: 'address', align, label: 'Address', field: 'address', sortable: true},

    {name: 'rtmp_container_failed_count', align, label: 'RTMP Container Failed Count', field: 'rtmp_container_failed_count', sortable: true},
    {name: 'rtmp_feeder_failed_count', align, label: 'RTMP Feeder Failed Count', field: 'rtmp_feeder_failed_count', sortable: true},
    {name: 'hls_failed_count', align, label: 'HLS Failed Count', field: 'hls_failed_count', sortable: true},
    {name: 'ffmpeg_reader_failed_count', align, label: 'FFmpeg Reader Failed Count', field: 'ffmpeg_reader_failed_count', sortable: true},
    {name: 'record_failed_count', align, label: 'Record Failed Count', field: 'record_failed_count', sortable: true},
    {name: 'snapshot_failed_count', align, label: 'Snapshot Failed Count', field: 'snapshot_failed_count', sortable: true},
    {name: 'record_stuck_process_count', align, label: 'Record Stuck Process Count', field: 'record_stuck_process_count', sortable: true},
    {name: 'last_check_at', align, label: 'Last Check At', field: 'last_check_at', format: (val: any) => `${val.toLocaleString()}`, sortable: true}
  ];
}

function createRecStucksColumns() {
  const align = 'left';
  return [
    {name: 'name', align, label: 'Name', field: 'name', sortable: true},
    {name: 'brand', align, label: 'Brand', field: 'brand', sortable: true},
    {name: 'address', align, label: 'Address', field: 'address', sortable: true},

    {name: 'record_segment_interval', align, label: 'Record Segment Interval', field: 'record_segment_interval', sortable: true},
    {name: 'record_output_dir', align, label: 'Record Output Dir', field: 'record_output_dir', sortable: true},
    {name: 'file_ext', align, label: 'File Extension', field: 'file_ext', sortable: true},
    {name: 'last_modified_file', align, label: 'Last Modified File', field: 'last_modified_file', sortable: true},
    {name: 'last_modified_size', align, label: 'Last Modified Size', field: 'last_modified_size', sortable: true},
    {name: 'failed_count', align, label: 'Failed Count', field: 'failed_count', sortable: true},
    {name: 'failed_modified_file', align, label: 'Failed Modified File', field: 'failed_modified_file', sortable: true},
    {name: 'last_check_at', align, label: 'Last Check At', field: 'last_check_at', format: (val: any) => `${val.toLocaleString()}`, sortable: true}
  ];
}

function createOdColumns() {
  const align = 'left';
  const style = 'max-width:200px;white-space: nowrap;overflow: hidden !important;text-overflow: ellipsis;';
  return [
    {name: 'brand', align, label: 'Brand', field: 'brand', sortable: true},
    {name: 'name', align, label: 'Name', field: 'name', sortable: true},
    {name: 'address', align, label: 'Address', field: 'address', sortable: true},

    {name: 'created_at', align, label: 'Created At', field: 'created_at', format: (val: any) => `${val.toLocaleString()}`, sortable: true},

    {name: 'threshold_list', align, label: 'Threshold List', field: 'threshold_list', sortable: true, style},
    {name: 'selected_list', align, label: 'Selected List', field: 'selected_list', sortable: true, style},
    {name: 'zones_list', align, label: 'Zones List', field: 'zones_list', sortable: true},
    {name: 'masks_list', align, label: 'Masks List', field: 'masks_list', sortable: true},
    {name: 'start_time', align, label: 'Start Time', field: 'start_time', sortable: true},
    {name: 'end_time', align, label: 'End Time', field: 'end_time', sortable: true}
  ];
}

</script>

<style scoped>

</style>

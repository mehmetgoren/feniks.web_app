<template>
  <div class='q-pa-md q-gutter-sm' style='margin-bottom: -35px;'>
    <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='width: 99.5%'>
      <q-icon name='important_devices' size='28px' />
      <label style='text-transform: uppercase;font-size: medium;'> {{ currentNode.name }}</label>
      <q-tabs v-model='tab' narrow-indicator inline-label align='left'>
        <q-tab name='config' icon='settings_applications' label='Config' />
        <q-tab name='general' icon='developer_board' label='General' />
        <q-tab name='info' icon='analytics' label='Info' />
      </q-tabs>
      <q-toolbar-title></q-toolbar-title>
      <CommandBar v-if='tab==="config"' :show-delete='false' @on-save='onSave' @on-restore='onRestore' />
    </q-toolbar>
  </div>

  <div class='q-pa-md q-gutter-sm' v-if='config&&tab==="config"'>
    <div class='row'>

      <div class='col-4'>
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>Device Config</label>
        </q-toolbar>
        <q-space style='margin-bottom: 2px;' />
        <q-form id='frm1' class='q-pa-xs'>
          <q-input v-model.trim='device.device_name' filled dense label='Device Name' disable />
          <q-space style='height: 10px;' />
          <q-select emit-value map-options filled disable dense='dense'
                    v-model='device.device_type' :options='optDeviceTypes' label='Device Type' />
          <q-space style='height: 10px;' />
          <q-select filled v-model='modelMultiple' multiple :options='optServices'
                    dense='dense'
                    use-chips stack-label label='Running Services' disable />
        </q-form>

        <q-space style='height: 10px;' />
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>Redis Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;' />
        <q-form id='frm8' class='q-pa-xs'>
          <q-input v-model.trim='redis.host' filled dense label='Host' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='redis.port' type='number' filled dense label='Port' />
        </q-form>
        <q-space style='height: 10px;' />

        <q-space style='height: 10px;' />
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin:0 5px 0 5px;width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>General Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;' />
        <q-form class='q-pa-xs' style='margin:0 5px 0 5px;'>
          <q-input v-model.trim='general.root_folder_path' filled dense label='Root Folder Path' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='general.heartbeat_interval' filled dense label='Heartbeat Interval' />
        </q-form>

        <q-space style='height: 10px;' />
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin:0 5px 0 5px;width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>UI Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;' />
        <q-form class='q-pa-xs' style='margin:0 5px 0 5px;'>
          <q-input v-model.number='ui.gs_width' filled dense label='Grid Stack Width' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='ui.gs_height' filled dense label='Grid Stack Height' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='ui.booster_interval' filled dense label='Booster Interval' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='ui.seek_to_live_edge_internal' filled dense label='Seek to Live Edge Internal' />
        </q-form>
      </div>

      <div class='col-4'>
        <q-space style='margin: 2px;' />
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin: 0 10px 0 10px; width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>Object Detector Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;' />
        <q-form id='frm6' class='q-pa-xs'>
          <q-input v-model.number='onceDetector.imagehash_threshold' type='number' filled dense
                   label='Imagehash Threshold' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='onceDetector.psnr_threshold' type='number' filled dense
                   label='Psnr Threshold' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='onceDetector.ssim_threshold' type='number' filled dense
                   label='Ssim Threshold' />
        </q-form>

        <q-space style='height: 10px;' />
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin:0 5px 0 5px;width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>OpenCV Reader Config</label>
        </q-toolbar>
        <q-space style='height: 2px;' />
        <q-form id='frm7' class='q-pa-xs' style='margin:0 5px 0 5px;'>
          <q-input v-model.number='sourceReader.buffer_size' type='number' filled dense label='Buffer Size' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='sourceReader.fps' type='number' filled dense label='Fps' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='sourceReader.max_retry' type='number' filled dense label='Max Retry' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='sourceReader.max_retry_in' type='number' filled dense label='Max RetryIn' />
          <q-space style='height: 10px;' />
        </q-form>

        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin: 0 10px 0 10px; width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>FFmpeg Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;' />
        <q-form id='frm9' class='q-pa-xs'>
          <q-toggle v-model='ffmpeg.use_double_quotes_for_path' filled dense
                    label='Use double quotes on FFmpeg Commands' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='ffmpeg.max_operation_retry_count' type='number' filled dense
                   label='Max retry count' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='ffmpeg.rtmp_server_init_interval' type='number' filled dense
                   label='RTMP Service initialization Interval' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='ffmpeg.watch_dog_interval' type='number' filled dense
                   label='Watchdog Interval' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='ffmpeg.watch_dog_failed_wait_interval' type='number' filled dense
                   label='Watchdog on Fail Wait Internal' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='ffmpeg.start_task_wait_for_interval' type='number' filled dense
                   label='Start Task Wait For Interval' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='ffmpeg.record_concat_limit' type='number' filled dense
                   label='Recording Concat Limit' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='ffmpeg.record_video_file_indexer_interval' type='number' filled dense
                   label='Recording Video File Indexer Interval' />
        </q-form>

      </div>

      <div class='col-4'>

        <q-space style='margin: 2px;' />
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin: 0 10px 0 10px; width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>AI Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;' />
        <q-form id='frm14' class='q-pa-xs'>
          <q-toggle v-model='ai.overlay' filled dense label='Overlay Detected Object' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='ai.video_clip_duration' filled dense label='Video Clip Duration' />
          <q-input v-model.number='ai.face_recog_mtcnn_threshold' filled dense label='Face Recognition MTCNN Threshold' />
          <q-input v-model.number='ai.face_recog_prob_threshold' filled dense label='Face Recognition Probability Threshold' />
          <q-input v-model.number='ai.plate_recog_instance_count' filled dense label='Automatic Plate Recognition Instance Count' />
        </q-form>

        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin: 0 10px 0 10px; width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>PyTorch Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;' />
        <q-form id='frm5' class='q-pa-xs' style='margin: 0 10px 0 10px'>
          <q-input v-model.trim='torch.model_name' filled dense label='Model Name' />
          <q-space style='height: 10px;' />
          <q-input v-model.trim='torch.model_name_specific' filled dense label='Model Specific Name' />

        </q-form>
        <q-space style='margin: 2px;' />
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin: 0 10px 0 10px; width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>Tensorflow Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;' />
        <q-form id='frm10' class='q-pa-xs' style='margin: 0 10px 0 10px'>
          <q-input v-model='tf.model_name' filled dense label='Model Name' />
          <q-space style='height: 10px;' />
          <q-input v-model='tf.cache_folder' filled dense label='Cache Folder' />
        </q-form>

        <q-space style='height: 10px;' />
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin: 0 10px 0 10px;width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>Jetson Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;' />
        <q-form id='frm4' class='q-pa-xs' style='margin: 0 10px 0 10px'>
          <q-input v-model.trim='jetson.model_name' filled dense label='Model Name' />
        </q-form>

      </div>

    </div>
  </div>
  <div class='q-pa-md q-gutter-sm' v-if='config&&tab==="general"' style='margin-top: -45px;'>
    <q-space style='height: 10px;' />
    <q-toolbar class='bg-brown-5 text-white shadow-2 rounded-borders' style='margin:0 5px 0 5px;width: auto;'>
      <label style='text-transform: uppercase;font-size: medium'>Scan Network for IP Cameras</label>
    </q-toolbar>
    <q-form class='q-pa-xs' style='margin:0 5px 0 5px;'>
      <q-input v-model='networkScanResults.created_at' filled readonly dense label='Last Scan At' />
      <q-space style='height: 10px;' />
      <q-btn icon='radar' label='Scan Network for IP Cameras' color='brown-5' @click='onScanNetwork' :disable='showScanLoading'>
        <q-inner-loading :showing='showScanLoading' />
      </q-btn>
      <q-space style='height: 10px;' />
      <q-table title='Network Scan Results' :rows='networkScanResults.results' :columns='networkColumns'
               row-key='address' :pagination='initialPagination' color='brown-5' />
    </q-form>

    <q-space style='height: 10px;' />
    <q-toolbar class='bg-yellow-14 text-black shadow-2 rounded-borders' style='margin:0 5px 0 5px;width: auto;'>
      <label style='text-transform: uppercase;font-size: medium'>Node Running Services</label>
    </q-toolbar>
    <q-form class='q-pa-xs' style='margin:0 5px 0 5px;'>
      <q-table :pagination='initialPagination' :rows='services' row-key='name' :columns='servicesColumns' color='yellow-14' />
    </q-form>

    <q-space style='height: 10px;' />
    <q-toolbar class='bg-teal text-white shadow-2 rounded-borders' style='margin:0 5px 0 5px;width: auto;'>
      <label style='text-transform: uppercase;font-size: medium'>Node Users</label>
    </q-toolbar>
    <q-form class='q-pa-xs' style='margin:0 5px 0 5px;'>
      <q-table :pagination='initialPagination' :rows='users' row-key='id' :columns='userColumns' color='teal'>
        <template v-slot:body-cell-delete='props'>
          <q-td :props='props'>
            <div>
              <q-btn round color='deep-orange' icon='delete' @click='onDeleteUser(props.row)' />
            </div>
          </q-td>
        </template>
      </q-table>
    </q-form>

    <q-space style='height: 10px;' />
    <q-toolbar class='bg-light-blue-6 text-white shadow-2 rounded-borders' style='margin:0 5px 0 5px;width: auto;'>
      <label style='text-transform: uppercase;font-size: medium'>RTSP Templates</label>
    </q-toolbar>
    <q-form class='q-pa-xs' style='margin:0 5px 0 5px;'>
      <q-table :pagination='initialPagination' :rows='rtmpTemplates' row-key='id' :columns='rtmpTemplatesColumns' color='light-blue-6'/>
    </q-form>

  </div>
  <div class='q-pa-md q-gutter-sm' v-if='config&&tab==="info"'>
    <div class='row'>
      <div class='col-6'>
        <Dashboard />
      </div>
      <div class='col-6'>
        <Hub />
      </div>
    </div>
    <div class='row'>
      <q-toolbar class='bg-lime-6 text-white shadow-2 rounded-borders' style='margin-bottom: -12px;' >
        <q-tabs v-model='otherTabs' narrow-indicator inline-label align='left'>
          <q-tab name='failedstreams' icon='sms_failed' label='Failed Streams' />
          <q-tab name='recstucks' icon='radio_button_checked' label='Stuck Records' />
        </q-tabs>
      </q-toolbar>
      <div class='q-pa-md q-gutter-sm' v-if='otherTabs==="failedstreams"'>
        <q-table :pagination='initialPagination' :rows='failedStreams' row-key='id' :columns='failedStreamsColumns' color='lime-6'/>
      </div>
      <div class='q-pa-md q-gutter-sm' v-if='otherTabs==="recstucks"'>
        <q-table :pagination='initialPagination' :rows='recStucks' row-key='id' :columns='recStucksColumns' color='lime-6'/>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { NodeService } from 'src/utils/services/node_service';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import {
  Config, JetsonConfig, DeviceConfig, TorchConfig, OnceDetectorConfig, SourceReaderConfig, RedisConfig,
  FFmpegConfig, TensorflowConfig, AiConfig, GeneralConfig, UiConfig
} from 'src/utils/models/config';
import { List } from 'linqts';
import { PublishService, SubscribeService } from 'src/utils/services/websocket_services';
import { NetworkDiscoveryModel, OnvifAction, OnvifEvent } from 'src/utils/models/onvif_models';
import { fixArrayDates, myDateToJsDate } from 'src/utils/utils';
import { WsConnection } from 'src/utils/ws/connection';
import { ServiceModel } from 'src/utils/models/service_model';
import { User } from 'src/utils/models/user_model';
import { useQuasar } from 'quasar';
import { NodeRepository } from 'src/utils/db';
import { Node } from 'src/utils/entities';
import CommandBar from 'src/components/CommandBar.vue';
import Dashboard from 'components/Dashboard.vue';
import Hub from 'components/Hub.vue';
import { FailedStreamModel, RecStuckModel, RtspTemplateModel } from 'src/utils/models/others_models';

export default {
  name: 'NodeConfig',
  components: { CommandBar, Dashboard, Hub },
  setup() {
    const $q = useQuasar();
    const nodeService = new NodeService();
    const publishService = new PublishService();
    const config = ref<Config>();
    const device = ref<DeviceConfig>();
    const general = ref<GeneralConfig>();

    const modelMultiple = ref();
    const optServices = ref();
    const optDeviceTypes = ref(getDeviceTypes());
    const onceDetector = ref<OnceDetectorConfig>();
    const sourceReader = ref<SourceReaderConfig>();
    const redis = ref<RedisConfig>();
    const ffmpeg = ref<FFmpegConfig>();
    const ai = ref<AiConfig>();
    const ui = ref<UiConfig>();

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
    const users = ref<User[]>([]);
    const rtmpTemplates = ref<RtspTemplateModel[]>([]);

    const failedStreams = ref<FailedStreamModel[]>([]);
    const recStucks = ref<RecStuckModel[]>([]);

    const setConfigValue = (c: Config) => {
      device.value = c.device;
      onceDetector.value = c.once_detector;
      sourceReader.value = c.source_reader;
      redis.value = c.redis;
      general.value = c.general;
      ffmpeg.value = c.ffmpeg;
      torch.value = c.torch;
      tf.value = c.tensorflow;
      jetson.value = c.jetson;
      ai.value = c.ai;
      ui.value = c.ui;
    };

    const dataBind = async () => {
      const svcs = await nodeService.getServices();
      fixArrayDates(svcs, 'created_at', 'heartbeat');
      services.value = svcs;
      const usrs = await nodeService.getUsers();
      fixArrayDates(usrs, 'last_login_at');
      users.value = usrs;
    };

    onMounted(async () => {
      const nodeIp = await nodeService.LocalService.getNodeIP();
      const subscribeService = new SubscribeService(nodeIp);

      const an = await new NodeRepository().getActiveNode();
      if (an) {
        currentNode.value = an;
      }
      config.value = await nodeService.getConfig();
      const deviceServices = getDeviceServices(config.value);
      modelMultiple.value = deviceServices;
      optServices.value = deviceServices;
      setConfigValue(config.value);
      networkScanResults.value = await nodeService.getOnvifNetwork();
      networkScanResults.value.created_at = myDateToJsDate(<string>networkScanResults.value.created_at).toLocaleString();

      await dataBind();

      rtmpTemplates.value = await nodeService.getRtspTemplates();

      failedStreams.value = await nodeService.getFailedStreams();
      fixArrayDates(failedStreams.value, 'last_check_at');

      recStucks.value = await nodeService.getRecStucks();
      fixArrayDates(recStucks.value, 'last_check_at');

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
    };

    const onRestore = async () => {
      config.value = await nodeService.restoreConfig();
      setConfigValue(config.value);
    };

    const onDelete = async (user: User) => {
      await nodeService.deleteUser(user.id);
      await dataBind();
    };


    return {
      config, device, optDeviceTypes, onceDetector, sourceReader, redis,
      jetson, jetsonFilter, ffmpeg, tf, ai, general, ui,
      torch, torchFilter, tfFilter, showScanLoading, users,
      modelMultiple, optServices, currentNode, tab: ref<string>('config'),
      imageExtensions: ['jpg', 'jpeg', 'png', 'bmp', 'gif'],
      onSave, onRestore, onScanNetwork: function() {
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
          void onDelete(user);
        });
      },
      rtmpTemplates, rtmpTemplatesColumns:createRtmpTemplatesColumns(),
      otherTabs:ref<string>('failedstreams'),
      failedStreams, failedStreamsColumns: createFailedStreamsColumns(),
      recStucks, recStucksColumns:createRecStucksColumns()
    };
  }
};

function getDeviceServices(config: Config | any): any[] {
  const all =
    new List([{ value: 1, label: 'Stream-Reading' }, { value: 2, label: 'Detection' }, {
      value: 4,
      label: 'Cloud Integration'
    }]);
  const selected = [];
  for (const serviceNo of config.device.device_services) {
    const item = all.FirstOrDefault(x => x?.value == serviceNo);
    if (item) {
      selected.push(item);
    }
  }
  return selected;
}

function getDeviceTypes() {
  return [{ value: 0, label: 'PC' }, { value: 1, label: 'IoT' }];
}

function createNetworkColumns() {
  const align = 'left';
  return [
    { name: 'address', align, label: 'Address', field: 'address', sortable: true },
    { name: 'route', align, label: 'Route', field: 'route', format: (val: any) => `${val.join(' ')}`, sortable: true },
    { name: 'port', align, label: 'port', field: 'port', sortable: true },
    { name: 'device', align, label: 'Device', field: 'device', sortable: true },
    { name: 'username', align, label: 'User Name', field: 'username', sortable: true },
    { name: 'password', align, label: 'Password', field: 'password', sortable: true },
    { name: 'credentials_found', align, label: 'Credentials Found', field: 'credentials_found', sortable: true },
    { name: 'route_found', align, label: 'Route Found', field: 'route_found', sortable: true },
    { name: 'available', align, label: 'Available', field: 'available', sortable: true },
    { name: 'authentication_type', align, label: 'Authentication Type', field: 'authentication_type', sortable: true }
  ];
}

function createServiceColumns() {
  return [
    { name: 'name', align: 'left', label: 'Name', field: 'name', sortable: true },
    { name: 'description', align: 'left', label: 'Description', field: 'description', sortable: true },
    { name: 'platform', align: 'left', label: 'Platform', field: 'platform', sortable: true },
    { name: 'platform_version', align: 'left', label: 'Platform Version', field: 'platform_version', sortable: true },
    { name: 'hostname', align: 'left', label: 'Hostname', field: 'hostname', sortable: true },
    { name: 'ip_address', align: 'left', label: 'Ip Address', field: 'ip_address', sortable: true },
    { name: 'mac_address', align: 'left', label: 'Mac Address', field: 'mac_address', sortable: true },
    { name: 'processor', align: 'left', label: 'Processor', field: 'processor', sortable: true },
    { name: 'cpu_count', align: 'left', label: 'Cpu Count', field: 'cpu_count', sortable: true },
    { name: 'ram', align: 'left', label: 'Memory', field: 'ram', sortable: true },
    { name: 'pid', align: 'left', label: 'PID', field: 'pid', sortable: true },
    { name: 'created_at', align: 'left', label: 'Created At', field: 'created_at', format: (val: any) => `${val.toLocaleString()}`, sortable: true },
    { name: 'heartbeat', align: 'left', label: 'Heartbeat', field: 'heartbeat', format: (val: any) => `${val.toLocaleString()}`, sortable: true }
  ];
}

function createUserColumns() {
  const align = 'left';
  return [
    { name: 'username', align, label: 'User Name', field: 'username', sortable: true },
    { name: 'email', align, label: 'Email', field: 'email', sortable: true },
    { name: 'last_login_at', align, label: 'Last Login At', field: 'last_login_at', format: (val: any) => `${val.toLocaleString()}`, sortable: true },
    { name: 'delete', align: 'center', label: 'Delete', field: 'delete' }
  ];
}

function createRtmpTemplatesColumns() {
  const align = 'left';
  return [
    { name: 'name', align, label: 'Name', field: 'name', sortable: true },
    { name: 'description', align, label: 'Description', field: 'description', sortable: true },
    { name: 'brand', align, label: 'Brand', field: 'brand', sortable: true },
    { name: 'default_user', align, label: 'Default User', field: 'default_user', sortable: true },
    { name: 'default_password', align, label: 'DefaultPassword', field: 'default_password', sortable: true },
    { name: 'default_port', align, label: 'Default Port', field: 'default_port', sortable: true },
    { name: 'address', align, label: 'Address', field: 'address', sortable: true },
    { name: 'route', align, label: 'Route', field: 'route', sortable: true },
    { name: 'templates', align, label: 'Templates', field: 'templates', sortable: true }
  ];
}

function createFailedStreamsColumns() {
  const align = 'left';
  return [
    { name: 'brand', align, label: 'Brand', field: 'brand', sortable: true },
    { name: 'name', align, label: 'Name', field: 'name', sortable: true },
    { name: 'address', align, label: 'Address', field: 'address', sortable: true },

    { name: 'rtmp_container_failed_count', align, label: 'RTMP Container Failed Count', field: 'rtmp_container_failed_count', sortable: true },
    { name: 'rtmp_feeder_failed_count', align, label: 'RTMP Feeder Failed Count', field: 'rtmp_feeder_failed_count', sortable: true },
    { name: 'hls_failed_count', align, label: 'HLS Failed Count', field: 'hls_failed_count', sortable: true },
    { name: 'ffmpeg_reader_failed_count', align, label: 'FFmpeg Reader Failed Count', field: 'ffmpeg_reader_failed_count', sortable: true },
    { name: 'record_failed_count', align, label: 'Record Failed Count', field: 'record_failed_count', sortable: true },
    { name: 'snapshot_failed_count', align, label: 'Snapshot Failed Count', field: 'snapshot_failed_count', sortable: true },
    { name: 'record_stuck_process_count', align, label: 'Record Stuck Process Count', field: 'record_stuck_process_count', sortable: true },
    { name: 'last_check_at', align, label: 'Last Check At', field: 'last_check_at', format: (val: any) => `${val.toLocaleString()}`, sortable: true },
  ];
}

function createRecStucksColumns(){
  const align = 'left';
  return [
    { name: 'brand', align, label: 'Brand', field: 'brand', sortable: true },
    { name: 'name', align, label: 'Name', field: 'name', sortable: true },
    { name: 'address', align, label: 'Address', field: 'address', sortable: true },

    { name: 'record_segment_interval', align, label: 'Record Segment Interval', field: 'record_segment_interval', sortable: true },
    { name: 'record_output_dir', align, label: 'Record Output Dir', field: 'record_output_dir', sortable: true },
    { name: 'file_ext', align, label: 'File Extension', field: 'file_ext', sortable: true },
    { name: 'last_modified_file', align, label: 'Last Modified File', field: 'last_modified_file', sortable: true },
    { name: 'last_modified_size', align, label: 'Last Modified Size', field: 'last_modified_size', sortable: true },
    { name: 'failed_count', align, label: 'Failed Count', field: 'failed_count', sortable: true },
    { name: 'failed_modified_file', align, label: 'Failed Modified File', field: 'failed_modified_file', sortable: true },
    { name: 'last_check_at', align, label: 'Last Check At', field: 'last_check_at', format: (val: any) => `${val.toLocaleString()}`, sortable: true },
  ];
}

</script>

<style scoped>

</style>

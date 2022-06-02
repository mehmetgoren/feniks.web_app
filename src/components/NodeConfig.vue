<template>
  <div class='q-pa-md q-gutter-sm' style='margin-bottom: -25px'>
    <CommandBar :show-delete='false' @on-save='onSave' @on-restore='onRestore' />
  </div>
  <div class='q-pa-md' v-if='config'>
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
        <q-form id='frmPath' class='q-pa-xs' style='margin:0 5px 0 5px;'>
          <q-input v-model.trim='general.root_folder_path' filled dense label='Root Folder Path' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='general.heartbeat_interval' filled dense label='Heartbeat Interval' />
        </q-form>

        <q-space style='height: 10px;' />
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin:0 5px 0 5px;width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>UI Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;' />
        <q-form id='frmPath' class='q-pa-xs' style='margin:0 5px 0 5px;'>
          <q-input v-model.number='ui.gs_width' filled dense label='Grid Stack Width' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='ui.gs_height' filled dense label='Grid Stack Height' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='ui.booster_interval' filled dense label='Booster Interval' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='ui.seek_to_live_edge_internal' filled dense label='Seek to Live Edge Internal' />
        </q-form>

        <q-space style='height: 10px;' />
        <q-toolbar class='bg-brown-5 text-white shadow-2 rounded-borders' style='margin:0 5px 0 5px;width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>Scan Network for IP Cameras</label>
        </q-toolbar>
        <q-form id='frmPath' class='q-pa-xs' style='margin:0 5px 0 5px;'>
          <q-input v-model='networkScanResults.created_at' filled readonly dense label='Last Scan At'/>
          <q-space style='height: 10px;' />
          <q-btn icon='radar' label='Scan Network for IP Cameras' color='brown-5' @click='onScanNetwork' :disable='showScanLoading'>
            <q-inner-loading :showing='showScanLoading' />
          </q-btn>
          <q-space style='height: 10px;' />
          <q-table title='Network Scan Results' :rows='networkScanResults.results' :columns='columns'
                   row-key='address' :pagination='initialPagination' color='brown-5' />
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
</template>

<script lang='ts'>
import { NodeService } from 'src/utils/services/node_service';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import {
  Config,
  JetsonConfig,
  DeviceConfig,
  TorchConfig,
  OnceDetectorConfig,
  SourceReaderConfig,
  RedisConfig,
  FFmpegConfig, TensorflowConfig, AiConfig, GeneralConfig, UiConfig
} from 'src/utils/models/config';
import CommandBar from 'src/components/CommandBar.vue';
import { List } from 'linqts';
import { PublishService, SubscribeService } from 'src/utils/services/websocket_services';
import { NetworkDiscoveryModel, OnvifAction, OnvifEvent } from 'src/utils/models/onvif_models';
import { myDateToJsDate } from 'src/utils/utils';
import { WsConnection } from 'src/utils/ws/connection';

export default {
  name: 'NodeConfig',
  components: { CommandBar },
  setup() {
    const nodeService = new NodeService();
    const publishService = new PublishService();
    const subscribeService = new SubscribeService();
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

    onMounted(async () => {
      config.value = await nodeService.getConfig();
      const services = getDeviceServices(config.value);
      modelMultiple.value = services;
      optServices.value = services;
      setConfigValue(config.value);
      networkScanResults.value = await nodeService.getOnvifNetwork();
      networkScanResults.value.created_at = myDateToJsDate(<string>networkScanResults.value.created_at).toLocaleString();

      connOnvif = subscribeService.subscribeOnvif((event: MessageEvent) => {
        const result: OnvifEvent = JSON.parse(event.data);
        if (result.type === OnvifAction.NetworkDiscovery){
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


    return {
      config, device, optDeviceTypes, onceDetector, sourceReader, redis,
      jetson, jetsonFilter, ffmpeg, tf, ai, general, ui,
      torch, torchFilter, tfFilter, showScanLoading,
      modelMultiple, optServices, onSave, onRestore,
      imageExtensions: ['jpg', 'jpeg', 'png', 'bmp', 'gif'],
      onScanNetwork: function() {
        void publishService.publishOnvif({}, OnvifAction.NetworkDiscovery);
        showScanLoading.value = true;
      },
      networkScanResults,
      columns: [
        { name: 'address', align: 'center', label: 'Address', field: 'address', sortable: true },
        { name: 'route', align: 'center', label: 'Route', field: 'route', format: (val: any) => `${val.join(' ')}`, sortable: true },
        { name: 'port', align: 'center', label: 'port', field: 'port', sortable: true },
        { name: 'device', align: 'center', label: 'Device', field: 'device', sortable: true },
        { name: 'username', align: 'center', label: 'User Name', field: 'username', sortable: true },
        { name: 'password', align: 'center', label: 'Password', field: 'password', sortable: true },
        { name: 'credentials_found', align: 'center', label: 'Credentials Found', field: 'credentials_found', sortable: true },
        { name: 'route_found', align: 'center', label: 'Route Found', field: 'route_found', sortable: true },
        { name: 'available', align: 'center', label: 'Available', field: 'available', sortable: true },
        { name: 'authentication_type', align: 'center', label: 'Authentication Type', field: 'authentication_type', sortable: true }
      ],
      initialPagination: {
        rowsPerPage: 10
      }
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


</script>

<style scoped>

</style>

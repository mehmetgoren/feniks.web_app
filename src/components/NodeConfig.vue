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
          <q-input v-model.trim='device.device_name' filled :dense='dense' label='Device Name' disable />
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
          <q-input v-model.trim='redis.host' filled :dense='dense' label='Host' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='redis.port' type='number' filled :dense='dense' label='Port' />
        </q-form>
        <q-space style='height: 10px;' />

        <q-space style='height: 10px;' />
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>Heartbeat Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;' />
        <q-form id='frm2' class='q-pa-xs'>
          <q-input v-model.number='config.heartbeat.interval' type='number' filled :dense='dense'
                   label='Heartbeat Interval' />
        </q-form>

        <q-space style='height: 10px;' />
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin:0 5px 0 5px;width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>Path Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;' />
        <q-form id='frmPath' class='q-pa-xs' style='margin:0 5px 0 5px;'>
          <q-input v-model.trim='path.stream' filled :dense='dense' label='HLS Stream Folder Path' />
          <q-space style='height: 10px;' />
          <q-input v-model.trim='path.record' filled :dense='dense' label='Record Folder Path' />
          <q-space style='height: 10px;' />
          <q-input v-model.trim='path.read' filled :dense='dense' label='Jpeg Folder Path' />
        </q-form>

      </div>

      <div class='col-4'>
        <q-space style='margin: 2px;' />
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders'  style='margin: 0 10px 0 10px; width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>Object Detector Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;' />
        <q-form id='frm6' class='q-pa-xs'>
          <q-input v-model.number='onceDetector.imagehash_threshold' type='number' filled :dense='dense'
                   label='Imagehash Threshold' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='onceDetector.psnr_threshold' type='number' filled :dense='dense'
                   label='Psnr Threshold' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='onceDetector.ssim_threshold' type='number' filled :dense='dense'
                   label='Ssim Threshold' />
        </q-form>

        <q-space style='height: 10px;' />
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin:0 5px 0 5px;width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>OpenCV Reader Config</label>
        </q-toolbar>
        <q-space style='height: 2px;' />
        <q-form id='frm7' class='q-pa-xs' style='margin:0 5px 0 5px;'>
          <q-input v-model.number='sourceReader.buffer_size' type='number' filled :dense='dense' label='Buffer Size' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='sourceReader.fps' type='number' filled :dense='dense' label='Fps' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='sourceReader.max_retry' type='number' filled :dense='dense' label='Max Retry' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='sourceReader.max_retry_in' type='number' filled :dense='dense' label='Max RetryIn' />
          <q-space style='height: 10px;' />
        </q-form>

        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin: 0 10px 0 10px; width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>FFmpeg Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;' />
        <q-form id='frm9' class='q-pa-xs'>
          <q-toggle v-model='ffmpeg.use_double_quotes_for_path' filled :dense='dense'
                    label='Use double quotes on FFmpeg Commands' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='ffmpeg.max_operation_retry_count' type='number' filled :dense='dense'
                   label='Max retry count' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='ffmpeg.rtmp_server_init_interval' type='number' filled :dense='dense'
                   label='RTMP Service initialization Interval' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='ffmpeg.watch_dog_interval' type='number' filled :dense='dense'
                   label='Watchdog Interval' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='ffmpeg.watch_dog_failed_wait_interval' type='number' filled :dense='dense'
                   label='Watchdog on Fail Wait Internal' />
          <q-space style='height: 10px;' />
          <q-input v-model.number='ffmpeg.start_task_wait_for_interval' type='number' filled :dense='dense'
                   label='Start Task Wait For Interval' />
        </q-form>

      </div>

      <div class='col-4'>

        <q-space style='margin: 2px;' />
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders'  style='margin: 0 10px 0 10px; width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>AI Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;' />
        <q-form id='frm14' class='q-pa-xs'>
          <q-toggle v-model='ai.read_service_overlay' filled :dense='dense'
                    label='Overlay Detected Object' />
          <q-space style='height: 10px;' />
          <q-input v-model.trim='ai.detected_folder' filled :dense='dense' label='Detection Folder Path' />
        </q-form>

        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin: 0 10px 0 10px; width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>PyTorch Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;' />
        <q-form id='frm5' class='q-pa-xs' style='margin: 0 10px 0 10px'>
          <q-input v-model.trim='torch.model_name' filled :dense='dense' label='Model Name' />
          <q-space style='height: 10px;' />
          <q-input v-model.trim='torch.model_name_specific' filled :dense='dense' label='Model Specific Name' />

        </q-form>
        <q-space style='margin: 2px;' />
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin: 0 10px 0 10px; width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>Tensorflow Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;' />
        <q-form id='frm10' class='q-pa-xs' style='margin: 0 10px 0 10px'>
          <q-input v-model='tf.model_name' filled :dense='dense' label='Model Name' />
          <q-space style='height: 10px;' />
          <q-input v-model='tf.cache_folder' filled :dense='dense' label='Cache Folder' />
        </q-form>

        <q-space style='height: 10px;' />
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin: 0 10px 0 10px;width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>Jetson Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;' />
        <q-form id='frm4' class='q-pa-xs' style='margin: 0 10px 0 10px'>
          <q-input v-model.trim='jetson.model_name' filled :dense='dense' label='Model Name' />
        </q-form>

      </div>

    </div>
  </div>
</template>

<script lang='ts'>
import { NodeService } from 'src/utils/services/node-service';
import { computed, onMounted, ref } from 'vue';
import {
  Config,
  JetsonConfig,
  DeviceConfig,
  TorchConfig,
  OnceDetectorConfig,
  SourceReaderConfig,
  RedisConfig,
  PathConfig, FFmpegConfig, TensorflowConfig, AiConfig
} from 'src/utils/models/config';
import { useStore } from 'src/store';
import CommandBar from 'src/components/CommandBar.vue';
import { List } from 'linqts';

export default {
  name: 'NodeConfig',
  components: { CommandBar },
  setup() {
    const $store = useStore();
    const dense = computed(() => $store.getters['settings/dense']);
    const nodeService = new NodeService();
    const config = ref<Config>();
    const device = ref<DeviceConfig>();
    const path = ref<PathConfig>();

    const modelMultiple = ref();
    const optServices = ref();
    const optDeviceTypes = ref(getDeviceTypes());
    const onceDetector = ref<OnceDetectorConfig>();
    const sourceReader = ref<SourceReaderConfig>();
    const redis = ref<RedisConfig>();
    const ffmpeg = ref<FFmpegConfig>();
    const ai = ref<AiConfig>();

    //jetson
    const jetson = ref<JetsonConfig>();
    const jetsonFilter = ref<string>();

    //torch
    const torch = ref<TorchConfig>();
    const tf = ref<TensorflowConfig>();
    const torchFilter = ref<string>();
    const tfFilter = ref<string>();

    const setConfigValue = (c: Config) => {
      device.value = c.device;
      onceDetector.value = c.once_detector;
      sourceReader.value = c.source_reader;
      redis.value = c.redis;
      path.value = c.path;
      ffmpeg.value = c.ffmpeg;
      torch.value = c.torch;
      tf.value = c.tensorflow;
      jetson.value = c.jetson;
      ai.value = c.ai;
    };

    onMounted(async () => {
      config.value = await nodeService.getConfig();
      const services = getDeviceServices(config.value);
      modelMultiple.value = services;
      optServices.value = services;
      setConfigValue(config.value);
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
      jetson, jetsonFilter, ffmpeg, tf, ai,
      torch, torchFilter, tfFilter,
      dense, modelMultiple, optServices, onSave, onRestore,
      imageExtensions: ['jpg', 'jpeg', 'png', 'bmp', 'gif'],
      path
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

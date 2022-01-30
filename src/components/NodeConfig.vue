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
          <q-input v-model='device.device_name' filled :dense='dense' label='Device Name' disable />
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
          <q-input v-model='redis.host' filled :dense='dense' label='Host' />
          <q-space style='height: 10px;' />
          <q-input v-model='redis.port' type='number' filled :dense='dense' label='Port' />
        </q-form>
        <q-space style='height: 10px;' />

        <q-space style='height: 10px;' />
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>Object Detector Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;' />
        <q-form id='frm6' class='q-pa-xs'>
          <q-input v-model='onceDetector.imagehash_threshold' type='number' filled :dense='dense'
                   label='Imagehash Threshold' />
          <q-space style='height: 10px;' />
          <q-input v-model='onceDetector.psnr_threshold' type='number' filled :dense='dense'
                   label='Psnr Threshold' />
          <q-space style='height: 10px;' />
          <q-input v-model='onceDetector.ssim_threshold' type='number' filled :dense='dense'
                   label='Ssim Threshold' />
        </q-form>

        <q-space style='height: 10px;' />
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>Heartbeat Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;' />
        <q-form id='frm2' class='q-pa-xs'>
          <q-input v-model='config.heartbeat.interval' type='number' filled :dense='dense'
                   label='Heartbeat Interval' />
        </q-form>
      </div>

      <div class='col-4'>
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin:0 5px 0 5px;width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>Handler Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;' />
        <q-space style='height: 10px;' />
        <q-form id='frm3' class='q-pa-xs' style='margin:0 5px 0 5px;'>
          <q-toggle v-model='handler.read_service_overlay' filled :dense='dense' label='Read Service Overlay' />
          <q-space style='height: 10px;' />
          <q-select label='Image Extension' :dense='dense' transition-show='flip-up' transition-hide='flip-down'
                    filled v-model='handler.save_image_extension' clearable :options='imageExtensions' />
          <q-space style='height: 10px;' />
          <q-input v-model='handler.save_image_folder_path' filled :dense='dense' label='Folder Path' />
          <q-space style='height: 10px;' />
          <q-toggle v-model='handler.show_image_caption' filled :dense='dense' label='Show Image Caption' />
          <q-space style='height: 10px;' />
          <q-toggle v-model='handler.show_image_fullscreen' filled :dense='dense' label='Show Image Fullscreen' />
          <q-space style='height: 10px;' />
          <q-input v-model='handler.show_image_wait_key' type='number' filled :dense='dense'
                   label='Show Image Wait Key' />
        </q-form>

        <q-space style='height: 10px;' />
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin:0 5px 0 5px;width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>OpenCV Reader Config</label>
        </q-toolbar>
        <q-space style='height: 2px;' />
        <q-form id='frm7' class='q-pa-xs' style='margin:0 5px 0 5px;'>
          <q-input v-model='sourceReader.buffer_size' type='number' filled :dense='dense' label='Buffer Size' />
          <q-space style='height: 10px;' />
          <q-input v-model='sourceReader.fps' type='number' filled :dense='dense' label='Fps' />
          <q-space style='height: 10px;' />
          <q-toggle v-model='sourceReader.kill_starter_proc' filled :dense='dense' label='Kill Starter Proc' />
          <q-space style='height: 10px;' />
          <q-input v-model='sourceReader.max_retry' type='number' filled :dense='dense' label='Max Retry' />
          <q-space style='height: 10px;' />
          <q-input v-model='sourceReader.max_retry_in' type='number' filled :dense='dense' label='Max RetryIn' />
          <q-space style='height: 10px;' />
        </q-form>

        <q-space style='height: 10px;' />
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin:0 5px 0 5px;width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>Path Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;' />
        <q-form id='frmPath' class='q-pa-xs' style='margin:0 5px 0 5px;'>
          <q-input v-model='path.streaming' filled :dense='dense' label='HLS Streaming Folder Path' />
          <q-space style='height: 10px;' />
          <q-input v-model='path.recording' filled :dense='dense' label='Recording Folder Path' />
          <q-space style='height: 10px;' />
          <q-input v-model='path.reading' filled :dense='dense' label='Jpeg Folder Path' />
        </q-form>
      </div>

      <div class='col-4' v-if='device.device_type===0'>
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin: 0 10px 0 10px; width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>PyTorch Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;' />
        <q-form id='frm5' class='q-pa-xs' style='margin: 0 10px 0 10px'>
          <q-input v-model='torch.model_name' filled :dense='dense' label='Model Name' />
          <q-space style='height: 10px;' />
          <q-input v-model='torch.model_name_specific' filled :dense='dense' label='Model Specific Name' />
          <q-space style='height: 10px;' />
          <q-input v-model='torch.threshold' type='number' filled :dense='dense' label='Threshold' />
          <q-space style='height: 10px;' />
          <q-table :dense='dense' style='height: 400px' title='Objects' :rows='coco80' :columns='columns'
                   row-key='value'
                   virtual-scroll :rows-per-page-options='[0]' :filter='torchFilter'
                   selection='multiple' v-model:selected='torchWhiteListSelected'>
            <template v-slot:top-right>
              <q-input borderless dense debounce='300' v-model='torchFilter' placeholder='Search'>
                <template v-slot:append>
                  <q-icon name='search' />
                </template>
              </q-input>
            </template>
          </q-table>

        </q-form>

      </div>

      <div class='col-4' v-if='device.device_type===1'>
        <q-space style='height: 10px;' />
        <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='margin: 0 10px 0 10px;width: auto;'>
          <label style='text-transform: uppercase;font-size: medium'>Jetson Config</label>
        </q-toolbar>
        <q-space style='margin: 2px;' />
        <q-form id='frm4' class='q-pa-xs' style='margin: 0 10px 0 10px'>
          <q-input v-model='jetson.model_name' filled :dense='dense' label='Model Name' />
          <q-space style='height: 10px;' />
          <q-input v-model='jetson.threshold' type='number' filled :dense='dense' label='Threshold' />
          <q-space style='height: 10px;' />
          <q-table :dense='dense' style='height: 400px' title='Objects' :rows='coco91' :columns='columns'
                   row-key='value'
                   virtual-scroll :rows-per-page-options='[0]' :filter='jetsonFilter'
                   selection='multiple' v-model:selected='jetsonWhiteListSelected'>
            <template v-slot:top-right>
              <q-input borderless dense debounce='300' v-model='jetsonFilter' placeholder='Search'>
                <template v-slot:append>
                  <q-icon name='search' />
                </template>
              </q-input>
            </template>
          </q-table>

        </q-form>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { NodeService } from 'src/utils/services/node-service';
import { computed, onMounted, ref, watch } from 'vue';
import {
  Config,
  HandlerConfig,
  JetsonConfig,
  DeviceConfig,
  TorchConfig,
  OnceDetectorConfig,
  SourceReaderConfig,
  RedisConfig,
  PathConfig
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
    const handler = ref<HandlerConfig>();
    const path = ref<PathConfig>();

    const modelMultiple = ref();
    const optServices = ref();
    const optDeviceTypes = ref(getDeviceTypes());
    const onceDetector = ref<OnceDetectorConfig>();
    const sourceReader = ref<SourceReaderConfig>();
    const redis = ref<RedisConfig>();

    //jetson
    const jetson = ref<JetsonConfig>();
    const coco91 = ref(nodeService.getCoco91Names());
    const jetsonWhiteListSelected = ref<any>([]);
    const jetsonFilter = ref<string>();

    //torch
    const torch = ref<TorchConfig>();
    const coco80 = ref(nodeService.getCoco80Names());
    const torchWhiteListSelected = ref<any>([]);
    const torchFilter = ref<string>();

    const setConfigValue = (c: Config) => {
      device.value = c.device;
      handler.value = c.handler;
      onceDetector.value = c.once_detector;
      sourceReader.value = c.source_reader;
      redis.value = c.redis;
      path.value = c.path;
    };

    onMounted(async () => {
      config.value = await nodeService.getConfig();
      const services = getDeviceServices(config.value);
      modelMultiple.value = services;
      optServices.value = services;
      setConfigValue(config.value);

      jetson.value = config.value?.jetson;
      if (config.value.jetson.white_list.length) {
        const arr = [];
        for (const item of config.value.jetson.white_list) {
          arr.push(coco91.value[item]);
        }
        jetsonWhiteListSelected.value = arr;
      }

      torch.value = config.value.torch;
      if (config.value.torch.white_list.length) {
        const arr = [];
        for (const item of config.value.torch.white_list) {
          arr.push(coco80.value[item]);
        }
        torchWhiteListSelected.value = arr;
      }
    });

    watch(jetsonWhiteListSelected, () => {
      const c: any = config.value;
      if (!jetsonWhiteListSelected.value.length) {
        c.jetson.white_list = [];
      } else {
        c.jetson.white_list = new List(jetsonWhiteListSelected.value).Select((x: any) => x.value).ToArray();
      }
    });

    watch(torchWhiteListSelected, () => {
      const c: any = config.value;
      if (!torchWhiteListSelected.value.length) {
        c.torch.white_list = [];
      } else {
        c.torch.white_list = new List(torchWhiteListSelected.value).Select((x: any) => x.value).ToArray();
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
      config, device, handler, optDeviceTypes, onceDetector, sourceReader, redis,
      jetson, coco91, jetsonWhiteListSelected, jetsonFilter,
      torch, coco80, torchWhiteListSelected, torchFilter,
      dense, modelMultiple, optServices, columns, onSave, onRestore,
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

const columns = [
  { name: 'label', align: 'left', label: 'Name', field: 'label' }
];
</script>

<style scoped>

</style>

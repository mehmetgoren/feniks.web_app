<template>
  <div class='q-pa-sm' v-if='config'>
    <div class='row'>

      <div class='col-4'>

        <q-card class='my-card'>
          <q-card-section class='bg-purple text-white'>
            <div class='text-subtitle2'>Device Config</div>
          </q-card-section>
          <q-card-actions align='left'>
            <q-form style='max-width: 500px' id='frm1' class='q-pa-xs'>
              <q-input v-model='deviceConfig.device_name' filled :dense='dense' label='Device Name' disable />
              <q-space style='height: 10px;' />
              <q-select style='max-width: 300px' emit-value map-options filled disable dense='dense'
                        v-model='deviceConfig.device_type' :options='optDeviceTypes' label='Device Type' />
              <q-space style='height: 10px;' />
              <q-select style='max-width: 300px' filled v-model='modelMultiple' multiple :options='optServices' dense='dense'
                        use-chips stack-label label='Running Services' disable />
            </q-form>
          </q-card-actions>
        </q-card>

        <q-space style='height: 10px;' />
        <q-card class='my-card'>
          <q-card-section class='bg-purple text-white'>
            <div class='text-subtitle2'>Redis Config</div>
          </q-card-section>
          <q-card-actions align='left'>
            <q-form style='max-width: 500px' id='frm8' class='q-pa-xs'>
              <q-input v-model='redis.host' filled :dense='dense' label='Host' />
              <q-space style='height: 10px;' />
              <q-input v-model='redis.port' type='number' filled :dense='dense' label='Port' />
            </q-form>
          </q-card-actions>
        </q-card>
        <q-space style='height: 10px;' />

        <q-card class='my-card'>
          <q-card-section class='bg-purple text-white'>
            <div class='text-subtitle2'>Object Detector Config</div>
          </q-card-section>
          <q-card-actions align='left'>
            <q-form style='max-width: 500px' id='frm6' class='q-pa-xs'>
              <q-input v-model='onceDetector.imagehash_threshold' type='number' filled :dense='dense'
                       label='Imagehash Threshold' />
              <q-space style='height: 10px;' />
              <q-input v-model='onceDetector.psnr_threshold' type='number' filled :dense='dense'
                       label='Psnr Threshold' />
              <q-space style='height: 10px;' />
              <q-input v-model='onceDetector.ssim_threshold' type='number' filled :dense='dense'
                       label='Ssim Threshold' />
            </q-form>
          </q-card-actions>
        </q-card>

      </div>

      <div class='col-4'>
        <q-card class='my-card' style='margin:0 5px 0 5px;'>
          <q-card-section class='bg-purple text-white'>
            <div class='text-subtitle2'>Handler Config</div>
          </q-card-section>
          <q-card-actions align='left'>
            <q-form style='max-width: 500px' id='frm3' class='q-pa-xs'>
              <q-toggle v-model='handler.read_service_overlay' filled :dense='dense' label='Read Service Overlay' />
              <q-space style='height: 10px;' />
              <q-select label='Image Extension' :dense='dense' transition-show='flip-up' transition-hide='flip-down'
                        filled style='width: 250px'
                        v-model='handler.save_image_extension' clearable
                        :options='imageExtensions' />
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
          </q-card-actions>
        </q-card>

        <q-space style='height: 10px;' />
        <q-card class='my-card' style='margin:0 5px 0 5px;'>
          <q-card-section class='bg-purple text-white'>
            <div class='text-subtitle2'>Source Reader Config</div>
          </q-card-section>
          <q-card-actions align='left'>
            <q-form style='max-width: 500px' id='frm7' class='q-pa-xs'>
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
              <q-select style='max-width: 300px' emit-value map-options filled dense='dense' transition-show='flip-up' transition-hide='flip-down'
                        v-model='sourceReader.reader_type' :options='optReaderTypes' label='Reader Type' />
            </q-form>
          </q-card-actions>
        </q-card>

        <q-space style='height: 10px;' />
        <q-card class='my-card' style='margin:0 5px 0 5px;'>
          <q-card-section class='bg-purple text-white'>
            <div class='text-subtitle2'>Heartbeat Config</div>
          </q-card-section>
          <q-card-actions align='left'>
            <q-form style='max-width: 500px' id='frm2' class='q-pa-xs'>
              <q-input v-model='config.heartbeat.interval' type='number' filled :dense='dense'
                       label='Heartbeat Interval' />
            </q-form>
          </q-card-actions>
        </q-card>
      </div>

      <div class='col-4' v-if='deviceConfig.device_type===0'>
        <q-card class='my-card'>
          <q-card-section class='bg-purple text-white'>
            <div class='text-subtitle2'>Torch Config</div>
          </q-card-section>
          <q-card-actions align='left'>
            <q-form id='frm5' class='q-pa-xs'>
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
          </q-card-actions>
        </q-card>
      </div>

      <div class='col-4' v-if='deviceConfig.device_type===1'>
        <q-card class='my-card'>
          <q-card-section class='bg-purple text-white'>
            <div class='text-subtitle2'>Jetson Config</div>
          </q-card-section>
          <q-card-actions align='left'>
            <q-form id='frm4' class='q-pa-xs'>
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
          </q-card-actions>
        </q-card>
      </div>

    </div>
  </div>
  <div class='q-pa-md q-gutter-sm'>
    <q-banner inline-actions rounded class='bg-purple text-white'>
      <template v-slot:action>
        <q-btn flat label='Restore to Default' icon='redo' @click='onRestore' />
        <q-btn flat label='Save' icon='save' @click='onSave' />
      </template>
    </q-banner>
  </div>
</template>

<script lang='ts'>
import { NodeService } from 'src/utils/services/node-service';
import { computed, onMounted, ref, watch } from 'vue';
import { MlConfig, Handler, Jetson, DeviceConfig, Torch, OnceDetector, SourceReader, Redis } from 'src/utils/entities';
import { useStore } from 'src/store';
import { List } from 'linqts';

export default {
  name: 'NodeConfig',
  props: {
    nodeAddress: {
      type: String,
      required: true
    }
  },
  setup(props: any) {
    const $store = useStore();
    const dense = computed(() => $store.getters['settings/dense']);
    const nodeService = new NodeService();
    const config = ref<MlConfig>();
    const deviceConfig = ref<DeviceConfig>();
    const handler = ref<Handler>();

    const modelMultiple = ref();
    const optServices = ref();
    const optDeviceTypes = ref(getDeviceTypes());
    const optReaderTypes = ref(getReaderTypes());
    const onceDetector = ref<OnceDetector>();
    const sourceReader = ref<SourceReader>();
    const redis = ref<Redis>();

    //jetson
    const jetson = ref<Jetson>();
    const coco91 = ref(nodeService.getCoco91Names());
    const jetsonWhiteListSelected = ref<any>([]);
    const jetsonFilter = ref<string>();

    //torch
    const torch = ref<Torch>();
    const coco80 = ref(nodeService.getCoco80Names());
    const torchWhiteListSelected = ref<any>([]);
    const torchFilter = ref<string>();

    const setConfigValue = (c: MlConfig) => {
      deviceConfig.value = c.device_config;
      handler.value = c.handler;
      onceDetector.value = c.once_detector;
      sourceReader.value = c.source_reader;
      redis.value = c.redis;
    };

    onMounted(async () => {
      config.value = await nodeService.getMlConfig(props.nodeAddress);
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
      await nodeService.saveMlConfig(props.nodeAddress, <any>config.value);
    };

    const onRestore = async () => {
      config.value = await nodeService.restoreMlConfig(props.nodeAddress);
      setConfigValue(config.value);
    };

    return {
      config, deviceConfig, handler, optDeviceTypes, optReaderTypes, onceDetector, sourceReader, redis,
      jetson, coco91, jetsonWhiteListSelected, jetsonFilter,
      torch, coco80, torchWhiteListSelected, torchFilter,
      dense, modelMultiple, optServices, columns, onSave, onRestore,
      imageExtensions: ['jpg', 'jpeg', 'png', 'bmp', 'gif']
    };
  }
};

function getDeviceServices(config: MlConfig | any): any[] {
  const all =
    new List([{ value: 1, label: 'Stream-Reading' }, { value: 2, label: 'Detection' }, {
      value: 4,
      label: 'Cloud Integration'
    }]);
  const selected = [];
  for (const serviceNo of config.device_config.device_services) {
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

function getReaderTypes() {
  return [{ value: 0, label: 'OpenCV' }, { value: 1, label: 'FFmpeg' }];
}


const columns = [
  { name: 'label', align: 'left', label: 'Name', field: 'label' }
];
</script>

<style scoped>

</style>

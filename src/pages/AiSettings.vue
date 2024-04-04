
,<template>
  <div class='q-pa-md q-gutter-sm'>
    <q-toolbar class='bg-orange text-white shadow-2 rounded-borders' style='width: 99.5%'>
      <q-icon name='auto_awesome' size='28px'/>
      <q-toolbar-title>
        <label style='text-transform: uppercase;font-size: medium;'> {{ smartVision.name }}</label>
      </q-toolbar-title>
      <q-tabs v-model='tab' narrow-indicator inline-label align='left'>
        <q-tab :disable='!enabled' name='cocoList' icon='fact_check' :label="'Coco ' + $t('list') "/>
        <q-tab :disable='!enabled' name='zoneList' icon='format_shapes' :label="$t('zones')"/>
        <q-tab :disable='!enabled' name='detectedList' icon='collections' :label="$t('ai_images')"/>
        <q-tab :disable='!enabled' name='videoClipList' icon='featured_video' :label="$t('ai_clips')"/>
      </q-tabs>
      <q-space/>
    </q-toolbar>
  </div>
  <div class='q-pa-md q-gutter-sm' style='margin-top: -35px;'>
    <q-page style='background-color: whitesmoke;'>
      <div v-if='enabled'>
        <div v-if='tab==="cocoList"' class='div_margin'>
          <q-table dense :title="'Coco ' + $t('objects')" :rows='cocoList' :columns='columns' :rows-per-page-label="$t('rows_per_page')"
                   :pagination='initialPagination' :filter='cocoFilter'>
            <template v-slot:body='props'>
              <q-tr :props='props' :style="{ backgroundColor: props.row.selected ? 'whitesmoke': 'white'}">
                <q-td key='label' :props='props' style='width: 25px;'>
                  <q-checkbox v-model='props.row.selected' dense color='amber'/>
                </q-td>
                <q-td key='label' :props='props'>
                  {{ props.row.label }}
                </q-td>
                <q-td key='label' :props='props'>
                  <q-input type='number' v-model='props.row.threshold' dense outlined color='amber'/>
                </q-td>
              </q-tr>
            </template>
            <template v-slot:top-left>
              <div class='row'>
                <q-checkbox v-model='selectAll' dense color='amber'/>
                <q-space style='margin-right: 15px;'/>
                <q-input borderless dense debounce='300' v-model.trim='cocoFilter' :placeholder="$t('search')">
                  <template v-slot:append>
                    <q-icon name='search'/>
                  </template>
                </q-input>
              </div>
            </template>

            <template v-slot:top-right>
              <q-input v-model.number="allThreshold" type="number" filled dense style="margin: 0 5px 0 0"/>
              <q-btn color='orange' :label="$t('set_all_thresholds')" icon='done' @click='setAllThresholds' dense style="margin: 0 5px 0 0"/>


              <q-input filled v-model='smartVision.start_time' mask='time' :label="$t('start_time')" dense clearable color='orange'>
                <template v-slot:append>
                  <q-icon name='access_time' class='cursor-pointer'>
                    <q-popup-proxy cover transition-show='scale' transition-hide='scale'>
                      <q-time v-model='smartVision.start_time' format24h color='orange'>
                        <div class='row items-center justify-end'>
                          <q-btn v-close-popup label='Close' dense flat color='orange'/>
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <q-space style='margin-left: 5px;'/>
              <q-input filled v-model='smartVision.end_time' mask='time' :label="$t('end_time')" dense clearable color='orange'>
                <template v-slot:append>
                  <q-icon name='access_time' class='cursor-pointer'>
                    <q-popup-proxy cover transition-show='scale' transition-hide='scale'>
                      <q-time v-model='smartVision.end_time' format24h color='orange'>
                        <div class='row items-center justify-end'>
                          <q-btn v-close-popup label='Close' dense flat color='orange'/>
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>

              <q-space style='margin-left: 5px;'/>
              <q-btn color='orange' :label="$t('save')" icon='save' @click='onSave' :disable='inactiveSave' dense>
                <q-inner-loading :showing='inactiveSave'/>
              </q-btn>
              <q-space style='margin-left: 5px;'/>
              <q-btn color='orange' :label="$t('refresh')" icon='restore_page' @click='onRefresh' :disable='inactiveRefresh' dense>
                <q-inner-loading :showing='inactiveRefresh'/>
              </q-btn>
            </template>
          </q-table>
        </div>
        <div v-if='tab==="zoneList"' class='div_margin'>
          <MaskEditor :smart-vision-model='smartVision' :separator='separator'
                      @zones-coordinates-changed='handleZonesCoordinatesChanged' @masks-coordinates-changed='handleMasksCoordinatesChanged'/>
        </div>
        <div v-if='tab==="detectedList"' class='div_margin'>
          <AiImageGallery :smart-vision-model='smartVision'/>
        </div>
        <div v-if='tab==="videoClipList"'>
          <AiClips :source-id='smartVision.id'/>
        </div>
      </div>
      <div v-else>
        <label class='blink_me'>AI Service is not available.</label>
      </div>
    </q-page>
  </div>

</template>

<script lang='ts' setup>
import {onMounted, ref, watch} from 'vue';
import {LocalService} from 'src/utils/services/local_service';
import {isNullOrEmpty} from 'src/utils/utils';
import {NodeService} from 'src/utils/services/node_service';
import {Config} from 'src/utils/models/config';
import MaskEditor from 'components/MaskEditor.vue';
import AiImageGallery from 'components/AiImageGallery.vue';
import AiClips from 'components/AiClips.vue';
import {StoreService} from 'src/utils/services/store_service';
import {useRouter} from 'vue-router';
import {useI18n} from 'vue-i18n';
import { SmartVisionModel } from '../utils/models/ai_model';

const {t} = useI18n({useScope: 'global'});
const router = useRouter();
const localService = new LocalService();
const nodeService = new NodeService();
const storeService = new StoreService();
const tab = ref<string>('cocoList');
const smartVision = ref<SmartVisionModel>(localService.createEmptySmartVisionModel());
const enabled = ref<boolean>(true);
const config = ref<Config>();
const cocoList = ref<Coco[]>([]);
const columns = [
  {name: 'selected', align: 'left', label: t('selection'), field: 'selected'},
  {name: 'label', align: 'left', label: t('name'), field: 'label'},
  {name: 'threshold', align: 'left', label: t('threshold2'), field: 'threshold'}
];
const cocoFilter = ref<string>('');
const selectAll = ref<boolean>(false);
const inactiveSave = ref<boolean>(false);
const inactiveRefresh = ref<boolean>(false);
const separator = 'º';
const allThreshold = ref<number>(.4);

const sourceId = storeService.aiSettingsSourceId;
watch(sourceId, () => {
  tab.value = 'cocoList';
  void onRefresh();
});


watch(selectAll, (newValue: boolean) => {
  for (const item of cocoList.value) {
    item.selected = newValue;
  }
});

onMounted(async () => {
  if (!sourceId.value) {
    await router.push('stream_gallery');
    return;
  }

  inactiveRefresh.value = true;
  config.value = await nodeService.getConfig();
  cocoList.value = convertToCoco(localService.getCoco91Names());
  await onRefresh();
});

async function onSave() {
  try {
    inactiveSave.value = true;
    const selectedDic = {};
    for (const cocoItem of cocoList.value) {
      if (cocoItem.selected) {
        // @ts-ignore
        selectedDic[cocoItem.label] = parseFloat(cocoItem.threshold);
      }
    }
    smartVision.value.selected_list_json = JSON.stringify(selectedDic);
    await nodeService.saveSmartVision(smartVision.value);
  } finally {
    inactiveSave.value = false;
  }
}

async function onRefresh() {
  try {
    inactiveRefresh.value = true;
    for (const item of cocoList.value) {
      item.selected = false;
    }
    if (!isNullOrEmpty(sourceId.value)) {
      const smModel = await nodeService.getSmartVision(sourceId.value);
      if (smModel === null) {
        enabled.value = false;
        return;
      }
      smartVision.value = smModel;
      const selectedDict = JSON.parse(smartVision.value.selected_list_json);
      for (const selectedText in selectedDict) {
        const cocoItem = cocoList.value.find(x => x.label == selectedText) //.value[parseInt(selected)];
        if (!cocoItem) {
          continue;
        }
        cocoItem.selected = true;
        cocoItem.threshold = parseFloat(selectedDict[selectedText]);
      }
    }
  } finally {
    inactiveRefresh.value = false;
  }
}

function handleZonesCoordinatesChanged(newZones: string) {
  smartVision.value.zones_list = newZones.replace(',', separator);
  void nodeService.saveSmartVision(smartVision.value);
}

function handleMasksCoordinatesChanged(newMasks: string) {
  smartVision.value.masks_list = newMasks.replace(',', separator);
  void nodeService.saveSmartVision(smartVision.value);
}

const initialPagination = {
  page: 0,
    rowsPerPage: 20
};


function convertToCoco(options: any[]): Coco[] {
  const items: Coco[] = [];
  for (const option of options) {
    items.push({value: option.value, label: option.label, selected: false, threshold: .1});
  }
  return items;
}

const setAllThresholds = () => {
  for (const item of cocoList.value) {
    if (item.selected) {
      item.threshold = allThreshold.value;
    }
  }
};

interface Coco {
  value: number;
  label: string;
  selected: boolean;
  threshold: number;
}
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

.div_margin {
  margin-top: 5px;
}
</style>

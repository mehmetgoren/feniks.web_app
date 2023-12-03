<template>
  <div class='q-pa-md q-gutter-sm'>
    <q-toolbar class='bg-orange text-white shadow-2 rounded-borders' style='width: 99.5%'>
      <q-icon name='psychology' size='28px'/>
      <q-toolbar-title>
        <label style='text-transform: uppercase;font-size: medium;'> {{ od.name }}</label>
      </q-toolbar-title>
      <q-tabs v-model='tab' narrow-indicator inline-label align='left'>
        <q-tab :disable='!enabled' name='cocoList' icon='fact_check' :label="'Coco ' + $t('list') "/>
        <q-tab :disable='!enabled' name='zoneList' icon='format_shapes' :label="$t('zones')"/>
        <q-tab :disable='!enabled' name='detectedList' icon='collections' :label="$t('ai_images')"/>
        <q-tab :disable='!enabled' name='videoClipList' icon='featured_video' :label="$t('ai_clips')"/>
        <q-tab :disable='!enabled' name='aidata' icon='lens_blur' :label="$t('ai_data')"/>
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

              <q-input filled v-model='od.start_time' mask='time' :label="$t('start_time')" dense clearable color='orange'>
                <template v-slot:append>
                  <q-icon name='access_time' class='cursor-pointer'>
                    <q-popup-proxy cover transition-show='scale' transition-hide='scale'>
                      <q-time v-model='od.start_time' format24h color='orange'>
                        <div class='row items-center justify-end'>
                          <q-btn v-close-popup label='Close' dense flat color='orange'/>
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <q-space style='margin-left: 5px;'/>
              <q-input filled v-model='od.end_time' mask='time' :label="$t('end_time')" dense clearable color='orange'>
                <template v-slot:append>
                  <q-icon name='access_time' class='cursor-pointer'>
                    <q-popup-proxy cover transition-show='scale' transition-hide='scale'>
                      <q-time v-model='od.end_time' format24h color='orange'>
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
          <MaskEditor :od-model='od' :separator='separator'
                      @zones-coordinates-changed='handleZonesCoordinatesChanged' @masks-coordinates-changed='handleMasksCoordinatesChanged'/>
        </div>
        <div v-if='tab==="detectedList"' class='div_margin'>
          <AiImageGallery :od-model='od'/>
        </div>
        <div v-if='tab==="videoClipList"'>
          <AiClips :source-id='od.id'/>
        </div>
        <div v-if='tab==="aidata"'>
          <AiDataSource :source-id='od.id'/>
        </div>
      </div>
      <div v-else>
        <label class='blink_me'>AI Service is not available.</label>
      </div>
    </q-page>
  </div>

</template>

<script lang='ts' setup>
import {OdModel} from 'src/utils/models/od_model';
import {onMounted, ref, watch} from 'vue';
import {LocalService} from 'src/utils/services/local_service';
import {isNullOrEmpty, isNullOrUndefined} from 'src/utils/utils';
import {NodeService} from 'src/utils/services/node_service';
import {Config} from 'src/utils/models/config';
import MaskEditor from 'components/MaskEditor.vue';
import AiImageGallery from 'components/AiImageGallery.vue';
import AiClips from 'components/AiClips.vue';
import AiDataSource from 'components/AiDataSource.vue';
import {StoreService} from 'src/utils/services/store_service';
import {useRouter} from 'vue-router';
import {useI18n} from 'vue-i18n';

const {t} = useI18n({useScope: 'global'});
const router = useRouter();
const localService = new LocalService();
const nodeService = new NodeService();
const storeService = new StoreService();
const tab = ref<string>('cocoList');
const od = ref<OdModel>(localService.createEmptyOd());
const enabled = ref<boolean>(true);
const config = ref<Config>();
const cocoList = ref<any[]>([]);
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
  cocoList.value = convertToCoco(config.value?.device.device_type === 0 ? localService.getCoco80Names() : localService.getCoco91Names());
  await onRefresh();
});

async function onSave() {
  try {
    inactiveSave.value = true;
    const selectedList: string[] = [];
    const thresholdList: string[] = [];
    for (const cocoItem of cocoList.value) {
      if (cocoItem.selected) {
        selectedList.push(cocoItem.value);
        const value = isNullOrUndefined(cocoItem.threshold) || isNullOrEmpty(cocoItem.threshold.toString())
        || cocoItem.threshold < 0 ? .1 : cocoItem.threshold;
        thresholdList.push(value);
      }
    }
    od.value.selected_list = selectedList.join(separator);
    od.value.threshold_list = thresholdList.join(separator);
    await nodeService.saveOd(od.value);
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
      const odModel = await nodeService.getOd(sourceId.value);
      if (odModel === null) {
        enabled.value = false;
        return;
      }
      od.value = odModel;
      const selectedList = od.value.selected_list.split(separator);
      const thresholdList = od.value.threshold_list.split(separator);
      let index = 0;
      for (const selected of selectedList) {
        const cocoItem = cocoList.value[parseInt(selected)];
        cocoItem.selected = true;
        cocoItem.threshold = parseFloat(thresholdList[index++]);
      }
    }
  } finally {
    inactiveRefresh.value = false;
  }
}

function handleZonesCoordinatesChanged(newZones: string) {
  od.value.zones_list = newZones.replace(',', separator);
  void nodeService.saveOd(od.value);
}

function handleMasksCoordinatesChanged(newMasks: string) {
  od.value.masks_list = newMasks.replace(',', separator);
  void nodeService.saveOd(od.value);
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

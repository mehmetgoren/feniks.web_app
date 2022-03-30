<template>
  <q-layout view='lHh lpr lFf' container class='shadow-2 rounded-borders'>
    <q-header elevated class='bg-amber'>
      <q-toolbar>
        <q-btn flat round dense icon='psychology' />
        <q-toolbar-title>
          <label style='text-transform: uppercase;font-size: medium'> {{ od.name }}</label>
        </q-toolbar-title>
        <q-space />
        <q-btn dense flat icon='close' v-close-popup>
          <q-tooltip class='bg-white text-primary'>Close</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page padding style='background-color: whitesmoke;'>
        <q-toolbar class="bg-amber text-white shadow-2 rounded-borders">
          <q-tabs v-model="tab" narrow-indicator class="bg-amber text-white"  inline-label align="left" >
            <q-tab :disable='!enabled' name="cocoList" icon="fact_check" label="Coco List" />
            <q-tab :disable='!enabled' name="zoneList" icon="format_shapes" label="Zones" />
            <q-tab :disable='!enabled' name="detectedList" icon="collections" label="Detected Images" />
          </q-tabs>
          <q-space/>
          <q-btn flat push label='Save' icon='save' @click='onSave' :disable='inactiveSave' :dense='dense'>
            <q-inner-loading :showing='inactiveSave' />
          </q-btn>
          <q-btn flat push label='Refresh' icon='restore_page' @click='onRefresh' :disable='inactiveRefresh' :dense='dense'>
            <q-inner-loading :showing='inactiveRefresh' />
          </q-btn>
        </q-toolbar>

        <div v-if='enabled'>
          <div v-if='tab==="cocoList"'  class='div_margin'>
            <q-table :dense='dense' title='Coco Objects' :rows='cocoList' :columns='columns'
                     :pagination="initialPagination" :filter='cocoFilter'>
              <template v-slot:body='props'>
                <q-tr :props='props' :style="{ backgroundColor: props.row.selected ? 'whitesmoke': 'white'}">
                  <q-td key='label' :props='props' style='width: 25px;'>
                    <q-checkbox v-model='props.row.selected' :dense='dense' color='amber' />
                  </q-td>
                  <q-td key='label' :props='props'>
                    {{ props.row.label }}
                  </q-td>
                  <q-td key='label' :props='props'>
                    <q-input type='number' v-model='props.row.threshold' :dense='dense' outlined color='amber' />
                  </q-td>
                </q-tr>
              </template>
              <template v-slot:top-left>
                <div class='row'>
                  <q-checkbox v-model='selectAll' :dense='true' color='amber' />
                  <q-space style='margin-right: 15px;' />
                  <q-input borderless dense debounce='300' v-model.trim='cocoFilter' placeholder='Search'>
                    <template v-slot:append>
                      <q-icon name='search' />
                    </template>
                  </q-input>
                </div>
              </template>
            </q-table>
          </div>
          <div v-if='tab==="zoneList"' class='div_margin'>
            <MaskEditor :od-model='od' :separator='separator' @zone-coordinates-changed='handleZoneCoordinatesChanged' />
          </div>
          <div v-if='tab==="detectedList"' class='div_margin'>
            <DetectedImageGallery :od-model='od' />
          </div>
        </div>
        <div v-else>
          <label class='blink_me'>AI Service is not available.</label>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>

</template>

<script lang='ts'>
import { OdModel } from 'src/utils/models/od_model';
import { computed, onMounted, ref, watch } from 'vue';
import { LocalService } from 'src/utils/services/local-service';
import { isNullOrEmpty, isNullOrUndefined } from 'src/utils/utils';
import { NodeService } from 'src/utils/services/node-service';
import { useStore } from 'src/store';
import { Config } from 'src/utils/models/config';
import MaskEditor from 'components/MaskEditor.vue';
import DetectedImageGallery from 'components/DetectedImageGallery.vue';

export default {
  name: 'AiSettings',
  components:{
    MaskEditor,
    DetectedImageGallery
  },
  props: {
    sourceId: {
      type: String,
      required: false,
      default: null
    }
  },
  setup(props: any) {
    const $store = useStore();
    const dense = computed(() => $store.getters['settings/dense']);
    const localService = new LocalService();
    const nodeService = new NodeService();
    const od = ref<OdModel>(localService.createEmptyOd());
    const enabled = ref<boolean>(true);
    const config = ref<Config>();
    const cocoList = ref<any[]>([]);
    const columns = [
      {name: 'selected', align: 'left', label: 'Selection', field: 'selected'},
      { name: 'label', align: 'left', label: 'Name', field: 'label' },
      { name: 'threshold', align: 'left', label: 'Threshold', field: 'threshold' }
    ];
    const cocoFilter = ref<string>('');
    const selectAll = ref<boolean>(false);
    const inactiveSave = ref<boolean>(false);
    const inactiveRefresh = ref<boolean>(false);
    const separator = 'º';

    watch(selectAll, (newValue: boolean) => {
      for (const item of cocoList.value){
        item.selected = newValue;
      }
    });

    onMounted(async () => {
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
        for (const item of cocoList.value){
          item.selected = false;
        }
        if (!isNullOrEmpty(props.sourceId)) {
          const odModel = await nodeService.getOd(props.sourceId);
          console.log(odModel);
          if (odModel === null){
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
      }finally {
        inactiveRefresh.value = false;
      }
    }

    function handleZoneCoordinatesChanged(newZones: string){
      if (isNullOrEmpty(newZones)){
        od.value.zone_list = '';
        return;
      }
      od.value.zone_list = newZones.replace(',', separator);
    }

    return {
      dense,
      od,
      cocoList,
      columns,
      cocoFilter,
      selectAll,
      inactiveSave,
      inactiveRefresh,
      onSave,
      onRefresh,
      enabled,
      initialPagination: {
        page: 0,
        rowsPerPage: 10
      },
      tab: ref('cocoList'),
      handleZoneCoordinatesChanged,
      separator,
    };
  }
};

function convertToCoco(options: any[]): Coco[] {
  const items: Coco[] = [];
  for (const option of options) {
    items.push({ value: option.value, label: option.label, selected: false, threshold: .1 });
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
  color:red;
  font-size:medium;
}

@keyframes blinker {
  50% { opacity: 0; }
}

.div_margin{
  margin-top: 5px;
}
</style>

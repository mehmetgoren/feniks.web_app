<template>
  <q-layout view='lHh lpr lFf' container style='height: 600px' class='shadow-2 rounded-borders'>
    <q-header elevated class='bg-amber'>
      <q-toolbar>
        <q-btn flat round dense icon='settings' />
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
        <q-table :dense='dense' style='height: 400px' title='Coco Objects' :rows='cocoList' :columns='columns'
                 virtual-scroll :rows-per-page-options='[0]' :filter='cocoFilter'>
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
          <template v-slot:top-right>
            <q-banner inline-actions rounded class='bg-amber text-white' :dense='dense'>
              <template v-slot:action>
                <q-btn flat push label='Save' icon='save' @click='onSave' :disable='inactiveSave' :dense='dense'>
                  <q-inner-loading :showing='inactiveSave' />
                </q-btn>
                <q-btn flat push label='Refresh' icon='restore_page' @click='onRefresh' :disable='inactiveRefresh' :dense='dense'>
                  <q-inner-loading :showing='inactiveRefresh' />
                </q-btn>
              </template>
            </q-banner>
          </template>
        </q-table>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang='ts'>
import { OdModel } from 'src/utils/models/od_model';
import { computed, onMounted, ref, watch } from 'vue';
import { LocalService } from 'src/utils/services/local-service';
import { isNullEmpty, isNullOrUndefined } from 'src/utils/utils';
import { NodeService } from 'src/utils/services/node-service';
import { useStore } from 'src/store';
import { Config } from 'src/utils/models/config';

export default {
  name: 'AiSettings',
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
            const value = isNullOrUndefined(cocoItem.threshold) || isNullEmpty(cocoItem.threshold.toString())
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
        if (!isNullEmpty(props.sourceId)) {
          od.value = await nodeService.getOd(props.sourceId);
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
      onRefresh
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

</style>

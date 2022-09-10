<template>
  <div v-if="nvidiaSmi" class="class='q-pa-md q-gutter-sm'">
    <q-markup-table dark class="bg-indigo-8">
      <tr>
        <td style="width: 270px;">
          <q-input label-color="white" color="white" dark
                   :model-value="nvidiaSmi.product_mame + ' (' +nvidiaSmi.product_architecture + ')'" :label="$t('product')" readonly/>
        </td>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.driver_version" :label="$t('driver_version')" readonly/>
        </td>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.cuda_version" :label="$t('cuda_version')" readonly/>
        </td>
        <td>
          <q-toggle v-model="refresh" :label="$t('refresh_every_second')" color="yellow"/>
        </td>
      </tr>
      <tr>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.fan_speed" :label="$t('fan_speed')" readonly/>
        </td>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.gpu_temp" :label="$t('gpu_temp')" readonly/>
        </td>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.power_draw" :label="$t('power_draw')" readonly/>
        </td>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.power_limit" :label="$t('power_limit')" readonly/>
        </td>
      </tr>
      <tr>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.clock_graphics" :label="$t('graphics_clock')" readonly/>
        </td>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.clock_sm" :label="$t('sm_clock')" readonly/>
        </td>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.clock_mem" :label="$t('mem_clock')" readonly/>
        </td>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.clock_video" :label="$t('video_clock')" readonly/>
        </td>
      </tr>
      <tr>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.memory_total" :label="$t('memory_total')" readonly/>
        </td>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.memory_reserved" :label="$t('memory_reserved')" readonly/>
        </td>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.memory_used" :label="$t('memory_used')" readonly/>
        </td>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.memory_free" :label="$t('memory_free')" readonly/>
        </td>
      </tr>
      <tr>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.gpu_util" :label="$t('gpu_util')" readonly/>
        </td>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.memory_util" :label="$t('memory_util')" readonly/>
        </td>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.encoder_util" :label="$t('encoder_util')" readonly/>
        </td>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.decoder_util" :label="$t('decoder_util')" readonly/>
        </td>
      </tr>
    </q-markup-table>
    <q-table :title="$t('gpu_process_memory_usage')" :pagination='initialPagination' style="margin-top: 3px;"
             card-class="bg-indigo-8 text-white" :rows-per-page-label="$t('rows_per_page')"
             :rows='nvidiaSmi.processes' row-key='id' :columns='processColumns' color='lime-6'>
    </q-table>
  </div>
  <div v-else-if="!hasNvidiaGpu">
    <label class='blink_me'>{{$t('no_nvidia_gpu_detected')}}</label>
  </div>

</template>

<script lang='ts'>

import {NodeService} from 'src/utils/services/node_service';
import {NvidiaGpuModel} from 'src/utils/models/gpu';
import {onBeforeUnmount, onMounted, ref} from 'vue';
import {useI18n} from 'vue-i18n';

export default {
  name: 'GpuInfo',
  setup() {
    const {t} = useI18n({useScope: 'global'});
    const nodeService = new NodeService();
    const nvidiaSmi = ref<NvidiaGpuModel | null>(null);
    const refresh = ref<boolean>(false);
    let interval: NodeJS.Timer | null = null;
    const hasNvidiaGpu = ref<boolean>(true);

    const dataBind = async () => {
      nvidiaSmi.value = await nodeService.getNvidiaSmi();
      hasNvidiaGpu.value = nvidiaSmi.value != null;
    }

    onMounted(async () => {
      await dataBind();
      interval = setInterval(() => {
        if (hasNvidiaGpu.value && refresh.value) {
          void dataBind();
        }
      }, 1000);
    });

    onBeforeUnmount(() => {
      if (interval) {
        clearInterval(interval);
      }
    });

    return {
      nvidiaSmi, refresh, hasNvidiaGpu,
      initialPagination: {
        rowsPerPage: 10
      },
      processColumns: createProcessColumns(t)
    }
  }
}

function createProcessColumns(t: any) {
  const align = 'left';
  return [
    {name: 'process_name', align, label: t('process_name'), field: 'process_name', sortable: true},
    {name: 'used_memory', align, label: t('used_memory'), field: 'used_memory', sortable: true}
  ];
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
</style>

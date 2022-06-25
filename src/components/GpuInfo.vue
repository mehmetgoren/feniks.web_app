<template>
  <div v-if="nvidiaSmi" class="class='q-pa-md q-gutter-sm'">
    <q-markup-table dark class="bg-indigo-8">
      <tr>
        <td style="width: 270px;">
          <q-input label-color="white" color="white" dark
                   :model-value="nvidiaSmi.product_mame + ' (' +nvidiaSmi.product_architecture + ')'" label="Product" readonly/>
        </td>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.driver_version" label="Driver Version" readonly/>
        </td>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.cuda_version" label="CUDA Version" readonly/>
        </td>
        <td>
          <q-toggle v-model="refresh" label="Refresh every second" color="yellow"/>
        </td>
      </tr>
      <tr>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.fan_speed" label="Fan Speed" readonly/>
        </td>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.gpu_temp" label="Gpu Temperature" readonly/>
        </td>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.power_draw" label="Power Draw" readonly/>
        </td>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.power_limit" label="Power Limit" readonly/>
        </td>
      </tr>
      <tr>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.clock_graphics" label="Graphics Clock" readonly/>
        </td>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.clock_sm" label="SM Clock" readonly/>
        </td>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.clock_mem" label="Memory Clock" readonly/>
        </td>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.clock_video" label="Video Clock" readonly/>
        </td>
      </tr>
      <tr>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.memory_total" label="Memory Total" readonly/>
        </td>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.memory_reserved" label="Memory Reserved" readonly/>
        </td>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.memory_used" label="Memory Used" readonly/>
        </td>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.memory_free" label="Memory Free" readonly/>
        </td>
      </tr>
      <tr>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.gpu_util" label="GPU Util" readonly/>
        </td>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.memory_util" label="Memory Util" readonly/>
        </td>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.encoder_util" label="Encoder Util" readonly/>
        </td>
        <td>
          <q-input label-color="white" color="white" dark v-model="nvidiaSmi.decoder_util" label="Decoder Util" readonly/>
        </td>
      </tr>
    </q-markup-table>
    <q-table title="GPU Process Memory Usage" :pagination='initialPagination' style="margin-top: 3px;"
             card-class="bg-indigo-8 text-white"
             :rows='nvidiaSmi.processes' row-key='id' :columns='processColumns' color='lime-6'>
    </q-table>
  </div>
  <div v-else-if="!hasNvidiaGpu">
    <label class='blink_me'>No Nvidia GPU was detected.</label>
  </div>

</template>

<script lang='ts'>

import {NodeService} from 'src/utils/services/node_service';
import {NvidiaGpuModel} from 'src/utils/models/gpu';
import {onBeforeUnmount, onMounted, ref} from 'vue';

export default {
  name: 'GpuInfo',
  setup() {
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
        clearTimeout(interval);
      }
    });

    return {
      nvidiaSmi, refresh, hasNvidiaGpu,
      initialPagination: {
        rowsPerPage: 10
      },
      processColumns: createProcessColumns()
    }
  }
}

function createProcessColumns() {
  const align = 'left';
  return [
    {name: 'process_name', align, label: 'Process Name', field: 'process_name', sortable: true},
    {name: 'used_memory', align, label: 'Used Memory', field: 'used_memory', sortable: true}
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

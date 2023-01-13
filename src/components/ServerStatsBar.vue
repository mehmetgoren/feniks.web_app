<template>
  <div class='q-pa-md q-gutter-sm'>
    <div v-if='cpu' class='row'>
      <span class='q-ml-sm' style='font-size: large'>{{ currentNode.name }} <span class="gt-md"> / {{ currentNode.node_address }}</span></span>
    </div>
    <q-inner-loading v-if='showLoading' :showing='true' :label="$t('pleasewait')" label-class='text-cyan' label-style='font-size: 1.1em'>
      <q-spinner-hourglass size='75%' color='cyan' />
    </q-inner-loading>
  </div>
  <div class='q-pa-md q-gutter-sm' v-if='showCpu'>
    <div v-if='cpu' class='row'>
      <label style='float: left;width: 80%;color: #455a64'> {{ cpu.cpu_count }} {{$t('cpu')}}{{ (cpu.cpu_count > 0 ? $t('plural') : '') }}</label>
      <label style='float: right;color: #455a64;'>{{ cpu.usage_percent_human }}</label>
    </div>
    <div v-if='cpu' class='row'>
      <q-linear-progress size='15px' :value='cpu.usage_percent' style='width: 250px;' color='blue-grey-14' />
    </div>
  </div>

  <div class='q-pa-md q-gutter-sm' v-if='showMemory'>
    <div v-if='memory' class='row'>
      <label style='float:left;width: 80%;color: #455a64'> {{ memory.used_human }} / {{ memory.total_human }} {{ $t('ram') }}</label>
      <label style='float:right;width:auto;color: #455a64;'>{{ memory.usage_percent_human }}</label>
    </div>
    <div v-if='memory' class='row'>
      <q-linear-progress size='15px' :value='memory.usage_percent' style='width: 250px;' color='blue-grey-14' />
    </div>
  </div>

  <div class='q-pa-md q-gutter-sm' v-if='showDisk'>
    <div v-if='disk' class='row'>
      <label style='float: left;width: 80%;color: #455a64'> {{ disk.used_human }} / {{ disk.total_human }} {{$t('disk')}}</label>
      <label style='float: right;color: #455a64'>{{ disk.usage_percent_human }}</label>
    </div>
    <div v-if='disk' class='row'>
      <q-linear-progress size='15px' :value='disk.usage_percent' style='width: 250px;' color='blue-grey-14' />
    </div>
  </div>

  <div class='q-pa-md q-gutter-sm' v-if='showNetwork'>
    <div v-if='network' class='row'>
      <table class="network-text">
        <tr>
          <td>{{$t('totaldownload')}}</td>
          <td>:</td>
          <td style='text-align: right;'>{{ network.download_human }}</td>
          <td>
            <q-icon name='download' />
          </td>
        </tr>
        <tr>
          <td>{{$t('totalupload')}}</td>
          <td>:</td>
          <td style='text-align: right;'>{{ network.upload_human }}</td>
          <td>
            <q-icon name='upload' />
          </td>
        </tr>
      </table>
    </div>
  </div>

  <div class='q-pa-md q-gutter-sm' v-if='showCurrentTime'>
    <div v-if='currentTime' class='row'>
      <label style='float: left;width: 100%;color: #455a64;font-size: 12px;text-align: center;display: block;'>{{ currentTime.toLocaleDateString(locale, localeOptions) }} </label>
      <label style='float: left;width: 100%;color: #455a64;font-size: 24px;text-align: center;display: block;'>{{ currentTime.toLocaleTimeString(locale)
        }} </label>
    </div>
  </div>

</template>

<script lang='ts'>
import { onMounted, onUnmounted, ref } from 'vue';
import { NodeService } from 'src/utils/services/node_service';
import { CpuInfo, DiskInfo, MemoryInfo, NetworkInfo } from 'src/utils/models/server_stats';
import { Node } from 'src/utils/entities';
import { NodeRepository } from 'src/utils/db';
import {useI18n} from 'vue-i18n';
import {createLongDateLocale} from 'src/utils/utils';

declare var $: any;
export default {
  name: 'ServerStatsBar',
  setup() {
    const { locale } = useI18n({ useScope: 'global' });
    const localeOptions = ref<any>(createLongDateLocale());
    const nodeService = new NodeService();
    const currentNode = ref<Node>(nodeService.LocalService.createEmptyNode());
    const cpu = ref<CpuInfo>();
    const memory = ref<MemoryInfo>();
    const disk = ref<DiskInfo>();
    const network = ref<NetworkInfo>();
    let mineInterval: NodeJS.Timer | null = null;
    const currentTime = ref(new Date());
    let dateTimeInterval: NodeJS.Timer | null = null;
    const showLoading = ref<boolean>(false);
    const showNetwork = ref<boolean>(true);
    const showCurrentTime = ref<boolean>(true);
    const showDisk = ref<boolean>(true);
    const showMemory = ref<boolean>(true);
    const showCpu = ref<boolean>(true);

    const dataBind = async () => {
      const stats = await nodeService.getServerStats();

      stats.cpu.usage_percent /= 100.0;
      stats.cpu.usage_percent_human = fixSingleDigitWidth(stats.cpu.usage_percent_human);
      cpu.value = stats.cpu;

      stats.memory.usage_percent /= 100.0;
      stats.memory.usage_percent_human = fixSingleDigitWidth(stats.memory.usage_percent_human);
      stats.memory.used_human = stats.memory.used_human.replace('GiB', 'GB');
      stats.memory.total_human = stats.memory.total_human.replace('GiB', 'GB');
      memory.value = stats.memory;

      stats.disk.usage_percent /= 100.0;
      stats.disk.usage_percent_human = fixSingleDigitWidth(stats.disk.usage_percent_human);
      disk.value = stats.disk;

      network.value = stats.network;
    };

    onMounted(async () => {
      showLoading.value = true;
      try {
        const an = await new NodeRepository().getActiveNode();
        if (an) {
          currentNode.value = an;
        }

        await dataBind();
        mineInterval = setInterval(() => {
          void dataBind();
        }, 10000);

        dateTimeInterval = setInterval(() => {
          currentTime.value = new Date();
        }, 1000);
      } finally {
        showLoading.value = false;
      }

      $(window).resize(function() {
        showWidgets();
      });
      showWidgets();
    });

    function showWidgets(){
      const w = $(window).width();
      showNetwork.value = false; //w > 1850;
      showCurrentTime.value = w > 1405;
      showDisk.value = w > 1160;
      showMemory.value = w > 880;
      showCpu.value = w > 560;
    }

    onUnmounted(() => {
      if (mineInterval) {
        clearInterval(mineInterval);
      }
      if (dateTimeInterval) {
        clearInterval(dateTimeInterval);
      }
    });

    return {
      locale, localeOptions, currentNode, cpu, memory, disk, network, currentTime, showLoading,
      showNetwork, showCurrentTime, showDisk, showMemory, showCpu
    };
  }
};

function fixSingleDigitWidth(human: string): string {
  let fixed = human.replace('%', '');
  fixed = fixed.trim();
  const splits = fixed.split('.');
  if (splits.length !== 2) {
    return human;
  }
  const first = splits[0].length < 2 ? parseInt(splits[0]) < 10 ? '0' + splits[0] : splits[0] : splits[0];
  const second = splits[1].length < 2 ? parseInt(splits[1]) < 10 ? '0' + splits[1] : splits[1] : splits[1];

  return `${first}.${second} %`;
}
</script>

<style scoped>
.network-text{
  font-size: 12px;
}
</style>

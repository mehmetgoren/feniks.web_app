<template>
  <div class='q-pa-md q-gutter-sm'>
    <div v-if='cpu' class='row'>
      <span class='q-ml-sm' style='font-size: large'>{{ serverIp }}</span>
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
    <table style="margin-bottom: -5px">
      <tr>
        <td style="text-align: left" v-if="disks.length > 1">
          <q-btn-dropdown style="margin-bottom: -7px" color="blue-grey-14" :label="'disk:' + (selectedDiskIndex+1).toString()"
                          split push dense>
            <q-list>
              <q-item v-for="(disk, index) in disks" :key="index" clickable v-close-popup @click="selectedDiskIndex = index">
                <q-item-section>{{ disk.mount_point }}</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </td>
        <td>
          <div v-if='disks[selectedDiskIndex]' class='row'>
            <label style='float: left;width: 80%;color: #455a64'> {{ disks[selectedDiskIndex].used_human }} / {{ disks[selectedDiskIndex].total_human }} {{$t('disk')}}</label>
            <label style='float: right;color: #455a64'>{{ disks[selectedDiskIndex].usage_percent_human }}</label>
          </div>
          <div v-if='disks[selectedDiskIndex]' class='row'>
            <q-linear-progress size='15px' :value='disks[selectedDiskIndex].usage_percent' style='width: 250px;' color='blue-grey-14' />
          </div>
        </td>
      </tr>
    </table>
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
      <label style='float: left;width: 100%;color: #455a64;font-size: 11px;text-align: center;display: block;'>{{ currentTime.toLocaleDateString(locale, localeOptions) }} </label>
      <label style='float: left;width: 100%;color: #455a64;font-size: 20px;text-align: center;display: block;'>{{ currentTime.toLocaleTimeString(locale)
        }} </label>
    </div>
  </div>

</template>

<script lang='ts' setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { NodeService } from 'src/utils/services/node_service';
import { CpuInfo, DiskInfo, MemoryInfo, NetworkInfo } from 'src/utils/models/server_stats';
import {useI18n} from 'vue-i18n';
import {createLongDateLocale} from 'src/utils/utils';

declare var $: any;

const { locale } = useI18n({ useScope: 'global' });
const serverIp = ref<string>('');
const localeOptions = ref<any>(createLongDateLocale());
const nodeService = new NodeService();
const cpu = ref<CpuInfo>();
const memory = ref<MemoryInfo>();
const disks = ref<DiskInfo[]>([]);
const selectedDiskIndex = ref<number>(0);
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

  disks.value = [];
  if (stats.disks&&stats.disks.length){
    stats.disks.forEach(disk => {
      disk.usage_percent /= 100.0;
      disk.usage_percent_human = fixSingleDigitWidth(disk.usage_percent_human);
      disks.value.push(disk);
    });
  }

  network.value = stats.network;
};

onMounted(async () => {
  serverIp.value = nodeService.LocalService.getServerIp();
  showLoading.value = true;
  try {
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
    clearInterval(<any>mineInterval);
  }
  if (dateTimeInterval) {
    clearInterval(<any>dateTimeInterval);
  }
});

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

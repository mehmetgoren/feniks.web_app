<template>
  <DoughnutChart v-if='minutesData' :chartData='minutesData' />
</template>

<script lang='ts'>
import { DoughnutChart } from 'vue-chart-3';
import { Chart, registerables } from 'chart.js';
import { onMounted, ref } from 'vue';
import { NodeService } from 'src/utils/services/node_service';
import { generateHtmlColor, myDateToJsDate } from 'src/utils/utils';

Chart.register(...registerables);
export default {
  name: 'Dashboard',
  components: { DoughnutChart },
  setup() {
    const minutesData = ref(null);
    const nodeService = new NodeService();

    onMounted(async () => {
      const d = { labels: [], datasets: [{ data: [], backgroundColor: [] }] };
      const streams = await nodeService.getStreamList();
      if (!streams || !streams.length){
        return;
      }
      const now = new Date();
      const ds = d.datasets[0];
      for (const stream of streams) {
        d.labels.push(<never>stream.name);

        const t = myDateToJsDate(stream.created_at);
        const diff = now.getTime() - t.getTime();
        const resultInMinutes = Math.abs(Math.round(diff / 60000));
        ds.data.push(<never>resultInMinutes);
        ds.backgroundColor.push(<never>generateHtmlColor());

      }
      //@ts-ignore
      minutesData.value = d;
    });

    // const testData = {
    //   labels: ['Paris', 'Nîmes', 'Toulon', 'Perpignan', 'Autre'],
    //   datasets: [
    //     {
    //       data: [30, 40, 60, 70, 5],
    //       backgroundColor: ['#77CEFF', '#0079AF', '#123E6B', '#97B0C4', '#A5C8ED']
    //     }
    //   ]
    // };
    return {
      minutesData
    };
  }
};
</script>

<style scoped>

</style>
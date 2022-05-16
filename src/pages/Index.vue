<template>
  <Nodes v-if="menu === 'nodes'" />
  <Hub v-else-if="menu === 'hub'" />
  <div v-else>
    <DoughnutChart :chartData='testData' />
  </div>

</template>

<script lang='ts'>
import {
  computed, defineComponent, ref, watch
} from 'vue';
import { DoughnutChart } from 'vue-chart-3';
import { Chart, registerables } from 'chart.js';
import Nodes from 'pages/Nodes.vue';
import Hub from 'pages/Hub.vue';
import { useStore } from 'src/store';
import { MenuLink } from 'src/store/module-settings/state';

Chart.register(...registerables);
export default defineComponent({
  name: 'Index',
  components: { DoughnutChart, Nodes, Hub },
  setup() {
    const $store = useStore();
    const activeLeftMenu = computed(() => $store.getters['settings/activeLeftMenu']);
    const menu = ref<string>('index');

    watch(activeLeftMenu, (newValue: MenuLink) => {
      menu.value = <string>newValue.route?.split('=')[1];
    });

    const testData = {
      labels: ['Paris', 'Nîmes', 'Toulon', 'Perpignan', 'Autre'],
      datasets: [
        {
          data: [30, 40, 60, 70, 5],
          backgroundColor: ['#77CEFF', '#0079AF', '#123E6B', '#97B0C4', '#A5C8ED']
        }
      ]
    };

    return { testData, menu };
  }
});

</script>


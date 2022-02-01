<template>
  <Nodes v-if="menu === 'nodes'" />
  <Hub v-else-if="menu === 'hub'" />
  <div v-else>
    <DoughnutChart :chartData='testData' />
    <div style='width: 100%; max-width: 400px'>
      <q-chat-message
        :text='client'
        sent
      />
      <q-chat-message
        :text='server'
      />
    </div>
<!--    <div style='width: 640px;'>-->
<!--      <FlvPlayer :src='"http://localhost:9001/live/STREAM_NAME.flv"' />-->
<!--    </div>-->
    <div>
      <input id='btn' type='button' value='Send' @click='onSend' />
      <input type='text' v-model='msg' size='64' autofocus />
    </div>
  </div>

</template>

<script lang='ts'>
import {
  computed,
  defineComponent,
  onMounted, ref, watch
} from 'vue';
import { DoughnutChart } from 'vue-chart-3';
import { Chart, registerables } from 'chart.js';
import { WsConnection } from 'src/utils/ws/connection';
import { SubscribeService } from 'src/utils/services/websocket-services';
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

    const client = ref<string[]>([]);
    const server = ref<string[]>([]);
    const msg = ref<string>('');
    const subscribeService = new SubscribeService();

    let conn: WsConnection | null = null;

    const onSend = () => {
      if (!conn) {
        return;
      }
      if (!msg.value) {
        return;
      }
      conn.send(msg.value);
      client.value.push(msg.value);
    };

    onMounted(() => {
      conn = subscribeService.subscribeChat((evt: MessageEvent) => {
        const messages = evt.data.split('\n');
        for (let i = 0; i < messages.length; ++i) {
          server.value.push(messages[i]);
        }
      });
    });

    return { testData, client, server, msg, onSend, menu };
  }
});

</script>


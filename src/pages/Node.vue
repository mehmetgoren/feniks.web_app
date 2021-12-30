<template>
  <div class='q-pa-sm'>
    <q-banner class='bg-primary text-white'>
      {{ activeTab }}
    </q-banner>
    <NodeConfig node-address='127.0.0.1' v-if='showConfig' />
    <LiveStream v-if='!showConfig'  />
  </div>
</template>

<script lang='ts'>
import NodeConfig from 'components/NodeConfig.vue';
import LiveStream from 'components/LiveStream.vue';
import { computed, ref, watch } from 'vue';
import { useStore } from 'src/store';
import {parseQs} from 'src/utils/utils';

export default {
  name: 'Node',
  components: { NodeConfig, LiveStream },
  setup() {
    const $store = useStore();
    const activeTab = computed(() => $store.getters['settings/activeTab']);//active node ip
    const activeLeftMenu = computed(() => $store.getters['settings/activeLeftMenu']);//active node ip
    const showConfig = ref<boolean>(false);

    watch(activeTab, (newValue) => {
      console.log('activeTab: ' + newValue);
    });

    watch(activeLeftMenu, (newValue) => {
      console.log('activeLeftMenu: ' + newValue);
      console.log('activeLeftMenuJson: ' + JSON.stringify(parseQs(newValue)));
      const qs = parseQs(newValue)
      showConfig.value = qs.config === 'general';
    });

    return { activeTab, showConfig };
  }
};
</script>

<style scoped>

</style>

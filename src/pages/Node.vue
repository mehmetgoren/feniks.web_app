<template>
  <div class='q-pa-sm'>
    <q-banner class='bg-primary text-white'>
      {{ activeTab }}
    </q-banner>
    <NodeConfig node-address='127.0.0.1' v-if='showConfig' />
    <LiveStreamGallery v-if='!showConfig' />
  </div>
</template>

<script lang='ts'>
import NodeConfig from 'components/NodeConfig.vue';
import LiveStreamGallery from 'components/LiveStreamGallery.vue';
import { computed, ref, watch, nextTick } from 'vue';
import { useStore } from 'src/store';
import { parseQs, startStreaming } from 'src/utils/utils';
import { MenuLink } from 'src/store/module-settings/state';
import { PublishService } from 'src/utils/services/websocket-services';

export default {
  name: 'Node',
  components: { NodeConfig, LiveStreamGallery },
  setup() {
    const $store = useStore();
    const activeTab = computed(() => $store.getters['settings/activeTab']);//active node ip
    const activeLeftMenu = computed(() => $store.getters['settings/activeLeftMenu']);//active node ip
    const showConfig = ref<boolean>(true);
    const publishService = new PublishService();

    watch(activeTab, (newValue) => {
      console.log('activeTab: ' + newValue);
    });

    watch(activeLeftMenu, (newValue: MenuLink) => {
      console.log('activeLeftMenu: ' + JSON.stringify(newValue));
      console.log('activeLeftMenuJson: ' + JSON.stringify(parseQs(<any>newValue.route)));
      const queryStr = parseQs(<any>newValue.route);
      showConfig.value = queryStr.config === 'general';
      nextTick().then(() => {
        if (!showConfig.value){
          startStreaming($store, publishService, <any>newValue.source)
        }
      }).catch(console.log);
    });

    return { activeTab, showConfig };
  }
};
</script>

<style scoped>

</style>

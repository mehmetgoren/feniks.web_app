<template>
  <div class='q-pa-sm'>
    <NodeConfig v-if='showConfig===0' />
    <SourceSettings v-if='showConfig===1' />
    <LiveStreamGallery v-if='showConfig===2' />
  </div>
</template>

<script lang='ts'>
import NodeConfig from 'components/NodeConfig.vue';
import LiveStreamGallery from 'components/LiveStreamGallery.vue';
import SourceSettings from 'components/SourceSettings.vue';
import { computed, ref, watch, nextTick } from 'vue';
import { useStore } from 'src/store';
import { parseQs, startStreaming } from 'src/utils/utils';
import { MenuLink } from 'src/store/module-settings/state';
import { PublishService } from 'src/utils/services/websocket-services';
import { SourceModel } from 'src/utils/models/source_model';

export default {
  name: 'Node',
  components: { NodeConfig, LiveStreamGallery, SourceSettings  },
  setup() {
    const $store = useStore();
    const activeTab = computed(() => $store.getters['settings/activeTab']);//active node ip
    const activeLeftMenu = computed(() => $store.getters['settings/activeLeftMenu']);//active node ip
    const showConfig = ref<number>(0);
    const publishService = new PublishService();

    watch(activeTab, (newValue) => {
      console.log('activeTab: ' + newValue.name);
    });

    watch(activeLeftMenu, (newValue: MenuLink) => {
      // console.log('activeLeftMenu: ' + JSON.stringify(newValue));
      // console.log('activeLeftMenuJson: ' + JSON.stringify(parseQs(<any>newValue.route)));
      const queryStr = parseQs(<any>newValue.route);
      showConfig.value = queryStr.x === 'config' ? 0 : queryStr.x === 'add_source' ? 1: 2;
      nextTick().then(() => {
        if (showConfig.value == 2){
          startStreaming($store, publishService, <SourceModel>newValue.source)
        }
      }).catch(console.log);
    });

    return { activeTab, showConfig };
  }
};
</script>

<style scoped>

</style>

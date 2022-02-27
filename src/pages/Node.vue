<template>
  <div class='q-pa-sm'>
    <NodeConfig v-if='selected===0' />
    <LiveStreamGallery v-if='selected===1' />
  </div>
  <q-dialog v-model='showAddSource' full-width full-height transition-show='flip-down' transition-hide='flip-up'>
    <SourceSettings @on-save='onSourceSettingsSave' />
  </q-dialog>

</template>

<script lang='ts'>
import NodeConfig from 'components/NodeConfig.vue';
import LiveStreamGallery from 'components/LiveStreamGallery.vue';
import SourceSettings from 'components/SourceSettings.vue';
import { computed, ref, watch } from 'vue';
import { useStore } from 'src/store';
import { parseQs } from 'src/utils/utils';
import { MenuLink } from 'src/store/module-settings/state';

export default {
  name: 'Node',
  components: { NodeConfig, LiveStreamGallery, SourceSettings  },
  setup() {
    const $store = useStore();
    const activeTab = computed(() => $store.getters['settings/activeTab']);//active node ip
    const activeLeftMenu = computed(() => $store.getters['settings/activeLeftMenu']);//active node ip
    const addSourceClicked = computed(() => $store.getters['settings/addSourceClicked']);
    const selected = ref<number>(1);
    const showAddSource = ref<boolean>(false);

    watch(activeTab, (newValue) => {
      console.log('activeTab: ' + newValue.name);
    });

    watch(addSourceClicked, () => {
      showAddSource.value = true;
    });

    watch(activeLeftMenu, (newValue: MenuLink) => {
      const queryStr = parseQs(<any>newValue.route);
      switch (queryStr.x){
        case 'config':
          selected.value = 0;
          break;
        case 'add_source':
          selected.value = 1;
          setTimeout(() => {
            showAddSource.value = true;
          }, 1);
          break;
        default:
          selected.value = 1;
      }
    });

    return {
      activeTab,
      selected,
      showAddSource,
      onSourceSettingsSave(){
        showAddSource.value = false;
      }
    };
  }
};
</script>

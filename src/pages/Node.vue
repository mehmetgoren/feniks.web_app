<template>
  <div class='q-pa-sm'>
    <NodeConfig v-if='selected===0' />
    <LiveStreamGallery v-if='selected===1' />
    <AiSettings v-if='selected===2' />
    <FrTraining v-if='selected===3' />
  </div>
  <q-dialog v-model='showAddSource' full-width full-height transition-show='flip-down' transition-hide='flip-up'>
    <SourceSettings @on-save='onSourceSettingsSave' />
  </q-dialog>
</template>

<script lang='ts'>
import { onBeforeRouteUpdate } from 'vue-router';
import NodeConfig from 'components/NodeConfig.vue';
import LiveStreamGallery from 'components/LiveStreamGallery.vue';
import SourceSettings from 'components/SourceSettings.vue';
import AiSettings from 'components/AiSettings.vue';
import FrTraining from 'components/FrTraining.vue';
import { nextTick, onMounted, ref, watch } from 'vue';
import { parseQs } from 'src/utils/utils';
import { MenuLink } from 'src/store/module-settings/state';
import { StoreService } from 'src/utils/services/store_service';

export default {
  name: 'Node',
  components: { NodeConfig, LiveStreamGallery, SourceSettings, AiSettings, FrTraining },
  setup() {
    const storeService = new StoreService();
    const activeLeftMenu = storeService.activeLeftMenu;//active node ip
    const addSourceClicked = storeService.addSourceClicked;
    const aiSettingsClicked = storeService.aiSettingsClicked;
    const selected = ref<number>(0);
    const showAddSource = ref<boolean>(false);

    watch(addSourceClicked, () => {
      showAddSource.value = true;
    });

    watch(aiSettingsClicked, () => {
      selected.value = 2;
    });

    const switchComponent = (route: string) => {
      const queryStr = parseQs(route);
      switch (queryStr.x) {
        case 'config':
          selected.value = 0;
          break;
        case 'stream_gallery':
          selected.value = 1;
          break;
        case 'add_source':
          selected.value = 1;
          setTimeout(() => {
            showAddSource.value = true;
          }, 1);
          break;
        case 'fr_train':
          selected.value = 3;
          break;
        default:
          selected.value = 0;
      }
    };

    watch(activeLeftMenu, (newValue: MenuLink) => {
      switchComponent(<any>newValue.route);
    });

    onMounted(() => {
      const splits = window.location.href.split('?');
      if (splits&&splits.length == 2){
        nextTick().then(() => {
          switchComponent(splits[1]);
        }).catch(console.error);
      }
    });

    onBeforeRouteUpdate((to: any, from: any) => {
      const toQs = parseQs(to.fullPath);
      const fromQs = parseQs(from.fullPath);
      if (toQs.x && fromQs.x) {
        if (toQs.x === 'config' && fromQs.x === 'ai') {
          selected.value = 0;
          return;
        }
        if (toQs.x === 'fr_train' && fromQs.x === 'ai') {
          selected.value = 3;
          return;
        }
      }
      switch (fromQs.x) {
        case 'ai':
          selected.value = 1;
          break;
      }
    });


    return {
      selected,
      showAddSource,
      onSourceSettingsSave() {
        showAddSource.value = false;
      }
    };
  }
};
</script>

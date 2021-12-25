<template>
  <div class='q-pa-sm'>
    <q-banner class='bg-primary text-white'>
      {{ nodeName }}
    </q-banner>
    <NodeConfig node-address='127.0.0.1' />
  </div>
</template>

<script lang='ts'>
import NodeConfig from 'components/NodeConfig.vue';
import { computed } from 'vue';
import { useStore } from 'src/store';

export default {
  name: 'Node',
  components: { NodeConfig },
  setup() {
    const $store = useStore();
    const nodeName = computed(() => $store.getters['settings/activeTab']);

    return { nodeName };
  }
};
</script>

<style scoped>

</style>

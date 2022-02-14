<template>
  <q-banner inline-actions rounded class='bg-cyan text-white' :dense='dense'>
    <label style='text-transform: uppercase;font-size: medium;'>{{ activeTab.name }}</label>
    <template v-slot:action>
      <q-btn v-if='showSave' flat push label='Save' icon='save' @click='onSave' />
      <q-btn v-if='showDelete' flat push label='Remove' icon='delete' @click='onDelete' />
      <q-btn v-if='showRestore' flat push label='Restore' icon='restore_page' @click='onRestore' />
    </template>
  </q-banner>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'src/store';

export default {
  name: 'CommandBar',
  emits: ['on-save', 'on-delete', 'on-restore'],

  props: {
    showSave: {
      type: Boolean,
      default: true
    },
    showDelete: {
      type: Boolean,
      default: true
    },
    showRestore: {
      type: Boolean,
      default: true
    }
  },

  setup(props, { emit }) {
    const $store = useStore();
    const activeTab = computed(() => $store.getters['settings/activeTab']);//active node ip
    const dense = computed(() => $store.getters['settings/dense']);

    return {
      dense,
      activeTab,
      onSave(e) {
        emit('on-save', e);
      },
      onDelete(e) {
        emit('on-delete', e);
      },
      onRestore(e) {
        emit('on-restore', e);
      }
    };
  }
};
</script>

<style scoped>

</style>

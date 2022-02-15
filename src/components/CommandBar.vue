<template>
  <q-banner inline-actions rounded class='bg-cyan text-white' :dense='dense'>
    <label style='text-transform: uppercase;font-size: medium;'>{{ activeTab.name }}</label>
    <template v-slot:action>
      <q-btn v-if='showSave' flat push label='Save' icon='save' @click='onSave' :disable='inactiveSave'>
        <q-inner-loading :showing='inactiveSave' />
      </q-btn>
      <q-btn v-if='showDelete' flat push label='Remove' icon='delete' @click='onDelete' :disable='inactiveDelete'>
        <q-inner-loading :showing='inactiveDelete' />
      </q-btn>
      <q-btn v-if='showRestore' flat push label='Restore' icon='restore_page' @click='onRestore' :disable='inactiveRestore'>
        <q-inner-loading :showing='inactiveRestore' />
      </q-btn>
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
    inactiveSave:{
      type: Boolean,
      default: false
    },
    showDelete: {
      type: Boolean,
      default: true
    },
    inactiveDelete:{
      type: Boolean,
      default: false
    },
    showRestore: {
      type: Boolean,
      default: true
    },
    inactiveRestore:{
      type: Boolean,
      default: false
    },
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

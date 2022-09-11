<template>
  <q-btn v-if='showSave' flat push :label="$t('save')" icon='save' @click='onSave' :disable='inactiveSave'>
    <q-inner-loading :showing='inactiveSave' />
  </q-btn>
  <q-btn v-if='showDelete' flat push :label="$t('remove')"  icon='delete' @click='onDelete' :disable='inactiveDelete'>
    <q-inner-loading :showing='inactiveDelete' />
  </q-btn>
  <q-btn v-if='showRestore' flat push :label="$t('restore')"  icon='restore_page' @click='onRestore' :disable='inactiveRestore'>
    <q-inner-loading :showing='inactiveRestore' />
  </q-btn>
</template>

<script>
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
    return {
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

<template>
  <q-btn-group unelevated>
    <q-btn v-if='showSave' flat push :label="$t('save')" icon='save' @click='onSave' :disable='inactiveSave||disable'>
      <q-inner-loading :showing='inactiveSave'/>
    </q-btn>
    <q-btn v-if='showDelete' flat push :label="$t('remove')" icon='delete' @click='onDelete' :disable='inactiveDelete||disable'>
      <q-inner-loading :showing='inactiveDelete'/>
    </q-btn>
    <q-btn v-if='showRestore' flat push :label="$t('restore')" icon='restore_page' @click='onRestore' :disable='inactiveRestore||disable'>
      <q-inner-loading :showing='inactiveRestore'/>
    </q-btn>
    <q-btn v-if='showRefresh' flat push :label="$t('refresh')" icon='refresh' @click='onRefresh' :disable='inactiveRefresh||disable'>
      <q-inner-loading :showing='inactiveRefresh'/>
    </q-btn>
  </q-btn-group>
</template>

<script>
export default {
  name: 'CommandBar',
  emits: ['on-save', 'on-delete', 'on-restore', 'on-refresh'],

  props: {
    showSave: {
      type: Boolean,
      default: true
    },
    inactiveSave: {
      type: Boolean,
      default: false
    },
    showDelete: {
      type: Boolean,
      default: true
    },
    inactiveDelete: {
      type: Boolean,
      default: false
    },
    showRestore: {
      type: Boolean,
      default: true
    },
    inactiveRestore: {
      type: Boolean,
      default: false
    },
    showRefresh: {
      type: Boolean,
      default: true
    },
    inactiveRefresh: {
      type: Boolean,
      default: false
    },
    disable: {
      type: Boolean,
      default: false
    }
  },

  setup(props, {emit}) {
    return {
      onSave(e) {
        emit('on-save', e);
      },
      onDelete(e) {
        emit('on-delete', e);
      },
      onRestore(e) {
        emit('on-restore', e);
      },
      onRefresh(e) {
        emit('on-refresh', e);
      }
    };
  }
};
</script>

<style scoped>

</style>

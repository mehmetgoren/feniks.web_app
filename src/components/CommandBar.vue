<template>
  <q-btn-group unelevated>
    <q-btn v-if='props.showSave' flat push :label="$t('save')" icon='save' @click='onSave' :disable='props.inactiveSave||props.disable'>
      <q-inner-loading :showing='props.inactiveSave' />
    </q-btn>
    <q-btn v-if='props.showDelete' flat push :label="$t('remove')" icon='delete' @click='onDelete'
           :disable='props.inactiveDelete||props.disable'>
      <q-inner-loading :showing='props.inactiveDelete' />
    </q-btn>
    <q-btn v-if='props.showRestore' flat push :label="$t('restore')" icon='restore_page' @click='onRestore'
           :disable='props.inactiveRestore||props.disable'>
      <q-inner-loading :showing='props.inactiveRestore' />
    </q-btn>
    <q-btn v-if='props.showRefresh' flat push :label="$t('refresh')" icon='refresh' @click='onRefresh'
           :disable='props.inactiveRefresh||props.disable'>
      <q-inner-loading :showing='props.inactiveRefresh' />
    </q-btn>
  </q-btn-group>
</template>

<script lang="ts" setup>

const emit = defineEmits(['on-save', 'on-delete', 'on-restore', 'on-refresh']);

const props = defineProps({
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
});

const onSave = (e: any) => {
  emit('on-save', e);
};
const onDelete = (e: any) => {
  emit('on-delete', e);
};
const onRestore = (e: any) => {
  emit('on-restore', e);
};
const onRefresh = (e: any) => {
  emit('on-refresh', e);
};


</script>

<style scoped>

</style>

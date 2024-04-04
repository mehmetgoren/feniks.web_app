<template>
  <q-card class="my-card" flat bordered>
    <q-card-section class="bg-cyan text-white">
      <div class="text-subtitle2">
        <label style='text-transform: uppercase;font-size: medium'>{{ $t('ui_config') }}</label>
      </div>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <q-input v-model='uiConfig.gs_width' filled dense :label="$t('grid_stack_row')" />
      <q-space style='height: 10px;' />
      <q-input type="number" v-model.number='uiConfig.gs_height' filled dense :label="$t('grid_stack_column')" />
      <q-space style='height: 10px;' />
      <q-input type="number" v-model.number='uiConfig.booster_interval' filled dense :label="$t('booster_interval')" />
      <q-space style='height: 10px;' />
      <q-input type="number" v-model.number='uiConfig.seek_to_live_edge_internal' filled dense :label="$t('seek_to_live_edge_internal')" />
      <q-space style='height: 10px;' />
      <q-btn color='cyan' @click='onSaveUiConfig' icon="save" dense>
        <div style="margin: 4px">{{$t('save')}}</div>
      </q-btn>
    </q-card-section>
  </q-card>
</template>

<script lang="ts" setup>

import { ref } from 'vue';
import { UiConfig } from 'src/utils/models/ui_config';
import { LocalService } from 'src/utils/services/local_service';

const emit = defineEmits(['onSave']);

const localService = new LocalService();
const uiConfig = ref<UiConfig>(localService.getUiConfig());

const onSaveUiConfig = () => {
  localService.setUiConfig(uiConfig.value);
  emit('onSave');
};

</script>

<style scoped>

</style>

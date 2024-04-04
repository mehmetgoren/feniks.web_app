<template>
  <q-table :title="$t('ai_modules')" :rows='aiModules'
           :columns='aiModuleColumns' row-key='node_address' :filter='filter'
           :loading-label="$t('loading')" :no-data-label="$t('no_data')" :no-results-label="$t('no_results')"
           :selected-rows-label="() => $t('selected_rows')" :rows-per-page-label="$t('rows_per_page')">
    <template v-slot:top-left>
      <q-btn round color='primary' icon='add' @click='onAddAiModule'>
        <q-tooltip>{{ $t('add') }}</q-tooltip>
      </q-btn>
    </template>
    <template v-slot:top-right>
      <q-btn color='primary' :label="$t('refresh')" icon='restore_page' @click='dataBind' :disable='showLoading'>
        <q-inner-loading :showing='showLoading' />
      </q-btn>
      <q-space style="margin-right: 15px;" />
      <q-input borderless dense debounce='300' v-model='filter' :placeholder="$t('search')">
        <template v-slot:append>
          <q-icon name='search' />
        </template>
      </q-input>
    </template>
    <template v-slot:body-cell-edit='props'>
      <q-td :props='props'>
        <div>
          <q-btn round color='secondary' icon='edit' @click='onEditAiModule(props.row)' />
        </div>
      </q-td>
    </template>
    <template v-slot:body-cell-delete='props'>
      <q-td :props='props'>
        <div>
          <q-btn round color='deep-orange' icon='delete' @click='onDeleteAiModule(props.row)' />
        </div>
      </q-td>
    </template>
  </q-table>

  <q-dialog v-model="showEdit">
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Close icon</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-separator />

      <q-card-section>
        <q-input v-model='selectedAiModule.name' filled dense :label="$t('name')" />
        <q-space style='height: 10px;' />
        <q-input v-model='selectedAiModule.description' filled dense :label="$t('description')" />
        <q-space style='height: 10px;' />
        <q-checkbox v-model='selectedAiModule.enabled' color='cyan' dense
                    :label="selectedAiModule.enabled ? $t('enabled') : $t('disabled')" />
        <q-space style='height: 10px;' />
        <q-input v-model='selectedAiModule.api_url' filled dense :label="$t('api_url')" />
        <q-space style='height: 10px;' />
        <q-input v-model.number='selectedAiModule.threshold' type="number" filled dense :label="$t('threshold')" />
        <q-space style='height: 10px;' />
        <q-input v-model='selectedAiModule.label_field' filled dense :label="$t('label_field')" />
        <q-space style='height: 10px;' />
        <q-checkbox v-model='selectedAiModule.motion_detection_enabled' color='cyan' dense
                    :label="`${t('motion_detection_enabled')} ${(selectedAiModule.motion_detection_enabled ? t('enabled') : t('disabled'))}`" />
        <q-space style='height: 10px;' />
        <q-checkbox v-model='selectedAiModule.persistence_enabled' color='cyan' dense
                    :label="`${t('persistence_enabled')} ${(selectedAiModule.persistence_enabled ? t('enabled') : t('disabled'))}`" />
        <q-space style='height: 10px;' />
        <q-checkbox v-model='selectedAiModule.notification_enabled' color='cyan' dense
                    :label="`${t('notification_enabled')} ${(selectedAiModule.notification_enabled ? t('enabled') : t('disabled'))}`" />
        <q-space style='height: 10px;' />
      </q-card-section>

      <q-separator />
      <q-card-section>
        <q-btn color='cyan' @click='onSaveAiModule' icon="save" dense>
          <div style="margin: 4px">{{ $t('save') }}</div>
        </q-btn>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { NodeService } from 'src/utils/services/node_service';
import { AiModuleModel } from 'src/utils/models/ai_module_model';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';

const createEmptyAiModule = () => {
  return {
    name: 'new_ai_module',
    description: 'New AI Module',
    enabled: true,
    api_url: 'http://',
    threshold: .4,
    label_field: 'label',
    motion_detection_enabled: true,
    persistence_enabled: true,
    notification_enabled: true
  };
};

const { t } = useI18n({ useScope: 'global' });
const $q = useQuasar();
const nodeService = new NodeService();
const aiModules = ref<AiModuleModel[]>([]);
const selectedAiModule = ref<AiModuleModel>(createEmptyAiModule());
const filter = ref<string>('');
const showEdit = ref<boolean>(false);
const showLoading = ref<boolean>(false);

const dataBind = async () => {
  aiModules.value = await nodeService.getAiModules();
};

onMounted(async () => {
  await dataBind();
});

const onAddAiModule = () => {
  showEdit.value = true;
  selectedAiModule.value = createEmptyAiModule();
};

const onSaveAiModule = () => {
  nodeService.saveAiModule(selectedAiModule.value)
    .then(() => {
      $q.notify({ type: 'positive', message: 'AI Module saved successfully' });
      showEdit.value = false;
      dataBind();
    });
};

const onEditAiModule = (aiModule: AiModuleModel) => {
  selectedAiModule.value = { ...aiModule };
  showEdit.value = true;
};

const onDeleteAiModule = (aiModule: AiModuleModel) => {
  $q.dialog({
    title: 'Confirm',
    message: 'Are you sure you want to delete this AI Module?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    nodeService.deleteAiModule(aiModule.name)
      .then(() => {
        $q.notify({ type: 'positive', message: 'AI Module deleted successfully' });
        dataBind();
      });
  });
};

const aiModuleColumns = createAiModuleColumns(t);

function createAiModuleColumns(t: any) {
  const format = (val: any) => val ? 'Yes' : 'No';
  const align = 'left';
  return [
    { name: 'name', align, label: t('name'), field: 'name', sortable: true },
    { name: 'description', align, label: t('description'), field: 'description', sortable: true },
    { name: 'enabled', align, label: t('enabled'), field: 'enabled', format },
    { name: 'threshold', align, label: t('threshold'), field: 'threshold', sortable: true },
    { name: 'label_field', align, label: t('label_field'), field: 'label_field', sortable: true },
    {
      name: 'motion_detection_enabled',
      align,
      label: t('motion_detection_enabled'),
      field: 'motion_detection_enabled',
      format,
      sortable: true
    },
    { name: 'persistence_enabled', align, label: t('persistence_enabled'), field: 'persistence_enabled', format },
    { name: 'notification_enabled', align, label: t('notification_enabled'), field: 'notification_enabled', format },
    { name: 'edit', align, label: t('edit'), field: 'edit' },
    { name: 'delete', align, label: t('delete'), field: 'delete' }
  ];
}

</script>

<style scoped>

</style>

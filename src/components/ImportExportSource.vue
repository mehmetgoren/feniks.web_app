<template>
  <table>
    <tr>
      <td>
        <q-btn color="positive" glossy :label="$t('export_cameras')" @click="showImportList = true" />
      </td>
    </tr>
    <tr>
      <td>
        <q-uploader :factory='onImport' color="amber" text-color="black" :label="$t('import_cameras')" no-thumbnails
                    style="max-width: 300px" accept=".json" />
      </td>
    </tr>
  </table>

  <q-dialog v-model='showImportList' full-width full-height transition-show='flip-down' transition-hide='flip-up'>
    <div class="q-pa-md no-border no-box-shadow">
      <q-table :title="$t('sources')" :rows="sources" :columns="sourceColumns" row-key="id" selection="multiple"
               v-model:selected="selectedSources" :filter="sourceFilter" :pagination="{rowsPerPage: 0}"
               :no-data-label="$t('no_data')" :rows-per-page-label="$t('rows_per_page')">
        <template v-slot:top-left>
          <q-btn icon='refresh' :label="$t('export')" color='positive' style='margin-right: 15px;' @click='onExport' />
        </template>
        <template v-slot:top-right>
          <q-btn icon='refresh' :label="$t('refresh')" color='secondary' style='margin-right: 15px;' @click='sourceDatabind' />
          <q-input borderless dense debounce='300' v-model='sourceFilter' :placeholder="$t('search')">
            <template v-slot:append>
              <q-icon name='search' />
            </template>
          </q-input>
        </template>
      </q-table>
    </div>
  </q-dialog>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { NodeService } from 'src/utils/services/node_service';
import { SourceModel } from 'src/utils/models/source_model';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { downloadObjectAsJson, toBase64 } from 'src/utils/utils';

const { t } = useI18n({ useScope: 'global' });
const $q = useQuasar();
const showImportList = ref<boolean>(false);
const nodeService = new NodeService();
const sources = ref<SourceModel[]>([]);
const selectedSources = ref<SourceModel[]>([]);
const sourceFilter = ref<string>('');

const sourceDatabind = async () => {
  sources.value = await nodeService.getSourceList();
};

onMounted(async () => {
  await sourceDatabind();
});

const onExport = () => {
  if (selectedSources.value.length < 1) {
    $q.notify({ message: t('v_please_select_at_least_a_camera'), color: 'red' });
    return;
  }

  downloadObjectAsJson(selectedSources.value, t('sources'));
};

const onImport = async (files: any) => {
  if (!files || !files.length || files.length !== 1) {
    return false;
  }
  const file = files[0];

  let b64 = await toBase64(file);
  b64 = b64.split(',')[1];
  const json = atob(b64);
  const sourceModels: SourceModel[] = JSON.parse(json);
  const filteredSourceModels: SourceModel[] = [];

  for (const sourceModel of sourceModels) {
    if (!sourceModel.id || !sourceModel.name || !sourceModel.address) continue;
    filteredSourceModels.push(sourceModel);
  }

  if (!filteredSourceModels.length) {
    $q.notify({ message: t('v_invalid_source_json'), color: 'red' });
    return false;
  }

  for (const source of filteredSourceModels) {
    await nodeService.saveSource(source);
  }

  $q.notify({ message: t('sources_imported_successfully'), color: 'green' });
  window.location.reload();

  return true;
};

function createSourceColumns() {
  const align = 'left';
  return [
    { name: 'brand', align, label: t('brand'), field: 'brand', sortable: true },
    { name: 'name', align, label: t('name'), field: 'name', sortable: true },
    { name: 'address', align, label: t('address'), field: 'address', sortable: true }
  ];
}

const sourceColumns = createSourceColumns();

</script>

<style scoped>

</style>

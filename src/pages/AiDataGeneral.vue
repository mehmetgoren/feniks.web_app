<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col-12">
        <q-toolbar :class="'bg-' + color + ' text-white'">
          <q-btn flat round dense icon="auto_awesome" class="q-mr-sm" />
          <q-toolbar-title autocapitalize="characters">{{$t('ai_data')}} - {{ getModuleDescription() }}</q-toolbar-title>
          <q-space />
        </q-toolbar>
      </div>
    </div>
    <div class="row"  style="margin-top: 5px;">
      <div class="col-xs-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
        <DateTimeSelector :width-date="200" :width-time="125" :label-date="$t('start_date')" :label-time="$t('start_time')"
                          :color='color' :dense="true" :show-hour='true' :allow-minute-selection="true" @date-time-changed='onStartDateTimeChanged'
                          :date-string="parseDate(params.start_date_time_str)" :time-string="parseTime(params.start_date_time_str)"
                          :disable="loading" :show-date="true" />
      </div>
      <div class="col-xs-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
        <DateTimeSelector :width-date="200" :width-time="125" :label-date="$t('end_date')" :label-time="$t('end_time')"
                          :color='color' :dense="true" :show-hour='true' :allow-minute-selection="true" @date-time-changed='onEndDateTimeChanged'
                          :date-string="parseDate(params.end_date_time_str)" :time-string="parseTime(params.end_date_time_str)"
                          :disable="loading" :show-date="true" />
      </div>
    </div>
    <div class="row">
      <div class="col-xs-12 col-sm-6 col-md-4 col-lg-4 col-xl-4">
        <q-select class="bg-white" dense emit-value map-options filled v-model='params.module' :options='aiModulesOptions'
                  :label="$t('select_ai_module')" transition-show='scale' transition-hide='scale'
                  :disable="loading" style="width: 300px;margin-right: 15px;" clearable @update:model-value="dataBind"/>
      </div>
      <div class="col-xs-12 col-sm-6 col-md-4 col-lg-4 col-xl-4">
        <q-input filled v-model.trim='params.label' :label="$t('label')" :color='color'
                 style="max-width: 300px;margin-top: 3px;" dense :disable="loading">
          <template v-if="params.label" v-slot:append>
            <q-icon name="cancel" @click="onLabelClear" class="cursor-pointer" />
          </template>
        </q-input>
      </div>
      <div class="col-xs-12 col-sm-6 col-md-4 col-lg-4 col-xl-4">
        <q-select emit-value map-options filled style="max-width: 300px;margin-top: 3px;" @update:model-value="onSourceIdChanged"
                  v-model='params.source_id' :color='color' option-value="id" option-label="name"
                  :options='sources' :label="$t('camera')" clearable dense :disable="loading" />
      </div>
    </div>
    <q-space style="margin-bottom: 5px;" />
    <div class="row">
      <div class="col-12">
        <q-table :title="$t('ai_data')" :color="color" :rows="rows" :columns="columns" row-key="id" v-model:pagination="pagination"
                 :loading="loading" @request="onRequest" binary-state-sort
                 :rows-per-page-label="$t('rows_per_page')" :no-data-label="$t('no_data')">
          <template v-slot:body='props'>
            <q-tr :props='props' @click='onRowClick(props.row)' :style='{"backgroundColor": props.expand ? color:"white", "cursor":"pointer"}'>
              <q-td key='base64_image'>
                <q-img :src='props.row.image_file_name' width="100px" />
              </q-td>
              <q-td key='source_id' :props='props'>{{ sourceDic[props.row.source_id].name }}</q-td>
              <q-td key='label' :props='props'>{{ props.row.detected_object.label }}</q-td>
              <q-td key='score' :props='props'>{{ props.row.detected_object.score }}</q-td>
              <q-td key='created_at' :props='props'>{{ props.row.created_at.toLocaleString() }}</q-td>
            </q-tr>
          </template>
          <template v-slot:top-right>
            <q-btn :color="color" icon="search" :label="$t('search')" no-caps @click="dataBind">
              <q-inner-loading :color="color" :showing="loading" />
            </q-btn>
            <q-space style="margin-left: 5px;" />
            <q-btn :color="color" icon="archive" :label="$t('export_to_csv')" no-caps @click="onExportData">
              <q-inner-loading :color="color" :showing="loadingExport" />
            </q-btn>
            <q-space style="margin-left: 5px;" />
            <q-btn icon='refresh' :label="$t('refresh')" :color='color' @click='dataBind' />
          </template>
          <template v-slot:loading>
            <q-inner-loading showing :color="color" />
          </template>
        </q-table>
      </div>
    </div>
  </div>
  <q-dialog v-model="showDialog" transition-show="rotate" transition-hide="rotate">
    <q-layout view='lHh lpr lFf' container class='shadow-2 rounded-borders' style="max-height: 70%;max-width: 85%;">
      <q-header elevated :class="'bg-' + color">
        <q-toolbar>
          <q-btn flat round dense icon='auto_awesome' />
          <q-toolbar-title>
            {{ sourceDic[selectedItem?.source_id ?? ''].name }} {{ params.module }}
          </q-toolbar-title>
          <q-space />
          <q-btn dense flat icon='close' v-close-popup>
            <q-tooltip :class="'bg-' + color  +  ' text-primary'">{{ $t('close') }}</q-tooltip>
          </q-btn>
        </q-toolbar>
      </q-header>
      <q-page-container>
        <q-page padding style='background-color: whitesmoke;'>
          <div class="row">
            <div class="col-8">
              <VideoPlayer :auto-play="true" @on-player-ready="onVideoPlayerReady" />
            </div>
            <div class="col-4">
              <div style="margin-left: 15px;">
                <div style="float: left;width: 100%">
                  <q-img v-if="selectedItem" :src="selectedItem.image_file_name">
                  </q-img>
                </div>
                <div style="float: left;width: 100%;margin-top: 5px;">
                  <q-table :rows="detailRows" :color="color" :columns="detailColumns" :hide-pagination="true" :hide-header="true"
                           :rows-per-page-label="$t('rows_per_page')" :no-data-label="$t('no_data')">
                    <template v-slot:top-left>
                      <q-btn :color='color' dense icon-right='theaters' :label="$t('download_video')"
                             @click='handleDownloadVideo(selectedItem.video_file.name, "clip")'>
                        <q-inner-loading :loading="downloadVideoLoading" />
                      </q-btn>
                      <q-btn :color='color' dense icon-right='photo_camera' :label="$t('open_snapshot')"
                             @click='handleOpenSnapshot(selectedItem.image_file_name)'
                             style="margin-left: 5px;" />
                    </template>
                    <template v-slot:top-right>
                      <q-btn color='red' dense icon-right='delete' :label="$t('delete_event')" @click='handleDelete()' />
                    </template>
                  </q-table>
                </div>
              </div>
            </div>
          </div>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-dialog>

  <q-dialog v-model="showDelete" transition-show="rotate" transition-hide="rotate">
    <q-card>
      <q-card-section>
        <div class="text-h6">{{ $t('deletion_an_ai_data') }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-checkbox v-model="deleteRecordTemp" :label="$t('delete_record_permanently')" disable />
        <q-checkbox v-model="dlt.delete_image" :label="$t('delete_record_permanently2')" />
        <q-checkbox v-model="dlt.delete_video" :label="$t('delete_record_permanently3')" />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="$t('cancel')" color="primary" v-close-popup />
        <q-btn flat :label="$t('delete')" color="red" @click="onDoDelete" />
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>

<script lang="ts" setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { AiDataDeleteOptions, AiDataDto, QueryAiDataAdvancedParams, SortBy } from 'src/utils/models/ai_data_dtos';
import VideoPlayer from 'src/components/VideoPlayer.vue';
import DateTimeSelector from 'components/DateTimeSelector.vue';
import { SourceModel } from 'src/utils/models/source_model';
import { NodeService } from 'src/utils/services/node_service';
import { databindWithLoading, deepCopy, downloadFile, getAddedHour, getPrevHourDatetime, getTodayString, myDateToJsDate } from 'src/utils/utils';
import { setUpDatesAndPaths } from 'src/utils/path_utils';
import { useQuasar, exportFile } from 'quasar';
import { useI18n } from 'vue-i18n';
import { AiModuleModel } from 'src/utils/models/ai_module_model';
import { SelectOption } from 'src/utils/services/local_service';


const { t } = useI18n({ useScope: 'global' });
const $q = useQuasar();
const color = ref<string>('orange');
const sources = ref<SourceModel[]>([]);
const sourceDic = ref<any>({});
const params = ref<QueryAiDataAdvancedParams>({
  module: '',
  source_id: '',
  start_date_time_str: getPrevHourDatetime(1),
  end_date_time_str: `${getTodayString()}_${getAddedHour(1)}`,
  label: '',
  no_preparing_video_file: true,
  sort: {
    enabled: true,
    field: 'created_date',
    sort: SortBy.Descending
  },
  paging: {
    enabled: true,
    page: 1,
    take: 10
  }
});

const nodeService = new NodeService();
const localService = nodeService.LocalService
const aiModulesOptions = ref<SelectOption[]>([]);
const rows = ref<AiDataDto[]>([]);
const pagination = ref({
  sortBy: 'created_date',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
});
const loading = ref<boolean>(false);
const showDialog = ref<boolean>(false);
const selectedItem = ref<AiDataDto | null>(null);
const detailRows = ref<KeyValuePair[]>([]);
const downloadVideoLoading = ref<boolean>(false);
const showDelete = ref<boolean>(false);
const loadingExport = ref<boolean>(false);
const columns = createColumns(true);
const detailColumns = createDetailColumns();
const deleteRecordTemp = ref<boolean>(true);
const dlt = ref<AiDataDeleteOptions>({ delete_image: false, delete_video: false });
let videoPlayer: any = null;

async function dataBind() {
  await databindWithLoading(loading, async () => {
    pagination.value.rowsNumber = await nodeService.queryAiDataCount(params.value);
    const items = await nodeService.queryAiDataAdvanced(params.value);
    rows.value = setUpDatesAndPaths(localService, items);
  });
}

onMounted(async () => {
  aiModulesOptions.value = (await nodeService.getAiModules()).map((item:AiModuleModel) => ({ label: item.description, value: item.name }));

  const sourceList = await nodeService.getSourceList();
  for (const s of sourceList) {
    sourceDic.value[<string>s.id] = s;
  }
  sources.value = sourceList;

  await dataBind();

  //capture enter key
  document.addEventListener('keydown', onKeyEnter);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeyEnter);
});

function onKeyEnter(e: any){
  if (e.key === 'Enter') {
    dataBind();
  }
}

const onStartDateTimeChanged = (dateTimeStr: string) => {
  params.value.start_date_time_str = dateTimeStr;
  void dataBind();
};
const onEndDateTimeChanged = (dateTimeStr: string) => {
  params.value.end_date_time_str = dateTimeStr;
  void dataBind();
};

const onSourceIdChanged = (sourceId: string) => {
  params.value.source_id = sourceId;
  void dataBind();
};

const onLabelClear = () => {
  params.value.label = '';
};

function parseDate(dateStr: string): string {
  const splits = dateStr.split('_');
  return `${splits[0]}-${splits[1]}-${splits[2]}`;
}

function parseTime(timeStr: string): string {
  const splits = timeStr.split('_');
  return splits[splits.length - 1] + ':00';
}

function onRowClick(row: AiDataDto) {
  if (isVfAvailable(row)) {
    selectedItem.value = row;
    nextTick(() => {
      setTimeout(() => {
        if (videoPlayer != null) {
          videoPlayer.src(row.video_file.name);
          videoPlayer.currentTime(Math.max(row.video_file.object_appears_at - 2, 0));
          videoPlayer.play();
        }
      }, 250);
    }).catch(console.error);
  }

  detailRows.value.length = 0;
  detailRows.value.push({ key: t('label'), value: row.detected_object?.label??'' });
  detailRows.value.push({ key: t('score'), value: row.detected_object?.score?.toString() ?? '0' });
  //@ts-ignore
  detailRows.value.push({ key: t('created_at'), value: `${row.created_at.toLocaleDateString()} ${row.created_at.toLocaleTimeString()}` });
  detailRows.value.push({ key: t('appears_at'), value: (row.video_file?.object_appears_at?.toString() ?? '0') + ' sec.' });

  showDialog.value = true;
}

const isVfAvailable = (item: AiDataDto): boolean => {
  return (item?.video_file?.name?.length ?? 0) > 0;
};

function handleDownloadVideo(url: string, fileName: string) {
  downloadVideoLoading.value = true;
  try {
    downloadFile(url, fileName, 'video/mp4');
  } finally {
    downloadVideoLoading.value = false;
  }
}

function handleOpenSnapshot(url: string) {
  const a = document.createElement('a');
  try {
    a.href = url;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
  } finally {
    document.body.removeChild(a);
  }
}

function handleDelete() {
  showDelete.value = true;
}

async function onDoDelete() {
  if (selectedItem.value === null) {
    $q.notify({ message: t('not_enough_arg_delete_record'), color: 'red' });
    return;
  }
  showDelete.value = false;
  loading.value = true;
  try {
    dlt.value.module = params.value.module;
    dlt.value.id = selectedItem.value.id;
    await nodeService.deleteAiData(dlt.value);
    await dataBind();
    $q.notify({ message: t('record_deleted'), color: 'green' });
  } finally {
    loading.value = false;
    showDialog.value = false;
  }
}

function wrapCsvValue(val: any, formatFn?: any, row?: AiDataDto): string {
  let formatted = formatFn !== void 0
    ? formatFn(val, row)
    : val;

  formatted = formatted === void 0 || formatted === null
    ? ''
    : String(formatted);

  formatted = formatted.split('"').join('""');

  return `"${formatted}"`;
}

async function onExportData() {
  loadingExport.value = true;
  try {
    const copyParams: QueryAiDataAdvancedParams = deepCopy(params.value);
    copyParams.paging.enabled = false;
    const records = await nodeService.queryAiDataAdvanced(copyParams);
    for (const record of records) {
      record.created_at = myDateToJsDate(record.created_at).toUTCString();
      record.source_id = sourceDic.value[record.source_id].name;
    }
    const columns = createColumns(false);
    const content = [columns.map(col => wrapCsvValue(col.label))].concat(
      records.map(record => columns.map(col => wrapCsvValue(
        typeof col.field === 'function'
          //@ts-ignore
          ? col.field(record)
          //@ts-ignore
          : record[col.field === void 0 ? col.name : col.field],
        //@ts-ignore
        col.format,
        record
      )).join(','))
    ).join('\r\n');

    console.log(content);

    const status = exportFile(
      'table-export.csv',
      content,
      'text/csv'
    );

    if (status !== true) {
      $q.notify({
        message: t('browser_no_allow_download'),
        color: 'negative',
        icon: 'warning'
      });
    }
  } finally {
    loadingExport.value = false;
  }
}

const onVideoPlayerReady = (player: any) => {
  videoPlayer = player;
};

async function onRequest(props: any) {
  pagination.value = props.pagination;
  const { page, rowsPerPage, sortBy, descending } = pagination.value;
  loading.value = true;
  try {
    const p = params.value.paging;
    p.page = page;
    p.take = rowsPerPage;

    const s = params.value.sort;
    s.field = sortBy;
    s.sort = descending ? SortBy.Descending : SortBy.Ascending;

    await dataBind();
  } finally {
    loading.value = false;
  }
}

function createColumns(includeImageColumn: boolean): any[] {
  const align = 'center';
  const ret = [];
  if (includeImageColumn) {
    ret.push({ name: 'image_file_name', align: 'left', label: '', field: 'image_file_name', sortable: false });
  }
  ret.push({ name: 'source_id', align, label: t('camera'), field: 'source_id', sortable: true });
  ret.push({ name: 'label', align, label: t('label'), field: 'label', sortable: true });
  ret.push({ name: 'score', align, label: t('score'), field: 'score', sortable: true });
  ret.push({ name: 'created_at', align, label: t('created_at'), field: 'created_at', sortable: true });

  return ret;
}

function createDetailColumns(): any[] {
  const align = 'left';
  return [
    { name: 'key', align, label: '', field: 'key', sortable: false },
    { name: 'value', align, label: '', field: 'value', sortable: true }
  ];
}


function getModuleDescription(): string{
  return aiModulesOptions.value.find(x => x.value === params.value.module)?.label ?? t('all');
}


interface KeyValuePair {
  key: string;
  value: string;
}
</script>

<style scoped>

</style>

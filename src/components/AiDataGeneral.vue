<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col-12">
        <q-toolbar :class="'bg-' + color + ' text-white'">
          <q-btn flat round dense :icon="selectedFeature.icon" class="q-mr-sm"/>
          <q-toolbar-title autocapitalize="characters">{{ selectedFeature.name.toLocaleUpperCase() }}</q-toolbar-title>
          <q-tabs v-model="tab" shrink :active-bg-color="color">
            <q-tab name="od" icon="collections" label="Object Detection"/>
            <q-tab name="fr" icon="face" label="Face Recognition"/>
            <q-tab name="alpr" icon="drive_eta" label="License Plate Recognition"/>
          </q-tabs>
          <q-space/>
        </q-toolbar>
      </div>
    </div>
    <div class="row" style="margin-top: 15px;">
      <div class="col-3">
        <DateTimeSelector :width-date="200" :width-time="125" label-date="Start Date" label-time="Start Time" :color='color' :dense="false"
                          :show-hour='true' :allow-minute-selection="true" @date-time-changed='onStartDateTimeChanged'
                          :date-string="parseDate(params.start_date_time_str)" :time-string="parseTime(params.start_date_time_str)"/>
      </div>
      <div class="col-3">
        <DateTimeSelector :width-date="200" :width-time="125" label-date="End Date" label-time="End Time" :color='color' :dense="false"
                          :show-hour='true' :allow-minute-selection="true" @date-time-changed='onEndDateTimeChanged'/>
      </div>
      <div class="col-3">
        <q-select emit-value map-options filled style="width: 300px" @update:model-value="onSourceIdChanged"
                  v-model='params.source_id' :color='color' option-value="id" option-label="name"
                  :options='sources' label='Camera' clearable/>
      </div>
      <div class="col-3">
        <q-input filled v-model.trim='params.pred_class_name' label='Label' :color='color' @update:model-value="onLabelChanged" style="width: 300px">
          <template v-if="params.pred_class_name" v-slot:append>
            <q-icon name="cancel" @click="onLabelClear" class="cursor-pointer"/>
          </template>
        </q-input>
      </div>
    </div>
    <q-space style="margin-bottom: 5px;"/>
    <div class="row">
      <div class="col-12">
        <q-table title="AI Data" :color="color" :rows="rows" :columns="columns" row-key="id" v-model:pagination="pagination" :loading="loading"
                 @request="onRequest" binary-state-sort>
          <template v-slot:body='props'>
            <q-tr :props='props' @click='onRowClick(props.row)' :style='{"backgroundColor": props.expand ? color:"white", "cursor":"pointer"}'>
              <q-td key='base64_image'>
                <q-img :src='props.row.image_file_name' width="100px"/>
              </q-td>
              <q-td key='source_id' :props='props'>{{ sourceDic[props.row.source_id].name }}</q-td>
              <q-td key='pred_cls_name' :props='props'>{{ props.row.pred_cls_name }}</q-td>
              <q-td key='pred_score' :props='props'>{{ props.row.pred_score }}</q-td>
              <q-td key='created_at' :props='props'>{{ props.row.created_at.toLocaleString() }}</q-td>
            </q-tr>
          </template>
          <template v-slot:top-right>
            <q-btn icon='refresh' label='Refresh' :color='color' @click='dataBind'/>
          </template>
        </q-table>
      </div>
    </div>
  </div>
  <q-dialog v-model="showDialog" transition-show="rotate" transition-hide="rotate">
    <q-layout view='lHh lpr lFf' container class='shadow-2 rounded-borders' style="max-height: 70%;max-width: 85%;">
      <q-header elevated :class="'bg-' + color">
        <q-toolbar>
          <q-btn flat round dense :icon='selectedFeature.icon'/>
          <q-toolbar-title>
            {{ selectedFeature.name }} by {{ sourceDic[selectedItem.source_id].name }}
          </q-toolbar-title>
          <q-space/>
          <q-btn dense flat icon='close' v-close-popup>
            <q-tooltip :class="'bg-' + color  +  ' text-primary'">Close</q-tooltip>
          </q-btn>
        </q-toolbar>
      </q-header>
      <q-page-container>
        <q-page padding style='background-color: whitesmoke;'>
          <div class="row">
            <div class="col-8">
              <VideoPlayer :auto-play="true" @on-player-ready="onVideoPlayerReady"/>
            </div>
            <div class="col-4">
              <div style="margin-left: 15px;">
                <div style="float: left;width: 100%">
                  <q-img v-if="selectedItem" :src="selectedItem.image_file_name">
                  </q-img>
                </div>
                <div style="float: left;width: 100%;margin-top: 5px;">
                  <q-table :rows="detailRows" :color="color" :columns="detailColumns" :hide-pagination="true" :hide-header="true">
                    <template v-slot:top-left>
                      <q-btn :color='color' dense icon-right='theaters' label='Download Video'
                             @click='handleDownloadVideo(selectedItem.video_file.name, "clip")'>
                        <q-inner-loading :loading="downloadVideoLoading"/>
                      </q-btn>
                      <q-btn :color='color' dense icon-right='photo_camera' label='Open Snapshot' @click='handleOpenSnapshot(selectedItem.image_file_name)'
                             style="margin-left: 5px;"/>
                    </template>
                    <template v-slot:top-right>
                      <q-btn color='red' dense icon-right='delete' label='Delete Event' @click='handleDelete()' />
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
        <div class="text-h6">Deletion of an AI Data</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-checkbox v-model="deleteRecordTemp" label="Delete the Record permanently" disable  />
        <q-checkbox v-model="dlt.delete_image" label="Delete the image and all related other records permanently"  />
        <q-checkbox v-model="dlt.delete_video" label="Delete the video and all related other images and records permanently"  />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn flat label="Delete" color="red" @click="onDoDelete" />
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>

<script lang="ts">
import {nextTick, onMounted, ref, watch} from 'vue';
import {AiDataDeleteOptions, AiDataDto, QueryAiDataAdvancedParams, SelectedAiFeature, SortBy} from 'src/utils/models/ai_data_dtos';
import VideoPlayer from 'src/components/VideoPlayer.vue';
import DateTimeSelector from 'components/DateTimeSelector.vue';
import {SourceModel} from 'src/utils/models/source_model';
import {NodeService} from 'src/utils/services/node_service';
import {downloadFile, getCurrentHour, getPrevHourDatetime, getTodayString} from 'src/utils/utils';
import {setUpDatesAndPaths} from 'src/utils/path_utils';
import {useQuasar} from 'quasar';

export default {
  name: 'AiDataGeneral',
  components: {DateTimeSelector, VideoPlayer},
  setup() {
    const $q = useQuasar();
    const color = ref<string>('deep-purple-14');
    const tab = ref<string>('od');
    const sources = ref<SourceModel[]>([]);
    const sourceDic = ref<any>({});
    const params = ref<QueryAiDataAdvancedParams>({
      ai_type: 0,
      source_id: '',
      start_date_time_str: getPrevHourDatetime(),
      end_date_time_str: `${getTodayString()}_${getCurrentHour()}`,
      pred_class_name: '',
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
    const selectedFeature = ref<SelectedAiFeature>({name: 'Object Detection', icon: 'collections'});
    watch(tab, (newValue: string) => {
      switch (newValue) {
        case 'od':
          color.value = 'deep-purple-14';
          params.value.ai_type = 0;
          selectedFeature.value.name = 'Object Detection';
          selectedFeature.value.icon = 'collections';
          void dataBind();
          break;
        case 'fr':
          color.value = 'deep-orange-7';
          params.value.ai_type = 1;
          selectedFeature.value.name = 'Face Recognition';
          selectedFeature.value.icon = 'face';
          void dataBind();
          break;
        case 'alpr':
          color.value = 'blue-grey-6';
          params.value.ai_type = 2;
          selectedFeature.value.name = 'License Plate Recognition';
          selectedFeature.value.icon = 'drive_eta';
          void dataBind();
          break;
      }
    })
    const rows = ref<AiDataDto[]>([]);
    const pagination = ref({
      sortBy: 'created_date',
      descending: true,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0
    })
    const loading = ref<boolean>(false);
    const showDialog = ref<boolean>(false);
    const selectedItem = ref<AiDataDto | null>(null);
    const detailRows = ref<KeyValuePair[]>([]);
    const downloadVideoLoading = ref<boolean>(false);
    const showDelete = ref<boolean>(false);
    const dlt = ref<AiDataDeleteOptions>({delete_image:false, delete_video:false});
    let videoPlayer: any = null;

    async function dataBind() {
      pagination.value.rowsNumber = await nodeService.queryAiDataCount(params.value);
      const items = await nodeService.queryAiDataAdvanced(params.value);
      rows.value = await setUpDatesAndPaths(nodeService.LocalService, items);
    }

    onMounted(async () => {
      const sourceList = await nodeService.getSourceList();
      for (const s of sourceList) {
        sourceDic.value[<string>s.id] = s;
      }
      sources.value = sourceList;

      await dataBind();
    });

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

    const onLabelChanged = (label: string) => {
      params.value.pred_class_name = label;
      void dataBind();
    };

    const onLabelClear = () => {
      params.value.pred_class_name = '';
      void dataBind();
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
      detailRows.value.push({key: 'Label', value: row.pred_cls_name});
      detailRows.value.push({key: 'Score', value: row.pred_score?.toString() ?? '0'});
      //@ts-ignore
      detailRows.value.push({key: 'Created At', value: `${row.created_at.toLocaleDateString()} ${row.created_at.toLocaleTimeString()}`});
      detailRows.value.push({key: 'Appears at', value: row.video_file?.object_appears_at?.toString() ?? '0'});

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
        a.href = url
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
      } finally {
        document.body.removeChild(a);
      }
    }

    function handleDelete(){
      showDelete.value = true;
    }

    async function onDoDelete(){
      if (selectedItem.value === null){
        $q.notify({ message: 'Not enough argument to delete this record', color: 'red' });
        return;
      }
      showDelete.value = false;
      loading.value = true;
      try {
        dlt.value.ai_type = params.value.ai_type;
        dlt.value.id = selectedItem.value.id;
        await nodeService.deleteAiData(dlt.value);
        await dataBind();
        $q.notify({ message: 'The record has been deleted', color: 'green' });
      } finally {
        loading.value = false;
        showDialog.value = false;
      }
    }

    const onVideoPlayerReady = (player: any) => {
      videoPlayer = player;
    }

    async function onRequest(props: any) {
      pagination.value = props.pagination;
      const {page, rowsPerPage, sortBy, descending} = pagination.value;
      loading.value = true;
      try {
        const p = params.value.paging;
        p.page = page
        p.take = rowsPerPage;

        const s = params.value.sort;
        s.field = sortBy
        s.sort = descending ? SortBy.Descending : SortBy.Ascending;

        await dataBind();
      } finally {
        loading.value = false;
      }
    }

    return {
      tab, color, params, sources, selectedFeature, sourceDic, rows, pagination, loading, showDialog, selectedItem, detailRows, downloadVideoLoading,
      showDelete, dlt,
      onStartDateTimeChanged, onEndDateTimeChanged, onSourceIdChanged, onLabelChanged, parseDate, parseTime, onRequest, dataBind, onLabelClear,
      onRowClick, onVideoPlayerReady, handleDownloadVideo, handleOpenSnapshot, handleDelete, onDoDelete,
      columns: createColumns(), detailColumns: createDetailColumns(),
      deleteRecordTemp:ref<boolean>(true)
    }
  }
}

function createColumns() {
  const align = 'center';
  return [
    {name: 'image_file_name', align: 'left', label: '', field: 'image_file_name', sortable: false},
    {name: 'source_id', align, label: 'Camera', field: 'source_id', sortable: true},
    {name: 'pred_cls_name', align, label: 'Label', field: 'pred_cls_name', sortable: true},
    {name: 'pred_score', align, label: 'Score', field: 'pred_score', sortable: true},
    {name: 'created_at', align, label: 'Created At', field: 'created_at', sortable: true},
  ];
}

function createDetailColumns() {
  const align = 'left';
  return [
    {name: 'key', align, label: '', field: 'key', sortable: false},
    {name: 'value', align, label: '', field: 'value', sortable: true},
  ];
}

interface KeyValuePair {
  key: string;
  value: string;
}
</script>

<style scoped>

</style>

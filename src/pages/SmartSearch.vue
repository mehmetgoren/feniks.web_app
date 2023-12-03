<template>
  <div class="q-pa-md">

    <div class="row">
      <div class="col-12">
        <q-toolbar :class="'bg-' + color + ' text-white'">
          <q-btn flat round dense :icon="selectedFeature.icon" class="q-mr-sm"/>
          <q-toolbar-title autocapitalize="characters">{{ selectedFeature.title.toLocaleUpperCase() }}</q-toolbar-title>
          <q-space/>
        </q-toolbar>
      </div>
    </div>

    <div class="row" style="margin-top: 15px;">
      <div class="col-xs-12 col-sm-6 col-md-6 col-lg-3 col-xl-3">
        <DateTimeSelector :width-date="200" :width-time="125" :label-date="$t('start_date')" :label-time="$t('start_time')"
                          :color='color' :dense="true" :show-hour='true' :allow-minute-selection="true" @date-time-changed='onStartDateTimeChanged'
                          :date-string="parseDate(params.start_date_time_str)" :time-string="parseTime(params.start_date_time_str)"
                          :disable="loading" :show-date="true"/>
      </div>
      <div class="col-xs-12 col-sm-6 col-md-6 col-lg-3 col-xl-3">
        <DateTimeSelector :width-date="200" :width-time="125" :label-date="$t('end_date')" :label-time="$t('end_time')"
                          :color='color' :dense="true" :show-hour='true' :allow-minute-selection="true" @date-time-changed='onEndDateTimeChanged'
                          :date-string="parseDate(params.end_date_time_str)" :time-string="parseTime(params.end_date_time_str)"
                          :disable="loading" :show-date="true"/>
      </div>
      <div class="col-xs-12 col-sm-6 col-md-6 col-lg-3 col-xl-3">
        <q-select emit-value map-options filled style="max-width: 300px;margin-top: 3px;" @update:model-value="onSourceIdChanged"
                  v-model='params.source_id' :color='color' option-value="id" option-label="name"
                  :options='sources' :label="$t('camera')" clearable dense :disable="loading"/>
      </div>
      <div class="col-xs-12 col-sm-6 col-md-6 col-lg-3 col-xl-3">
        <q-input filled v-model.trim='params.pred_class_name' :label="$t('label')" :color='color' @update:model-value="onLabelChanged"
                 style="max-width: 300px;margin-top: 3px;" dense :disable="loading">
          <template v-if="params.pred_class_name" v-slot:append>
            <q-icon name="cancel" @click="onLabelClear" class="cursor-pointer"/>
          </template>
        </q-input>
      </div>
    </div>
    <q-space style="margin-bottom: 15px;"/>
    <div class="row">
      <div class="col-2">
        <table>
          <tr>
            <td>
              <q-color v-model="params.color.hex_color" :disable="loading" @update:model-value="dataBind"/>
            </td>
          </tr>
          <q-space style="margin-bottom: 15px;"/>
          <tr>
            <td>
              <q-select outlined :color="color" :label="$t('color_difference_method')" v-model="params.color.difference_method"
                        :options="colorDifferenceMethods" emit-value map-options :disable="loading"/>
              <q-space style="margin-bottom: 15px;"/>
              <q-input type="number" outlined :color="color" :label="$t('threshold')" v-model.number="params.color.threshold" :disable="loading"/>
              <q-space style="margin-bottom: 15px;"/>
              <q-btn :label="$t('ok')" :color='color' icon="done" @click='dataBind' :disable="loading"/>
            </td>
          </tr>
        </table>
      </div>
      <div class="col-10">
        <q-table :title="$t('ai_data')" :color="color" :rows="rows" :columns="columns" row-key="id" :pagination="clientSidePagination"
                 :loading="loading" :rows-per-page-label="$t('rows_per_page')" :no-data-label="$t('no_data')">
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
            <q-btn icon='refresh' :label="$t('refresh')" :color='color' @click='dataBind'/>
          </template>
          <template v-slot:loading>
            <q-inner-loading showing :color="color"/>
          </template>
        </q-table>
        <q-space style="margin-bottom: 15px;"/>
        <div v-if="!config?.snapshot.meta_color_enabled">
          <label class='blink_me'>{{$t('no_meta_color_enabled')}}</label>
        </div>
      </div>
    </div>
  </div>

  <q-dialog v-model="showDialog" transition-show="rotate" transition-hide="rotate">
    <q-layout view='lHh lpr lFf' container class='shadow-2 rounded-borders' style="max-height: 70%;max-width: 85%;">
      <q-header elevated :class="'bg-' + color">
        <q-toolbar>
          <q-btn flat round dense :icon='selectedFeature.icon'/>
          <q-toolbar-title>
            {{ sourceDic[selectedItem.source_id].name }} {{ selectedFeature.name }}
          </q-toolbar-title>
          <q-space/>
          <q-btn dense flat icon='close' v-close-popup>
            <q-tooltip :class="'bg-' + color  +  ' text-primary'">{{ $t('close') }}</q-tooltip>
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
                  <q-img v-if="selectedItem" :src="selectedItem.image_file_name"/>
                </div>
                <div style="float: left;width: 100%;margin-top: 5px;">
                  <q-table :rows="detailRows" :color="color" :columns="detailColumns" :hide-header="true"
                           :rows-per-page-label="$t('rows_per_page')" :no-data-label="$t('no_data')">
                    <template v-slot:top-left>
                      <q-btn :color='color' dense icon-right='theaters' :label="$t('download_video')"
                             @click='handleDownloadVideo(selectedItem.video_file.name, "clip")'>
                        <q-inner-loading :loading="downloadVideoLoading"/>
                      </q-btn>
                      <q-btn :color='color' dense icon-right='photo_camera' :label="$t('open_snapshot')"
                             @click='handleOpenSnapshot(selectedItem.image_file_name)'
                             style="margin-left: 5px;"/>
                    </template>
                    <template v-slot:top-right>
                      <q-btn color='red' dense icon-right='delete' :label="$t('delete_event')" @click='handleDelete()'/>
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
        <q-checkbox v-model="deleteRecordTemp" :label="$t('delete_record_permanently')" disable/>
        <q-checkbox v-model="dlt.delete_image" :label="$t('delete_record_permanently2')"/>
        <q-checkbox v-model="dlt.delete_video" :label="$t('delete_record_permanently3')"/>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="$t('cancel')" color="primary" v-close-popup/>
        <q-btn flat :label="$t('delete')" color="red" @click="onDoDelete"/>
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>

<script lang="ts">
import {nextTick, onMounted, ref} from 'vue';
import {AiDataDeleteOptions, AiDataDto} from 'src/utils/models/ai_data_dtos';
import VideoPlayer from 'src/components/VideoPlayer.vue';
import DateTimeSelector from 'components/DateTimeSelector.vue';
import {SourceModel} from 'src/utils/models/source_model';
import {NodeService} from 'src/utils/services/node_service';
import {databindWithLoading, downloadFile, getAddedHour, getPrevHourDatetime, getTodayString} from 'src/utils/utils';
import {setUpDatesAndPaths} from 'src/utils/path_utils';
import {useQuasar} from 'quasar';
import {useI18n} from 'vue-i18n';
import {SmartSearchParams} from 'src/utils/models/smart_search';
import {SelectOption} from 'src/utils/services/local_service';
import {Config} from 'src/utils/models/config';

export default {
  name: 'SmartSearch',
  components: {DateTimeSelector, VideoPlayer},
  setup() {
    const {t} = useI18n({useScope: 'global'});
    const $q = useQuasar();
    const color = ref<string>('light-blue-6');
    const sources = ref<SourceModel[]>([]);
    const sourceDic = ref<any>({});
    const params = ref<SmartSearchParams>({
      source_id: '',
      start_date_time_str: getPrevHourDatetime(1),
      end_date_time_str: `${getTodayString()}_${getAddedHour(1)}`,
      pred_class_name: '',
      color: {hex_color: '#000000', difference_method: 'CIEDE2000', threshold: 0.15}
    });
    const selectedFeature = ref({title: t('smart_search'), name: t('object_detection'), icon: 'workspaces'});
    const nodeService = new NodeService();
    const config = ref<Config>();
    const rows = ref<AiDataDto[]>([]);
    const loading = ref<boolean>(false);
    const showDialog = ref<boolean>(false);
    const selectedItem = ref<AiDataDto | null>(null);
    const detailRows = ref<KeyValuePair[]>([]);
    const downloadVideoLoading = ref<boolean>(false);
    const showDelete = ref<boolean>(false);
    const colorDifferenceMethods = ref<SelectOption[]>(nodeService.LocalService.createColorDifferenceMethods());
    const dlt = ref<AiDataDeleteOptions>({delete_image: false, delete_video: false});
    let videoPlayer: any = null;

    async function dataBind() {
      await databindWithLoading(loading, async () => {
        const items = await nodeService.smartSearch(params.value);
        rows.value = await setUpDatesAndPaths(nodeService.LocalService, items);
      });
    }

    onMounted(async () => {
      config.value = await nodeService.getConfig();
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
      detailRows.value.push({key: t('label'), value: row.pred_cls_name});
      detailRows.value.push({key: t('score'), value: row.pred_score?.toString() ?? '0'});
      //@ts-ignore
      detailRows.value.push({key: t('created_at'), value: `${row.created_at.toLocaleDateString()} ${row.created_at.toLocaleTimeString()}`});
      detailRows.value.push({key: t('appears_at'), value: (row.video_file?.object_appears_at?.toString() ?? '0') + ' sec.'});

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

    function handleDelete() {
      showDelete.value = true;
    }

    async function onDoDelete() {
      if (selectedItem.value === null) {
        $q.notify({message: t('not_enough_arg_delete_record'), color: 'red'});
        return;
      }
      showDelete.value = false;
      loading.value = true;
      try {
        dlt.value.ai_type = 0; // means Od
        dlt.value.id = selectedItem.value.id;
        await nodeService.deleteAiData(dlt.value);
        await dataBind();
        $q.notify({message: t('record_deleted'), color: 'green'});
      } finally {
        loading.value = false;
        showDialog.value = false;
      }
    }

    const onVideoPlayerReady = (player: any) => {
      videoPlayer = player;
    }

    return {
      color, params, sources, selectedFeature, sourceDic, rows, loading, showDialog, selectedItem, detailRows, downloadVideoLoading,
      showDelete, dlt, colorDifferenceMethods, config,
      onStartDateTimeChanged, onEndDateTimeChanged, onSourceIdChanged, onLabelChanged, parseDate, parseTime, dataBind, onLabelClear,
      onRowClick, onVideoPlayerReady, handleDownloadVideo, handleOpenSnapshot, handleDelete, onDoDelete,
      columns: createColumns(true, t), detailColumns: createDetailColumns(),
      deleteRecordTemp: ref<boolean>(true),
      clientSidePagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 10
      }
    }
  }
}

function createColumns(includeImageColumn: boolean, t: any): any[] {
  const align = 'center';
  const ret = [];
  if (includeImageColumn) {
    ret.push({name: 'image_file_name', align: 'left', label: '', field: 'image_file_name', sortable: false});
  }
  ret.push({name: 'source_id', align, label: t('camera'), field: 'source_id', sortable: true});
  ret.push({name: 'pred_cls_name', align, label: t('label'), field: 'pred_cls_name', sortable: true});
  ret.push({name: 'pred_score', align, label: t('score'), field: 'pred_score', sortable: true});
  ret.push({name: 'created_at', align, label: t('created_at'), field: 'created_at', sortable: true});

  return ret;
}

function createDetailColumns(): any[] {
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
.blink_me {
  animation: blinker 1s linear infinite;
  color: red;
  font-size: medium;
}

@keyframes blinker {
  50% {
    opacity: 0;
  }
}

@keyframes blink {
  50% {
    border-color: #fff;
  }
}
</style>

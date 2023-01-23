<template>
  <q-layout view='lHh lpr lFf' container style='height: 1000px' class='shadow-2 rounded-borders'>
    <q-toolbar :class="'bg-' + color + ' text-white'">
      <q-btn flat round dense :icon="selectedFeature.icon" class="q-mr-sm"/>
      <q-toolbar-title>{{$t('ai_video_clips')}}</q-toolbar-title>
      <q-tabs v-model="tab" shrink :active-bg-color="color">
        <q-tab name="od" icon="collections" :label="$t('object_detection')" :disable="refreshLoading"/>
        <q-tab name="fr" icon="face" :label="$t('face_recognition')" :disable="refreshLoading"/>
        <q-tab name="alpr" icon="drive_eta" :label="$t('license_plate_recognition')" :disable="refreshLoading"/>
      </q-tabs>
      <q-space/>
    </q-toolbar>
    <q-page-container style="margin-top: -15px">
      <q-page padding style='background-color: whitesmoke;'>
        <div class='row'>
          <div class='col-12' style="margin-top: -8px;">
            <q-table title='Video Clips' :rows='rows' :columns='columns'
                     virtual-scroll :virtual-scroll-item-size='48' :pagination='pagination'
                     :rows-per-page-options='[0]' :rows-per-page-label="$t('rows_per_page')"
                     row-key='video_file_name' :filter='filter' :no-data-label="$t('no_data')">
              <template v-slot:body='props'>
                <q-tr :props='props' @click='onRowClick(props)' :style='{"backgroundColor": props.expand ? color:"white", "cursor":"pointer"}'>
                  <q-td key='base64_image'>
                    <q-img :src='webMngrAddress + props.row.preview.image_file_name'/>
                  </q-td>
                  <q-td key='objects'>
                    <label>{{ props.row.preview.object_names }}<br></label>
                  </q-td>
                  <q-td key='created_at' :props='props'>{{ props.row.video_created_at.toLocaleString() }}</q-td>
                </q-tr>
                <q-tr v-if='props.expand' :props='props'>
                  <q-td colspan='100%'>
                    <div class='q-pa-md q-gutter-sm' style='margin: 5px;'>
                      <q-btn color='primary' icon='theaters' :label="$t('download_clip')"
                             @click='handleDownloadClip(webMngrAddress+ props.row.video_file_name)'/>
                      <q-btn color='red' icon='delete' :label="$t('delete_event')" @click='handleDeleteClip(props.row)'/>
                      <q-btn color='grey' icon='clear' :label="$t('close')" @click='props.expand = !props.expand'/>
                    </div>
                    <br>
                    <div style='width: 480px;float: left;margin-right: 5px;'>
                      <VideoPlayer :src='webMngrAddress+ props.row.video_file_name' :auto-play='false'/>
                    </div>
                    <div class='q-pa-md' style='width: 350px;float:left;margin: 0 5px 0 5px'>
                      <q-table dense :rows='props.row.ai_objects' :columns='aiObjectColumns' row-key='pred_cls_idx'
                               :pagination='{rowsPerPage: 5}' :no-data-label="$t('no_data')" :rows-per-page-label="$t('rows_per_page')"/>
                    </div>
                    <div class='q-pa-md' style='width: 350px;float: left; margin: 0 5px 0 5px'>
                      <q-list bordered separator>
                        <q-item clickable v-ripple>
                          <q-item-section>
                            <q-item-label overline>{{$t('created_at')}}</q-item-label>
                            <q-item-label>{{ props.row.video_created_at.toLocaleString() }}</q-item-label>
                          </q-item-section>
                        </q-item>
                        <q-item v-ripple>
                          <q-item-section>
                            <q-item-label overline>{{$t('last_modified_at')}}</q-item-label>
                            <q-item-label>{{ props.row.video_last_modified_at.toLocaleString() }}</q-item-label>
                          </q-item-section>
                        </q-item>
                        <q-item v-ripple>
                          <q-item-section>
                            <q-item-label overline>{{$t('duration')}}</q-item-label>
                            <q-item-label>{{ props.row.duration }} {{$t('sec')}}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </div>
                    <div class='q-pa-md' style='float: left;'>
                      <viewer :images='props.row.image_file_names'>
                        <q-img v-for='image_file_name in props.row.image_file_names' :key='image_file_name'
                               :src='webMngrAddress + image_file_name' :alt="$t('no_image')" width='150px' height='150px'/>
                      </viewer>
                    </div>
                  </q-td>
                </q-tr>
              </template>
              <template v-slot:top-right>
                <q-btn class="gt-xs" icon='refresh' :label="$t('refresh')" :color='color' style='margin-right: 15px;' @click='onRefresh'/>
                <DateTimeSelector :dense="true" :color='color' :show-hour='true' :label-date="$t('date')" :label-time="$t('time')"
                                  @date-changed='onDateChanged' @hour-changed='onHourChanged' :disable="refreshLoading"/>
              </template>
            </q-table>
            <q-inner-loading :showing='refreshLoading' :color='color' size='128px'/>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang='ts'>
import VideoPlayer from 'src/components/VideoPlayer.vue';
import DateTimeSelector from 'src/components/DateTimeSelector.vue';
import {StreamModel} from 'src/utils/models/stream_model';
import {nextTick, onMounted, ref, watch} from 'vue';
import {NodeService} from 'src/utils/services/node_service';
import {downloadFile2, fixArrayDates, getCurrentHour, getTodayString} from 'src/utils/utils';
import {useQuasar} from 'quasar';
import {SelectedAiFeature} from 'src/utils/models/ai_data_dtos';
import {AiClipQueryViewModel, AiClipViewModel} from 'src/utils/models/ai_clip_view_models';
import {useI18n} from 'vue-i18n';

export default {
  name: 'AiClips',
  props: {
    sourceId: {
      type: String,
      required: true
    }
  },
  components: {
    VideoPlayer, DateTimeSelector
  },
  setup(props: any) {
    const { t } = useI18n({ useScope: 'global' });
    const $q = useQuasar()
    const nodeService = new NodeService();
    let selectedDate = getTodayString();
    let selectedHour = getCurrentHour();
    const tab = ref<string>('od')
    const params = ref<AiClipQueryViewModel>({
      ai_type: 0,
      source_id: props.sourceId,
      date: `${selectedDate}_${selectedHour}`
    });
    const selectedFeature = ref<SelectedAiFeature>({name: t('object_detection'), icon: 'collections'});
    watch(tab, (newValue: string) => {
      switch (newValue) {
        case 'od':
          color.value = 'deep-purple-14';
          params.value.ai_type = 0;
          selectedFeature.value.name = t('object_detection');
          selectedFeature.value.icon = 'collections';
          void databind();
          break;
        case 'fr':
          color.value = 'deep-orange-7';
          params.value.ai_type = 1;
          selectedFeature.value.name = t('face_recognition');
          selectedFeature.value.icon = 'face';
          void databind();
          break;
        case 'alpr':
          color.value = 'blue-grey-6';
          params.value.ai_type = 2;
          selectedFeature.value.name = t('license_plate_recognition');
          selectedFeature.value.icon = 'drive_eta';
          void databind();
          break;
      }
    })
    const color = ref<string>('deep-purple-14')

    const stream = ref<StreamModel>(nodeService.LocalService.createEmptyStream());
    const rows = ref<AiClipViewModel[]>([]);
    const filter = ref<string>('');
    const webMngrAddress = ref<string>('');
    const refreshLoading = ref<boolean>(false);
    let prevProps: any = null;

    function restorePrev() {
      if (prevProps != null) {
        prevProps.expand = false;
        prevProps = null;
      }
    }

    const databind = async () => {
      refreshLoading.value = true;
      try {
        restorePrev();
        const dataList = await nodeService.getAiClips(params.value);
        fixArrayDates(dataList, 'video_created_at', 'video_last_modified_at');
        rows.value = dataList;
      } finally {
        refreshLoading.value = false;
      }
    };

    onMounted(async () => {
      webMngrAddress.value = await nodeService.LocalService.getNodeAddress('');
      stream.value = await nodeService.getStream(props.sourceId);
      await databind();
    });

    function handleDownloadClip(url: string) {
      downloadFile2(url);
    }

    function handleDeleteClip(item: AiClipViewModel) {
      $q.dialog({
        title: 'Confirm',
        message: t('are_you_sure_delete_ai_clip'),
        cancel: true,
        persistent: false
      }).onOk(() => {
        nodeService.deleteAiClip(item).then(() => {
          void databind();
        }).catch(console.error)
      });
    }

    function onRowClick(props: any) {
      restorePrev();
      nextTick().then(() => {
        setTimeout(() => {
          props.expand = !props.expand;
          prevProps = props;
        }, 100);
      }).catch(console.error);
    }

    return {
      tab, color, rows, webMngrAddress, selectedDate, stream, columns:[
        {name: 'base64_image', align: 'left', label: '', field: 'base64_image', sortable: false},
        {name: 'objects', align: 'left', label: t('objects'), field: 'objects', sortable: true},
        {name: 'created_at', align: 'left', label: t('date'), field: 'created_at', sortable: true}
      ],
      selectedFeature,
      pagination: {
        rowsPerPage: 0
      },
      filter, refreshLoading, aiObjectColumns:[
        {name: 'pred_cls_name', align: 'left', label: t('object'), field: 'pred_cls_name', sortable: false},
        {name: 'pred_score', align: 'left', label: t('score'), field: 'pred_score', sortable: false}
      ],
      handleDownloadClip, handleDeleteClip, onRowClick, onRefresh: databind,
      onDateChanged(dateStr: string) {
        selectedDate = dateStr;
        params.value.date = `${selectedDate}_${selectedHour}`;
        void databind();
      },
      onHourChanged(hour: string) {
        selectedHour = hour;
        params.value.date = `${selectedDate}_${selectedHour}`;
        void databind();
      }
    };
  }
};

</script>

<style scoped>
</style>

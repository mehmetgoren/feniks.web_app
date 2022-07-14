<template>
  <q-layout view='lHh lpr lFf' container style='height: 1000px' class='shadow-2 rounded-borders'>
    <q-page-container>
      <q-page padding style='background-color: whitesmoke;'>
        <div class='row'>
          <div class='col-12'>
            <q-table title='Video Clips' :rows='rows' :columns='columns'
                     virtual-scroll :virtual-scroll-item-size='48' :pagination='pagination'
                     :rows-per-page-options='[0]'
                     row-key='video_file_name' :filter='filter'>
              <template v-slot:body='props'>
                <q-tr :props='props' @click='onRowClick(props)' :style='{"backgroundColor": props.expand ? "orange":"white", "cursor":"pointer"}'>
                  <q-td key='base64_image'>
                    <q-img :src='webMngrAddress + props.row.preview.image_file_name' />
                  </q-td>
                  <q-td key='objects'>
                    <label>{{ props.row.preview.object_names }}<br></label>
                  </q-td>
                  <q-td key='created_at' :props='props'>{{ props.row.video_created_at.toLocaleString() }}</q-td>
                </q-tr>
                <q-tr v-show='props.expand' :props='props'>
                  <q-td colspan='100%'>
                    <div class='q-pa-md q-gutter-sm' style='margin: 5px;'>
                      <q-btn color='primary' icon='theaters' label='Download Clip'
                             @click='handleDownloadClip(webMngrAddress+ props.row.video_file_name, props.row.video_base_file_name)' />
                      <q-btn color='red' icon='delete' label='Delete Event' @click='handleDeleteClip(props.row)' />
                      <q-btn color='grey' icon='clear' label='Close' @click='props.expand = !props.expand' />
                    </div>
                    <br>
                    <div style='width: 480px;float: left;margin-right: 5px;'>
                      <VideoPlayer :src='webMngrAddress+ props.row.video_file_name' :auto-play='false' />
                    </div>
                    <div class='q-pa-md' style='width: 350px;float:left;margin: 0 5px 0 5px'>
                      <q-table dense :rows='props.row.detected_objects' :columns='detectedObjectColumns' row-key='pred_cls_idx'
                               :pagination='{rowsPerPage: 5}' />
                    </div>
                    <div class='q-pa-md' style='width: 350px;float: left; margin: 0 5px 0 5px'>
                      <q-list bordered separator>
                        <q-item clickable v-ripple>
                          <q-item-section>
                            <q-item-label overline>Created At</q-item-label>
                            <q-item-label>{{ props.row.video_created_at.toLocaleString() }}</q-item-label>
                          </q-item-section>
                        </q-item>
                        <q-item v-ripple>
                          <q-item-section>
                            <q-item-label overline>Last Modified At</q-item-label>
                            <q-item-label>{{ props.row.video_last_modified_at.toLocaleString() }}</q-item-label>
                          </q-item-section>
                        </q-item>
                        <q-item v-ripple>
                          <q-item-section>
                            <q-item-label overline>Duration</q-item-label>
                            <q-item-label>{{ props.row.duration }} sec</q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </div>
                    <div class='q-pa-md' style='float: left;'>
                      <viewer :images='props.row.image_file_names'>
                        <img v-for='image_file_name in props.row.image_file_names' :key='image_file_name'
                             :src='webMngrAddress + image_file_name' alt='no image' width='150' height='150'>
                      </viewer>
                    </div>
                  </q-td>
                </q-tr>
              </template>

              <template v-slot:top-right>
                <DateTimeSelector color='orange' :show-hour='true' @date-changed='onDateChanged' @hour-changed='onHourChanged' />
              </template>
            </q-table>
            <q-inner-loading :showing='refreshLoading' color='orange' size='64px' />
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang='ts'>
import VideoPlayer from 'src/components/VideoPlayer.vue';
import DateTimeSelector from 'src/components/DateTimeSelector.vue';
import { StreamModel } from 'src/utils/models/stream_model';
import { onMounted, ref } from 'vue';
import { OdVideoClipsViewModel } from 'src/utils/models/ai_clip_json_object';
import { NodeService } from 'src/utils/services/node_service';
import { downloadFile, fixArrayDates, getCurrentHour, getTodayString } from 'src/utils/utils';
import {useQuasar} from 'quasar';

export default {
  name: 'OdSourceVideoClips',
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
    const $q = useQuasar()
    const nodeService = new NodeService();
    const stream = ref<StreamModel>(nodeService.LocalService.createEmptyStream());
    const rows = ref<OdVideoClipsViewModel[]>([]);
    const filter = ref<string>('');
    const webMngrAddress = ref<string>('');
    const refreshLoading = ref<boolean>(false);
    let selectedDate = getTodayString();
    let selectedHour = getCurrentHour();
    let prevProps: any = null;

    function restorePrev(){
      if (prevProps != null) {
        prevProps.expand = false;
        prevProps = null;
      }
    }

    const refreshFn = async () => {
      refreshLoading.value = true;
      try {
        restorePrev();
        const dataList = await nodeService.getOdVideoClips(props.sourceId, `${selectedDate}_${selectedHour}`);
        fixArrayDates(dataList, 'video_created_at', 'video_last_modified');
        rows.value = dataList;
      } finally {
        refreshLoading.value = false;
      }
    };

    onMounted(async () => {
      webMngrAddress.value = await nodeService.LocalService.getNodeAddress('') + '/';
      stream.value = await nodeService.getStream(props.sourceId);
      await refreshFn();
    });

    function handleDownloadClip(url: string, fileName: string) {
      downloadFile(url, fileName, 'video/mp4');
    }

    function handleDeleteClip(item: OdVideoClipsViewModel) {
      $q.dialog({
        title: 'Confirm',
        message: 'Are you sure you want to delete this video clip?',
        cancel: true,
        persistent: false
      }).onOk(() => {
        nodeService.deleteOdVideoClip(item).then(() => {
          void refreshFn();
        }).catch(console.error)
      });
    }

    function onRowClick(props: any){
      restorePrev();
      props.expand = !props.expand;
      prevProps = props;
    }

    return {
      rows, webMngrAddress, selectedDate, stream, columns,
      pagination: {
        rowsPerPage: 0
      },
      filter, refreshLoading, detectedObjectColumns,
      handleDownloadClip, handleDeleteClip, onRowClick,
      onDateChanged(dateStr: string) {
        selectedDate = dateStr;
        void refreshFn();
      },
      onHourChanged(hour: string) {
        selectedHour = hour;
        void refreshFn();
      }
    };
  }
};
const columns = [
  { name: 'base64_image', align: 'left', label: '', field: 'base64_image', sortable: false },
  { name: 'objects', align: 'left', label: 'Objects', field: 'objects', sortable: true },
  { name: 'created_at', align: 'left', label: 'Date', field: 'created_at', sortable: true }
];
const detectedObjectColumns = [
  { name: 'pred_cls_name', align: 'left', label: 'Object', field: 'pred_cls_name', sortable: false },
  { name: 'pred_score', align: 'left', label: 'Score', field: 'pred_score', sortable: false }
];

</script>

<style scoped>
</style>

<template>
  <q-layout view='lHh lpr lFf' container style='height: 600px' class='shadow-2 rounded-borders'>
    <q-header elevated class='bg-purple'>
      <q-toolbar>
        <q-btn flat round dense icon='dvr' />
        <q-toolbar-title>
          Record List ({{ stream.name }})
        </q-toolbar-title>
        <q-space />
        <q-btn dense flat icon='close' v-close-popup>
          <q-tooltip class='bg-white text-primary'>Close</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <q-page padding style='background-color: whitesmoke;'>
        <div class='row'>
          <div class='col-3'>
            <q-toggle v-model='recordEnabled' disable checked-icon='check' color='purple'
                      :label='"Record " + (recordEnabled ? "On" : "Off")' />
            <q-space />
            <q-date v-model='selectedDate' color='purple' mask='YYYY_MM_DD' />
          </div>
          <div class='col-9'>
            <q-table title='Records' :columns='columns'
                     :rows='hours' row-key='hour'
                     virtual-scroll :virtual-scroll-item-size='24' :pagination='pagination'
                     :rows-per-page-options='[0]'
                     :filter='filter'>

              <template v-slot:body='props'>
                <q-tr :props='props' @click='onRootClick(props)' style='cursor: pointer;'>
                  <q-td key='hour' auto-width>
                    <q-toggle v-model='props.expand' size='lg' color='accent' style='float: left;' disable />
                    <div style='font-size: large;text-align: center;margin: 15px 0 0 0;'>
                      <label>{{ props.row.hour + ' : 00' }}</label>
                    </div>
                  </q-td>
                </q-tr>
                <q-tr v-show='props.expand' :props='props'>
                  <q-table
                    :rows='props.row.videoFiles' :columns='innerColumns'
                    :pagination='innerPagination' row-key='name'
                    :selected='selected' :filter='innerFilter'>
                    <template v-slot:body-cell-play='props'>
                      <q-td :props='props'>
                        <div>
                          <q-btn round color='purple' icon='play_arrow' @click='onPlay(props.row)' />
                        </div>
                      </q-td>
                    </template>
                    <template v-slot:body-cell-download='props'>
                      <q-td :props='props'>
                        <div>
                          <q-btn round color='teal' icon='download' @click='onDownload(props.row)' />
                        </div>
                      </q-td>
                    </template>
                    <template v-slot:body-cell-delete='props'>
                      <q-td :props='props'>
                        <div>
                          <q-btn round color='deep-orange' icon='delete' @click='onDelete(props.row)' />
                        </div>
                      </q-td>
                    </template>
                    <template v-slot:top-left>
                      <q-btn v-if='props.row.videoFiles.length>1' icon-right='movie_creation' label='Merge' glossy color='purple'
                             style='margin-right: 15px;' @click='onMerge(props.row)' :disable='showMergeLoading'>
                        <q-inner-loading :showing='showMergeLoading' />
                      </q-btn>
                    </template>
                    <template v-slot:top-right>
                      <q-input v-if='props.row.videoFiles.length>1' borderless dense debounce='300' v-model='innerFilter' placeholder='Search'>
                        <template v-slot:append>
                          <q-icon name='search' />
                        </template>
                      </q-input>
                    </template>
                  </q-table>
                </q-tr>
              </template>

              <template v-slot:top-right>
                <q-btn icon='refresh' label='Refresh' glossy color='purple' style='margin-right: 15px;' @click='onRefresh' />
                <q-input borderless dense debounce='300' v-model='filter' placeholder='Search'>
                  <template v-slot:append>
                    <q-icon name='search' />
                  </template>
                </q-input>
              </template>

            </q-table>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
  <q-dialog v-model='showPlayer' transition-show='rotate' transition-hide='rotate'>
    <q-card style='width: 50%; max-width: 80vw;'>
      <q-card-section>
        <div class='text-h6'>{{ selectedVideo.name }}</div>
      </q-card-section>
      <q-card-section class='q-pt-none'>
        <VideoPlayer :src='nodeAddress + selectedVideo.path' :auto-play='true' />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang='ts'>
import { useQuasar } from 'quasar';
import { onMounted, ref, onBeforeUnmount, watch } from 'vue';
import { VideoFile } from 'src/utils/entities';
import { NodeService } from 'src/utils/services/node_service';
import { WsConnection } from 'src/utils/ws/connection';
import VideoPlayer from 'src/components/VideoPlayer.vue';
import {fixArrayDates, getTodayString, isNullOrEmpty} from 'src/utils/utils';
import axios from 'axios';
import { StreamModel } from 'src/utils/models/stream_model';
import { PublishService, SubscribeService } from 'src/utils/services/websocket_services';
import { VideMergeResponseEvent } from 'src/utils/models/video_merge';

const columns = [
  { name: 'hour', align: 'left', label: 'Hour', field: 'hour', sortable: false }
];

const innerColumns = [
  { name: 'created_at', align: 'center', label: 'Created', field: 'created_at', format: (val: any) => `${val.toLocaleString()}`, sortable: true },
  { name: 'modified_at', align: 'center', label: 'Ended', field: 'modified_at', format: (val: any) => `${val.toLocaleString()}`, sortable: true },
  { name: 'name', align: 'center', label: 'File Name', field: 'name', sortable: true },
  { name: 'size', align: 'center', label: 'Size (MB)', field: 'size', sortable: true },
  { name: 'play', align: 'center', label: 'Play', field: 'play' },
  { name: 'download', align: 'center', label: 'Download', field: 'download' },
  { name: 'delete', align: 'center', label: 'Delete', field: 'delete' }
];

export default {
  name: 'SourceRecords',
  components: {
    VideoPlayer
  },
  props: {
    sourceId: {
      type: String,
      required: true
    }
  },
  setup(props: any) {
    const $q = useQuasar();
    const recordEnabled = ref<boolean>(false);
    const nodeService = new NodeService();
    const publishService = new PublishService();
    let connVideoMerge: WsConnection | null = null;
    const hours = ref<Hour[]>([]);
    const showPlayer = ref<boolean>(false);
    const selectedVideo = ref<VideoFile | null>(null);
    const filter = ref('');
    const innerFilter = ref('');
    const stream = ref<StreamModel>(nodeService.LocalService.createEmptyStream());
    const nodeAddress = ref<string>('');
    const selectedDate = ref<string>(getTodayString());
    const showMergeLoading = ref<boolean>(false);
    let prevProps: any = null;

    watch(selectedDate, () => {
      restoreList();
      void dataBind();
    });

    const dataBind = async () => {
      let dateStr = selectedDate.value;
      if (!dateStr){
        dateStr = getTodayString();
        selectedDate.value = dateStr;
      }
      const hourStrings = await nodeService.getRecordHours(props.sourceId, dateStr);
      const _hours: Hour[] = [];
      for (const hs of hourStrings) {
        _hours.push({ sourceId: props.sourceId, hour: hs, videoFiles: [] });
      }
      hours.value = _hours;
    };

    onMounted(async () => {
      const nodeIp = await nodeService.LocalService.getNodeIP();
      const nodePort = await nodeService.LocalService.getNodePort();
      const subscribeService = new SubscribeService(nodeIp, nodePort);

      nodeAddress.value = await nodeService.LocalService.getNodeAddress('');
      stream.value = await nodeService.getStream(props.sourceId);
      recordEnabled.value = stream.value.record_enabled;

      await dataBind();

      connVideoMerge = subscribeService.subscribeVideomerge((event: MessageEvent) => {
        try{
          const resp: VideMergeResponseEvent = JSON.parse(event.data)
          if (!isNullOrEmpty(resp.output_file_name)){
            const p = prevProps;
            restoreList();
            dataBind().then(() => {
              setTimeout(() => {
                if (p != null){
                  void onRootClick(p);
                }
              }, 250);
            }).catch(console.error);
          }
        }finally {
          showMergeLoading.value = false;
        }
      });
    });

    onBeforeUnmount(() => {
      if (connVideoMerge) {
        connVideoMerge.close();
      }
    });

    const selected = ref([]);
    const lastIndex = ref(null);
    const tableRef = ref(null);

    function onPlay(video: VideoFile) {
      showPlayer.value = true;
      selectedVideo.value = video;
    }

    function onDownload(video: VideoFile) {
      axios({
        url: nodeAddress.value + video.path,
        method: 'GET',
        responseType: 'blob' // important
      }).then((response: any) => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require('downloadjs')(response.data, video.name, 'video/mp4');
      }).catch(console.error);
    }

    function onDelete(video: VideoFile) {
      $q.dialog({
        title: 'Confirm',
        message: 'Are you sure you want to delete this video file?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        nodeService.deleteRecord(video)
          .then(() => {
            $q.notify({
              message: 'Video has been deleted',
              caption: 'Video Status',
              color: 'secondary'
            });
            const hour = getHour(video.hour);
            hour.videoFiles = hour.videoFiles.filter((row: VideoFile) => row.name !== video.name);
          }).catch(console.error);
      });
    }

    const getHour = (hourStr: string): Hour => {
      return hours.value.filter((row: Hour) => row.hour === hourStr)[0];
    };

    function restoreList(){
      if (prevProps != null) {
        prevProps.expand = false;
        prevProps = null;
      }

      for (const h of hours.value) {
        h.videoFiles = [];
      }
    }

    const onRootClick = async (props: any) => {
      if (prevProps != null && prevProps.row.hour == props.row.hour) {
        props.expand = !props.expand;
        return;
      }
      restoreList();
      prevProps = props;
      props.expand = !props.expand;
      const hourStr = props.row.hour;
      const hour = getHour(hourStr);
      if (props.expand) {
        const videos = await nodeService.getRecords(props.row.sourceId, selectedDate.value, hourStr);
        fixArrayDates(videos, 'created_at', 'modified_at');
        hour.videoFiles = videos;
      } else {
        hour.videoFiles = [];
      }
    };

    const onMerge = (row: Hour)=>{
      $q.dialog({
        title: 'Confirm',
        message: `Are you sure you want to merge whole video files for ${row.hour}:00?`,
        cancel: true,
        persistent: true
      }).onOk(() => {
        const splits = selectedDate.value.split('_')
        const values: string[] = [];
        for (const split of splits){
          values.push(parseInt(split).toString());
        }
        values.push(row.hour);
        const fixedSelectedDate = values.join('_');
        void publishService.publishVideoMerge({source_id:props.sourceId, date_str: fixedSelectedDate});
        showMergeLoading.value = true;
      });
    };

    return {
      hours, nodeAddress, selected, lastIndex, tableRef, filter, innerFilter, selectedDate, onMerge,showMergeLoading,

      columns,
      pagination: {
        rowsPerPage: 0
      },

      innerColumns,
      innerPagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 10
      },

      recordEnabled, onPlay, onDownload, onDelete, showPlayer, selectedVideo, stream,
      onRefresh() {
        restoreList();
        void dataBind();
      },
      onRootClick
    };
  }
};

interface Hour {
  sourceId: string;
  hour: string;
  videoFiles: VideoFile[];
}
</script>

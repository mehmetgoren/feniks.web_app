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
            <DateTimeSelect />
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
                    <q-toggle v-model='props.expand' size='lg' color='accent' style='float: left;' disable/>
                    <div style='font-size: large;text-align: center;margin: 15px 0 0 0;'>
                      <label>{{ props.row.hour + ' : 00' }}</label>
                    </div>
                  </q-td>
                </q-tr>
                <q-tr v-show='props.expand' :props='props'>
                  <q-table
                    :rows='props.row.videoFiles'
                    :columns='innerColumns'
                    :pagination='innerPagination'
                    row-key='name'
                    :selected='selected'
                    :filter='innerFilter'>
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
                    <template v-slot:top-right>
                      <q-input borderless dense debounce='300' v-model='innerFilter' placeholder='Search'>
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
        <VideoPlayer :src="nodeAddress + selectedVideo.path" :auto-play='true' />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang='ts'>
import { useQuasar } from 'quasar';
import { onMounted, ref, onBeforeUnmount } from 'vue';
import { VideoFile } from 'src/utils/entities';
import { NodeService } from 'src/utils/services/node_service';
import { WsConnection } from 'src/utils/ws/connection';
import DateTimeSelect from 'src/components/DateTimeSelect.vue';
import VideoPlayer from 'src/components/VideoPlayer.vue';
import { fixArrayDates, getTodayString } from 'src/utils/utils';
import axios from 'axios';
import { StreamModel } from 'src/utils/models/stream_model';

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
    DateTimeSelect,
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
    let connStartRecord: WsConnection | null = null;
    let connStopRecord: WsConnection | null = null;
    const hours = ref<Hour[]>([]);
    const showPlayer = ref<boolean>(false);
    const selectedVideo = ref<VideoFile | null>(null);
    const filter = ref('');
    const innerFilter = ref('');
    const stream = ref<StreamModel>(nodeService.LocalService.createEmptyStream());
    const nodeAddress = ref<string>(nodeService.LocalService.nodeAddress);

    const today = getTodayString();

    const dataBind = async () => {
      stream.value = await nodeService.getStream(props.sourceId);
      recordEnabled.value = stream.value.record_enabled;

      const hourStrings = await nodeService.getRecordHours(props.sourceId, today);
      const _hours: Hour[] = [];
      for (const hs of hourStrings) {
        _hours.push({ sourceId: props.sourceId, hour: hs, videoFiles: [] });
      }
      hours.value = _hours;
    };

    onMounted(async () => {
      await dataBind();
    });

    onBeforeUnmount(() => {
      console.log('web socket connections will be closed');
      if (connStartRecord) {
        connStartRecord.close();
      }
      if (connStopRecord) {
        connStopRecord.close();
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
      console.log('downloading: ' + video.path);
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
    }

    const getHour = (hourStr: string): Hour => {
      return hours.value.filter((row: Hour) => row.hour === hourStr)[0];
    };
    let prevProbs: any = null;
    return {
      hours, nodeAddress,
      selected,
      lastIndex,
      tableRef,
      filter,
      innerFilter,

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

      recordEnabled,
      onPlay,
      onDownload,
      onDelete,
      showPlayer,
      selectedVideo,
      stream,
      onRefresh() {
        void dataBind();
      },

      async onRootClick(props: any) {
        if (prevProbs != null && prevProbs.row.hour == props.row.hour) {
          props.expand = !props.expand;
          return;
        }
        if (prevProbs != null) {
          prevProbs.expand = false;
        }

        for (const h of hours.value) {
          h.videoFiles = [];
        }prevProbs = props;

        props.expand = !props.expand;
        const hourStr = props.row.hour;
        const hour = getHour(hourStr);
        if (props.expand) {
          const videos = await nodeService.getRecords(props.row.sourceId, today, hourStr);
          fixArrayDates(videos, 'created_at', 'modified_at');
          hour.videoFiles = videos;
        } else {
          hour.videoFiles = [];
        }
      }
    };
  }
};

interface Hour {
  sourceId: string;
  hour: string;
  videoFiles: VideoFile[];
}
</script>

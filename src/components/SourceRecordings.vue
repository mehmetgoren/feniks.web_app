<template>
  <q-layout view='lHh lpr lFf' container style='height: 600px' class='shadow-2 rounded-borders'>
    <q-header elevated class='bg-purple'>
      <q-toolbar>
        <q-btn flat round dense icon='dvr' />
        <q-toolbar-title>
          Recording List ({{ source.name }})
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
            <q-toggle v-model='recordEnabled' disable checked-icon='check' color='red'
                      :label='"Recording " + (recordEnabled ? "On" : "Off")' />
            <DateTimeSelect />
          </div>
          <div class='col-9'>
            <q-table
              ref='tableRef'
              title='Videos'
              :rows='rows'
              :columns='columns'
              :pagination='pagination'
              row-key='name'
              selection='multiple'
              :selected='selected'
              @selection='onSelection'>
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
        <VideoPlayer :src="'http://localhost:2072' + selectedVideo.path" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang='ts'>
import { useQuasar } from 'quasar';
import { computed, onMounted, ref, onBeforeUnmount } from 'vue';
import { VideoFile } from 'src/utils/entities';
import { NodeService } from 'src/utils/services/node-service';
import { WsConnection } from 'src/utils/ws/connection';
import DateTimeSelect from 'src/components/DateTimeSelect.vue';
import VideoPlayer from 'src/components/VideoPlayer.vue';
import { fixArrayDates } from 'src/utils/utils';
import axios from 'axios';
import { StreamingModel } from 'src/utils/models/streaming_model';

const columns = [
  // //@ts-ignore
  // {align: 'center', label:'Finished', field: row =>((row.modified_at.getTime() - row.created_at.getTime()) / 60000 ).toString() + ' ago'},
  {
    name: 'created_at',
    align: 'center',
    label: 'Created',
    field: 'created_at',
    format: (val: any) => `${val.toLocaleString()}`,
    sortable: true
  },
  {
    name: 'modified_at',
    align: 'center',
    label: 'Ended',
    field: 'modified_at',
    format: (val: any) => `${val.toLocaleString()}`,
    sortable: true
  },
  { name: 'name', align: 'center', label: 'File Name', field: 'name', sortable: true },
  // //@ts-ignore
  // { name: 'path', align: 'center', label: 'File', field: row => row.path.replace(/^.*[\\\/]/, ''), sortable: true },
  { name: 'size', align: 'center', label: 'Size (MB)', field: 'size', sortable: true },
  { name: 'play', align: 'center', label: 'Play', field: 'play' },
  { name: 'download', align: 'center', label: 'Download', field: 'download' },
  { name: 'delete', align: 'center', label: 'Delete', field: 'delete' }
];

export default {
  name: 'SourceRecordings',
  components: {
    DateTimeSelect,
    VideoPlayer
  },
  props: {
    source: {
      type: Object,
      required: true
    }
  },
  setup(props: any) {
    const $q = useQuasar();
    const recordEnabled = ref<boolean>(false);
    // const streamingModel = ref<StreamingModel | null>(null);
    const nodeService = new NodeService();
    let connStartRecording: WsConnection | null = null;
    let connStopRecording: WsConnection | null = null;
    const pagination = ref({
      sortBy: 'desc',
      descending: false,
      page: 1,
      rowsPerPage: 10
    });
    const rows = ref<VideoFile[]>([]);
    const showPlayer = ref<boolean>(false);
    const selectedVideo = ref<VideoFile | null>(null);

    onMounted(async () => {
      const streamingModel: StreamingModel = props.source;
      recordEnabled.value = streamingModel.recording
      // streamingModel.value = await nodeService.getStreaming(props.source.id);
      const videos = await nodeService.getVideos(props.source.id);
      fixArrayDates(videos, 'created_at', 'modified_at');
      rows.value = videos;
    });

    onBeforeUnmount(() => {
      console.log('web socket connections will be closed');
      if (connStartRecording) {
        connStartRecording.close();
      }
      if (connStopRecording) {
        connStopRecording.close();
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
        url: 'http://localhost:2072' + video.path,
        method: 'GET',
        responseType: 'blob' // important
      }).then((response: any) => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require('downloadjs')(response.data, video.name, 'video/mp4');
      }).catch(console.error);
    }

    function onDelete(video: VideoFile) {
      nodeService.deleteVideos(video.source_id, [video.name])
        .then(() => {
          $q.notify({
            message: 'Video has been deleted',
            caption: 'Video Status',
            color: 'secondary'
          });
          rows.value = rows.value.filter((row: VideoFile) => row.name !== video.name);
        }).catch(console.error);
    }

    return {
      selected,
      lastIndex,
      tableRef,

      columns,
      pagination,
      rows,
      recordEnabled,
      onPlay,
      onDownload,
      onDelete,
      showPlayer,
      selectedVideo,

      pagesNumber: computed(() => {
        return Math.ceil(rows.value.length / pagination.value.rowsPerPage);
      }),

      //@ts-ignore
      onSelection({ rows, added, evt }) {
        if (rows.length === 0 || tableRef.value === void 0) {
          return;
        }

        const row = rows[0];
        //@ts-ignore
        const filteredSortedRows = tableRef.value.filteredSortedRows;
        const rowIndex = filteredSortedRows.indexOf(row);
        const localLastIndex = lastIndex.value;

        lastIndex.value = rowIndex;
        //@ts-ignore
        document.getSelection().removeAllRanges();

        if ($q.platform.is.mobile === true) {
          evt = { ctrlKey: true };
        } else if (evt !== Object(evt) || (evt.shiftKey !== true && evt.ctrlKey !== true)) {
          selected.value = added === true ? rows : [];
          return;
        }

        const operateSelection = added === true
          //@ts-ignore
          ? selRow => {
            //@ts-ignore
            const selectedIndex = selected.value.indexOf(selRow);
            if (selectedIndex === -1) {
              selected.value = selected.value.concat(selRow);
            }
          }
          //@ts-ignore
          : selRow => {
            //@ts-ignore
            const selectedIndex = selected.value.indexOf(selRow);
            if (selectedIndex > -1) {
              selected.value = selected.value.slice(0, selectedIndex).concat(selected.value.slice(selectedIndex + 1));
            }
          };

        if (localLastIndex === null || evt.shiftKey !== true) {
          operateSelection(row);
          return;
        }

        const from = localLastIndex < rowIndex ? localLastIndex : rowIndex;
        const to = localLastIndex < rowIndex ? rowIndex : localLastIndex;
        for (let i = from; i <= to; i += 1) {
          operateSelection(filteredSortedRows[i]);
        }
      }
    };
  }
};
</script>

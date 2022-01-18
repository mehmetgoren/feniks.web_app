<template>
  <q-layout view='lHh lpr lFf' container style='height: 600px' class='shadow-2 rounded-borders'>
    <q-header elevated class='bg-cyan'>
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
        <q-toggle
          v-model='recordEnabled'
          checked-icon='check'
          color='red'
          @update:model-value='onRecordEnabledChanged'
          :label='"Recording " + (recordEnabled ? "On" : "Off")'
        />
        <q-table
          ref='tableRef'
          title='Videos'
          :rows='rows'
          :columns='columns'
          :pagination='pagination'
          row-key='name'
          selection='multiple'
          :selected='selected'
          @selection='onSelection'
        />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang='ts'>
import { useQuasar } from 'quasar';
import { computed, onMounted, ref, onBeforeUnmount } from 'vue';
import { RecordingModel, VideoFile } from 'src/utils/entities';
import { WebsocketService } from 'src/utils/services/websocket-service';
import { NodeService } from 'src/utils/services/node-service';
import { WsConnection } from 'src/utils/ws/connection';

const columns = [
  { name: 'name', align: 'center', label: 'Name', field: 'name', sortable: true },
  { name: 'path', align: 'center', label: 'Path', field: 'path', sortable: true },
  { name: 'size', align: 'center', label: 'Size (MB)', field: 'size', sortable: true },
  { name: 'created_at', align: 'center', label: 'Created Time', field: 'created_at', sortable: true },
  { name: 'modified_at', align: 'center', label: 'Modified Time', field: 'modified_at', sortable: true }
];

export default {
  name: 'SourceRecordings',
  props: {
    source: {
      type: Object,
      required: true
    }
  },
  setup(props: any) {
    const $q = useQuasar();
    const recordEnabled = ref<boolean>(false);
    const recordModel = ref<RecordingModel | null>(null);
    const websocketService = new WebsocketService();
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

    const onRecordEnabledChanged = (newValue: boolean) => {
      console.log(`onRecordEnabledChanged: ${newValue}`);
      if (recordEnabled.value) {
        websocketService.startRecording('localhost', props.source).then(() => {
          console.log('recording request has been started');
        }).catch((err) => {
          console.log('recording request had an error: ' + err);
        });
      } else {
        websocketService.stopRecording('localhost', props.source).then(() => {
          console.log('recording request has been stopped');
        }).catch((err) => {
          console.log('recording request had an error: ' + err);
        });
      }
    };

    onMounted(async () => {
      console.log('fcukkkk ' + JSON.stringify(props.source));
      // todo: localhost should be replaced with real node ip
      recordModel.value = await nodeService.getRecording('localhost', props.source.id);
      recordEnabled.value = recordModel.value !== null;
      rows.value = await nodeService.getVideos('localhost', props.source.id);

      function onStartRecordingMessage(event: MessageEvent) {
        recordModel.value = JSON.parse(event.data);

        $q.notify({
          message: 'Recording has been started',
          caption: 'Recording Status',
          color: 'secondary'
        });
      }
      connStartRecording = websocketService.openStartRecordingConnection(onStartRecordingMessage);

      function onStopRecordingMessage(event: MessageEvent) {
        console.log('onStopRecordingMessage: ' + event.data);
        $q.notify({
          message: 'Recording has been stopped',
          caption: 'Recording Status',
          color: 'secondary'
        });
      }
      connStopRecording = websocketService.openStopRecordingConnection(onStopRecordingMessage);
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

    return {
      selected,
      lastIndex,
      tableRef,

      columns,
      pagination,
      rows,
      recordEnabled,
      onRecordEnabledChanged,

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

<template>
  <q-layout view='lHh lpr lFf' container style='height: 600px' class='shadow-2 rounded-borders'>
    <q-header elevated class='bg-cyan'>
      <q-toolbar>
        <q-btn flat round dense icon='dvr' />
        <q-toolbar-title>
          Recording List
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
          v-model='record'
          checked-icon='check'
          color='red'
          :label='"Recording " + (record ? "On" : "Off")'
        />
        <q-table
          ref='tableRef'
          title='Treats'
          :rows='rows'
          :columns='columns'
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
import { onMounted, ref, watch } from 'vue';
import { RecordingEvent, VideoFile } from 'src/utils/entities';
import { WsConnection } from 'src/utils/ws/connection';
import { NodeService } from 'src/utils/services/node-service';

const columns = [
  { name: 'name', align: 'center', label: 'Name', field: 'name' },
  { name: 'path', align: 'center', label: 'Path', field: 'path' },
  { name: 'size', align: 'center', label: 'Size', field: 'size' },
  { name: 'created_at', align: 'center', label: 'Created Time', field: 'created_at' },
  { name: 'modified_at', align: 'center', label: 'Modified Time', field: 'modified_at' },
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
    const record = ref<boolean>(false);
    const nodeService = new NodeService();
    const rows = ref<VideoFile[]>([]);

    watch(record, (newValue: boolean) => {
      console.log(`record enable: ${newValue}`);
      if (record.value) {
        nodeService.startRecording('localhost', props.source).then(() => {
          console.log('recording request has been started');
        }).catch((err) => {
          console.log('recording request had an error: ' + err);
        });
      }
    });

    onMounted(async () => {
      // todo: localhost should be replaced with real node ip
      rows.value = await nodeService.getVideos('localhost', props.source.id);

      function onMessage(event: MessageEvent) {
        const source: RecordingEvent = JSON.parse(event.data);
        console.log('wsrecording.onMessage occurred');
        console.log(source);
        // const url = 'http://localhost:2072/livestream/' + source.output_file;
        // if (new List<any>(sourceList).FirstOrDefault(x => x.src == url) == null) {
        //   sourceList.push({ src: url, id: source.id, name: source.name, show: true });
        //   open.value = false;
        //   setTimeout(() => {
        //     open.value = true;
        //     nextTick().then(() => {
        //       const grid = GridStack.init({
        //         float: true
        //       });
        //       GridStack.setupDragIn(
        //         '.newWidget'
        //       );
        //       grid.compact();
        //       console.log(JSON.stringify(sourceList));
        //       $store.commit('settings/setSourceLoading', false);
        //     }).catch(console.error);
        //   }, 250);
        // } else {
        //   $store.commit('settings/setSourceLoading', false);
        // }
      }

      new WsConnection('wsrecording', onMessage);
    });


    const selected = ref([]);
    const lastIndex = ref(null);
    const tableRef = ref(null);

    return {
      record,
      selected,
      lastIndex,
      tableRef,

      columns,
      rows,

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

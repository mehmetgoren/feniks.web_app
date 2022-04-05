<template>
  <q-layout view='lHh lpr lFf' container style='height: 1000px' class='shadow-2 rounded-borders'>
    <q-page-container>
      <q-page padding style='background-color: whitesmoke;'>
        <div class='row'>
          <div class='col-12'>
            <q-table title='Video Clips' :rows='rows' :columns='columns' :pagination='pagination' row-key='file_name' :filter='filter'>
              <template v-slot:body='props'>
                <q-tr :props='props' @click='props.expand = !props.expand' style='cursor: pointer;'>
                  <q-td key='base64_image'>
                    <q-img :src='`data:image/png;base64, ${props.row.detected_image.base64_image}`' />
                  </q-td>
                  <q-td key='objects'>
                    <label v-for='(item, index) in props.row.detected_image.detected_objects' :key='index'>{{ item.pred_cls_name }}<br></label>
                  </q-td>
                  <q-td key='created_at' :props='props'>{{ props.row.created_at.toLocaleString() }}</q-td>
                </q-tr>
                <q-tr v-show='props.expand' :props='props'>
                  <q-td colspan='100%'>
                    <div class="q-pa-md q-gutter-sm"  style='margin: 5px;'>
                      <q-btn color="primary" icon="theaters" label="Download Clip"
                             @click='handleDownloadClip("http://127.0.0.1:2072/playback/"+ props.row.file_name, props.row.file_name)'/>
                      <q-btn color="secondary" icon="photo_camera" label="Download Snapshot"
                             @click='handleDownloadSnapshot(props.row.detected_image.base64_image)'  />
                      <q-btn color="red" icon="delete" label="Delete Event" @click='handleDeleteClip(props.row)' />
                      <q-btn color="grey" icon="clear" label="Close" @click='props.expand = !props.expand' />
                    </div>
                    <br>
                    <div style='width: 480px;float: left;margin-right: 5px;' >
                      <VideoPlayer :src="'http://localhost:2072/playback/' + props.row.file_name" :auto-play='false' />
                    </div>
                    <div class="q-pa-md" style="width: 350px;float:left;margin: 0 5px 0 5px" >
                      <q-table dense :rows="props.row.detected_image.detected_objects" :columns="detectedObjectColumns" row-key="pred_cls_idx"
                      :pagination='{rowsPerPage: 5}'/>
                    </div>
                    <div class="q-pa-md" style='width: 350px;float: left; margin-left:5px;'>
                      <q-list bordered separator>
                        <q-item clickable v-ripple>
                          <q-item-section>
                            <q-item-label overline>Created At</q-item-label>
                            <q-item-label>{{props.row.created_at.toLocaleString()}}</q-item-label>
                          </q-item-section>
                        </q-item>
                        <q-item v-ripple>
                          <q-item-section>
                            <q-item-label overline>Last Modified At</q-item-label>
                            <q-item-label>{{props.row.last_modified.toLocaleString()}}</q-item-label>
                          </q-item-section>
                        </q-item>
                        <q-item v-ripple>
                          <q-item-section>
                            <q-item-label overline>Duration</q-item-label>
                            <q-item-label>{{props.row.duration}} sec</q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </div>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang='ts'>
import VideoPlayer from 'src/components/VideoPlayer.vue';
import { StreamModel } from 'src/utils/models/stream_model';
import { onMounted, ref } from 'vue';
import { LocalService } from 'src/utils/services/local_service';
import { VideoClipJsonObject } from 'src/utils/models/video_clip_json_object';
import { NodeService } from 'src/utils/services/node_service';
import { downloadFile, fixArrayDates, getTodayString } from 'src/utils/utils';

export default {
  name: 'SourceVideoClips',
  props: {
    sourceId: {
      type: String,
      required: true
    }
  },
  components:{
    VideoPlayer
  },
  setup(props: any) {
    const localService = new LocalService();
    const stream = ref<StreamModel>(localService.createEmptyStream());
    const rows = ref<VideoClipJsonObject[]>([]);
    const nodeService = new NodeService();
    const pagination = ref({
      sortBy: 'desc',
      descending: false,
      page: 1,
      rowsPerPage: 10
    });
    const filter = ref<string>('');

    const refreshFn = async () => {
      rows.value = await nodeService.getVideoClips(props.sourceId, getTodayString());
      fixArrayDates(rows.value, 'created_at', 'last_modified');
    };

    onMounted(async () => {
      stream.value = await nodeService.getStream(props.sourceId);
      await refreshFn();
    });

    function handleDownloadClip(url :string, fileName: string){
      downloadFile(url, fileName,'video/mp4')
    }

    function handleDownloadSnapshot(base64Image: string){
      window.location.href = 'data:application/octet-stream;base64,' + base64Image;
    }

    async function handleDeleteClip(item :VideoClipJsonObject){
      await nodeService.deleteVideoClip(item.file_name);
      await refreshFn();
    }

    return {
      rows,
      stream,
      columns,
      pagination,
      filter,
      detectedObjectColumns,
      handleDownloadClip,
      handleDownloadSnapshot,
      handleDeleteClip
    };
  }
};
const columns = [
  { name: 'base64_image', align: 'left', label: '', field: 'base64_image', sortable: false },
  { name: 'objects', align: 'left', label: 'Objects', field: 'objects', sortable: true },
  // { name: 'score', align: 'center', label: 'Score', field: 'score', sortable: true },
  { name: 'created_at', align: 'left', label: 'Date', field: 'created_at', sortable: true }
];
const detectedObjectColumns = [
  { name: 'pred_cls_name', align: 'left', label: 'Object', field: 'pred_cls_name', sortable: false },
  { name: 'pred_score', align: 'left', label: 'Score', field: 'pred_score', sortable: false }
];
</script>

<style scoped>

</style>

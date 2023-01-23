<template>
  <div>
    <q-layout view='hHh Lpr lff' container style='height: 900px' class='shadow-2 rounded-borders'>
      <q-header elevated class='bg-deep-purple-14'>
        <q-toolbar :class="'bg-' + color + ' text-white'">
          <q-btn flat round dense :icon="selectedFeature.icon" class="q-mr-sm"/>
          <q-toolbar-title>{{$t('ai_images')}}</q-toolbar-title>
          <q-tabs v-model="tab" shrink :active-bg-color="color">
            <q-tab name="od" icon="collections" :label="$t('object_detection')" :disable="treeLoading||imagesLoading"/>
            <q-tab name="fr" icon="face" :label="$t('face_recognition')" :disable="treeLoading||imagesLoading"/>
            <q-tab name="alpr" icon="drive_eta" :label="$t('license_plate_recognition')" :disable="treeLoading||imagesLoading"/>
          </q-tabs>
          <q-space/>
          <div style='background-color: whitesmoke;margin-right: 5px;'>
            <DateTimeSelector :dense="true" :color='color' :show-hour='false' :label-date="$t('date')" :disable="treeLoading"
                              @date-changed='onDateChanged'/>
          </div>
          <q-btn class="gt-xs" :color='color' :label="$t('refresh')" icon='restore_page' @click='onRefresh' :disable='refreshLoading||imagesLoading'>
            <q-inner-loading :showing='refreshLoading' />
          </q-btn>
        </q-toolbar>
      </q-header>

      <q-drawer v-model='drawer' show-if-above :width='300' :breakpoint='500' bordered class='bg-grey-3'>
        <q-scroll-area class='fit'>
          <q-tree :nodes='treeItems' node-key='fullPath' v-model:expanded='selectedKeys' :no-nodes-label="$t('no_dir_here')"
                  v-model:selected='selected' @update:selected='handleTreeSelected' />
          <q-inner-loading :showing='treeLoading' />
        </q-scroll-area>
      </q-drawer>

      <q-page-container>
        <q-page padding>
          <div style='width: 1290px;height: 730px;'>
            <viewer :images='images'>
              <img v-for='image in images' :key='image.id' :src='image.imagePath' :alt="$t('no_image')">
            </viewer>
            <q-inner-loading :showing='imagesLoading'>
              <q-spinner-gears size='150px' color='amber' />
            </q-inner-loading>
          </div>
        </q-page>
      </q-page-container>
    </q-layout>
  </div>
</template>
<script lang='ts'>
import {onMounted, ref, watch} from 'vue';
import { NodeService } from 'src/utils/services/node_service';
import { FolderTreeItem, ImageItem } from 'src/utils/models/detected';
import DateTimeSelector from 'src/components/DateTimeSelector.vue';
import { getTodayString } from 'src/utils/utils';
import {AiClipQueryViewModel} from 'src/utils/models/ai_clip_view_models';
import {SelectedAiFeature} from 'src/utils/models/ai_data_dtos';
import {useI18n} from 'vue-i18n';

export default {
  name: 'AiImageGallery',
  components: { DateTimeSelector },
  props: {
    odModel: {
      type: Object,
      required: true
    }
  },
  setup(props: any) {
    const { t } = useI18n({ useScope: 'global' });
    const tab = ref<string>('od')
    const params = ref<AiClipQueryViewModel>({
      ai_type: 0,
      source_id: props.sourceId,
      date:  getTodayString()
    });
    const selectedFeature = ref<SelectedAiFeature>({name: t('object_detection'), icon: 'collections'});
    watch(tab, (newValue: string) => {
      switch (newValue) {
        case 'od':
          color.value = 'deep-purple-14';
          params.value.ai_type = 0;
          selectedFeature.value.name = t('object_detection');
          selectedFeature.value.icon = 'collections';
          void onRefresh();
          break;
        case 'fr':
          color.value = 'deep-orange-7';
          params.value.ai_type = 1;
          selectedFeature.value.name = t('face_recognition');
          selectedFeature.value.icon = 'face';
          void onRefresh();
          break;
        case 'alpr':
          color.value = 'blue-grey-6';
          params.value.ai_type = 2;
          selectedFeature.value.name = t('license_plate_recognition');
          selectedFeature.value.icon = 'drive_eta';
          void onRefresh();
          break;
      }
    })
    const color = ref<string>('deep-purple-14')

    const nodeService = new NodeService();
    const treeItems = ref<FolderTreeItem[]>([]);
    const selected = ref<string>('detected');
    const selectedKeys = ref<string[]>([]);
    const images = ref<ImageItem[]>([]);
    const treeLoading = ref<boolean>(true);
    const imagesLoading = ref<boolean>(false);
    const refreshLoading = ref<boolean>(false);
    let prevSelected = '';

    function walk(folders: FolderTreeItem[]) {
      if (!folders || !folders.length) {
        return;
      }
      for (const folder of folders) {
        if (!folder) continue;
        folder.iconColor = 'yellow-14';
        if (folder.children && folder.children.length) {
          //@ts-ignore
          folder.label = params.value.date.replaceAll('_','.');
        }else{
          folder.label += ':00';
        }
        selectedKeys.value.push(folder.fullPath);
        walk(folder.children);
      }
    }

    async function databind() {
      try {
        treeLoading.value = true;
        const directories = await nodeService.getAiImagesFolders(props.odModel.id, params.value.date, params.value.ai_type);
        if (!directories || !directories.length || !directories[0]) {
          treeItems.value = [];
          images.value = [];
          return;
        }
        walk(directories);
        treeItems.value = directories;
      } finally {
        treeLoading.value = false;
      }
    }

    onMounted(async () => {
      await databind();
    });

    async function handleTreeSelected(selection: string) {
      try {
        imagesLoading.value = true;
        const items = await nodeService.getOdImages({ rootPath: selection, sourceId: props.odModel.id, ai_type:params.value.ai_type });
        if (items && items.length > 0) {
          for (const item of items) {
            item.imagePath = await nodeService.LocalService.getNodeAddress(item.imagePath);
          }
        }
        images.value = items;
        prevSelected = selection;
      } finally {
        imagesLoading.value = false;
      }
    }

    async function onRefresh() {
      refreshLoading.value = true;
      try {
        await databind();
        if (prevSelected) {
          await handleTreeSelected(prevSelected);
        }
      } finally {
        refreshLoading.value = false;
      }
    }

    function onDateChanged(dateStr: string) {
      params.value.date = dateStr;
      void databind();
    }

    return {
      tab, color, selected, images, imagesLoading, selectedKeys, refreshLoading, selectedFeature,
      drawer: ref(false),
      handleTreeSelected, treeLoading, onDateChanged, onRefresh,
      treeItems
    };
  }
};
</script>

<style scoped>

</style>

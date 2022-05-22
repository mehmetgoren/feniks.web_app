<template>
  <div class='q-pa-md'>
    <q-layout view='hHh Lpr lff' container style='height: 900px' class='shadow-2 rounded-borders'>
      <q-header elevated class='bg-blue-12'>
        <q-toolbar>
          <q-btn flat @click='drawer = !drawer' round dense icon='menu' />
          <q-toolbar-title>
            Detected Images
            <q-icon name='collections'></q-icon>
          </q-toolbar-title>
          <q-btn icon='event' color='orange'>
            <q-popup-proxy cover transition-show='scale' transition-hide='scale'>
              <q-date mask='YYYY_MM_DD' v-model='selectedDate' color='orange' @update:model-value='onDateChanged'>
                <div class='row items-center justify-end q-gutter-sm'>
                  <q-btn label='OK' color='orange' flat v-close-popup />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-btn>
        </q-toolbar>
      </q-header>

      <q-drawer v-model='drawer' show-if-above :width='300' :breakpoint='500' bordered class='bg-grey-3'>
        <q-scroll-area class='fit'>
          <q-tree :nodes='treeItems' node-key='fullPath' v-model:expanded='selectedKeys' no-nodes-label='No folder here'
                  v-model:selected='selected' @update:selected='handleTreeSelected' />
          <q-inner-loading :showing='treeLoading' />
        </q-scroll-area>
      </q-drawer>

      <q-page-container>
        <q-page padding>
          <div style='width: 1290px;height: 730px;'>
            <viewer :images='images'>
              <img v-for='image in images' :key='image.id' :src='image.imagePath' alt='no image'>
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
import { onMounted, ref } from 'vue';
import { NodeService } from 'src/utils/services/node_service';
import { FolderTreeItem, ImageItem } from 'src/utils/models/detected';
import { getTodayString } from 'src/utils/utils';

export default {
  name: 'OdImageGallery',
  props: {
    odModel: {
      type: Object,
      required: true
    }
  },
  setup(props: any) {
    const nodeService = new NodeService();
    const treeItems = ref<FolderTreeItem[]>([]);
    const selected = ref<string>('detected');
    const selectedKeys = ref<string[]>([]);
    const images = ref<ImageItem[]>([]);
    const treeLoading = ref<boolean>(true);
    const imagesLoading = ref<boolean>(false);
    const selectedDate = ref<string>(getTodayString());

    function walk(folders: FolderTreeItem[]) {
      if (!folders || !folders.length) {
        return;
      }
      for (const folder of folders) {
        if (!folder) continue;
        folder.iconColor = 'yellow-14';
        selectedKeys.value.push(folder.fullPath);
        walk(folder.children);
      }
    }

    async function dataBind() {
      try {
        treeLoading.value = true;
        const directories = await nodeService.getOdImagesFolders(props.odModel.id, selectedDate.value);
        if (!directories||!directories.length || !directories[0]){
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
      await dataBind();
    });

    async function handleTreeSelected(selection: string) {
      try {
        imagesLoading.value = true;
        const items = await nodeService.getOdImages({ rootPath: selection, sourceId: props.odModel.id });
        if (items && items.length > 0) {
          for (const item of items) {
            item.imagePath = nodeService.LocalService.getNodeAddress(item.imagePath);
          }
        }
        images.value = items;
      } finally {
        imagesLoading.value = false;
      }
    }

    function onDateChanged() {
      void dataBind();
    }

    return {
      selected, images, imagesLoading, selectedKeys, selectedDate,
      drawer: ref(false),
      handleTreeSelected, treeLoading, onDateChanged,
      treeItems
    };
  }
};
</script>

<style scoped>

</style>

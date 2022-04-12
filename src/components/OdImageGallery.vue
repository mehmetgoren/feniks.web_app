<template>
  <div class='q-pa-md'>
    <q-layout view='hHh Lpr lff' container style='height: 900px' class='shadow-2 rounded-borders'>
      <q-header elevated class='bg-black'>
        <q-toolbar>
          <q-btn flat @click='drawer = !drawer' round dense icon='menu' />
          <q-toolbar-title>Detected Images</q-toolbar-title>
        </q-toolbar>
      </q-header>

      <q-drawer v-model='drawer' show-if-above :width='300' :breakpoint='500' bordered class='bg-grey-3'>
        <q-scroll-area class='fit'>
          <q-tree :nodes='treeItems' node-key='fullPath' v-model:selected='selected' @update:selected='handleTreeSelected' default-expand-all />
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
    const images = ref<ImageItem[]>([]);
    const treeLoading = ref<boolean>(true);
    const imagesLoading = ref<boolean>(false);

    onMounted(async () => {
      treeItems.value = await nodeService.getOdImagesFolders(props.odModel.id);
      treeLoading.value = false;
    });

    async function handleTreeSelected(selection: string) {
      try {
        imagesLoading.value = true;
        const items = await nodeService.getOdImages({ rootPath: selection, sourceId: props.odModel.id });
        if (items.length > 0) {
          for (const item of items) {
            item.imagePath = nodeService.getAddress(item.imagePath);
          }
        }
        images.value = items;
      } finally {
        imagesLoading.value = false;
      }
    }

    return {

    }
  }
};
</script>

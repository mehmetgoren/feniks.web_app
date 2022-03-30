<template>
  <div class="q-pa-md">
    <q-layout view="hHh Lpr lff" container style="height: 900px" class="shadow-2 rounded-borders">
      <q-header elevated class="bg-black">
        <q-toolbar>
          <q-btn flat @click="drawer = !drawer" round dense icon="menu" />
          <q-toolbar-title>Detected Images</q-toolbar-title>
        </q-toolbar>
      </q-header>

      <q-drawer v-model="drawer" show-if-above :width="300" :breakpoint="500" bordered class="bg-grey-3">
        <q-scroll-area class="fit">
          <q-tree :nodes="treeItems" node-key="fullPath" v-model:selected='selected' @update:selected='handleTreeSelected' default-expand-all  />
          <q-inner-loading :showing='treeLoading' />
        </q-scroll-area>
      </q-drawer>

      <q-page-container>
        <q-page padding>
          <div style='width: 1290px;height: 730px;' >
            <q-carousel swipeable animated arrows v-model="slide" v-model:fullscreen="fullscreen" navigation infinite height='720px'>
              <q-carousel-slide v-for='image in images' :key='image.id' :name="image.id"
                                :img-src="'data:image/png;base64,' + image.base64Image"/>
              <template v-slot:control>
                <q-carousel-control position="bottom-right" :offset="[18, 18]">
                  <q-btn push round dense color="white" text-color="primary" :icon="fullscreen ? 'fullscreen_exit' : 'fullscreen'"
                         @click="fullscreen = !fullscreen" />
                </q-carousel-control>
              </template>
            </q-carousel>
            <q-inner-loading :showing='imagesLoading'>
              <q-spinner-gears size="150px" color="amber" />
            </q-inner-loading>
          </div>
        </q-page>
      </q-page-container>
    </q-layout></div>
</template>

<script lang='ts'>
import { onMounted, ref } from 'vue';
import { NodeService } from 'src/utils/services/node-service';
import { FolderTreeItem, ImageItem } from 'src/utils/models/detected';
export default {
  name: 'DetectedImageGallery',
  props: {
    odModel: {
      type: Object,
      required: true
    }
  },
  setup (props: any) {
    const nodeService = new NodeService();
    const treeItems = ref<FolderTreeItem[]>([]);
    const selected = ref<string>('detected');
    const slide = ref<string>('1')
    const images = ref<ImageItem[]>([]);
    const treeLoading = ref<boolean>(true);
    const imagesLoading = ref<boolean>(false);

    onMounted(async () => {
      treeItems.value = await nodeService.getDetectedFolders();
      treeLoading.value = false;
    });

    async function handleTreeSelected(selection: string){
      try {
        imagesLoading.value = true;
        const items = await nodeService.getDetectedImages({ rootPath: selection, sourceId: props.odModel.id });
        if (items.length > 0) {
          slide.value = items[0].id;
        }
        images.value = items;
      }finally {
        imagesLoading.value = false;
      }
    }

    return {
      treeItems, selected, images, treeLoading, imagesLoading,
      drawer: ref(false),
      slide, fullscreen: ref(false),
      handleTreeSelected
    }
  }
};
</script>

<style scoped>

</style>

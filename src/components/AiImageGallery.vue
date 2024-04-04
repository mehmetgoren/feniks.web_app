<template>
  <div>
    <q-layout view='hHh Lpr lff' container style='height: 900px' class='shadow-2 rounded-borders'>
      <q-header elevated :class="'bg-' + color + ' text-white'">
        <q-toolbar :class=" 'text-white'">
          <q-icon name='collections' />
          <q-toolbar-title>{{ $t('ai_gallery') }}</q-toolbar-title>
          <q-space />
          <q-select class="bg-white" dense emit-value map-options filled v-model='selectedAiModule' :options='aiModulesOptions'
                    :label="$t('select_ai_module')" transition-show='scale' transition-hide='scale' style="width: 300px"
          :disable="treeLoading" />
          <q-space />
          <div style='background-color: whitesmoke;margin-right: 5px;'>
            <DateTimeSelector :dense="true" :color='color' :show-date="true" :show-hour='false' :label-date="$t('date')" :disable="treeLoading"
                              @date-changed='onDateChanged' />
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

<script lang='ts' setup>
import { onMounted, PropType, ref, watch } from 'vue';
import { NodeService } from 'src/utils/services/node_service';
import { FolderTreeItem, ImageItem } from 'src/utils/models/detected';
import DateTimeSelector from 'src/components/DateTimeSelector.vue';
import { getTodayString } from 'src/utils/utils';
import { AiClipQueryViewModel } from 'src/utils/models/ai_clip_view_models';
import { SmartVisionModel } from 'src/utils/models/ai_model';
import { SelectOption } from 'src/utils/services/local_service';
import { AiModuleModel } from 'src/utils/models/ai_module_model';

const props = defineProps({
  smartVisionModel: {
    type: Object as PropType<SmartVisionModel>, // type is SourceMode
    required: true
  }
});

const params = ref<AiClipQueryViewModel>({
  module: '',
  source_id: props.smartVisionModel?.id,
  date: getTodayString()
});
const color = ref<string>('deep-purple-14');

const nodeService = new NodeService();
const treeItems = ref<FolderTreeItem[]>([]);
const selected = ref<string>('detected');
const selectedKeys = ref<string[]>([]);
const images = ref<ImageItem[]>([]);
const treeLoading = ref<boolean>(true);
const imagesLoading = ref<boolean>(false);
const refreshLoading = ref<boolean>(false);
const aiModulesOptions = ref<SelectOption[]>([]);
const selectedAiModule = ref<string>('od');
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
      folder.label = params.value.date.replaceAll('_', '.');
    } else {
      folder.label += ':00';
    }
    selectedKeys.value.push(folder.fullPath);
    walk(folder.children);
  }
}

watch(selectedAiModule, async () => {
  if (prevSelected) {
    await handleTreeSelected(prevSelected);
  }
});

async function databind() {
  try {
    treeLoading.value = true;
    params.value.module = selectedAiModule.value;
    const directories = await nodeService.getAiImagesFolders(props.smartVisionModel.id, params.value.date);
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
  aiModulesOptions.value = (await nodeService.getAiModules()).map((item:AiModuleModel) => ({ label: item.description, value: item.name }));
  await databind();
});

async function handleTreeSelected(selection: string) {
  try {
    imagesLoading.value = true;
    const items = await nodeService.getAiImages({ rootPath: selection, sourceId: props.smartVisionModel.id, module: selectedAiModule.value });
    if (items && items.length > 0) {
      for (const item of items) {
        item.imagePath = nodeService.LocalService.getServerAddressWithoutDash(item.imagePath);
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

const drawer = ref(false);

</script>

<style scoped>

</style>

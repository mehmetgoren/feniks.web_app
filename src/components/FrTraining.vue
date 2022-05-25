<template>
  <div class='q-pa-md'>
    <q-layout view='hHh Lpr lff' container style='height: 900px' class='shadow-2 rounded-borders'>
      <q-header elevated class='bg-deep-purple-9'>
        <q-toolbar class='bg-deep-purple-9'>
          <q-btn flat round dense icon='menu' @click='drawer = !drawer' />
          <q-icon name='face' size='28px' />
          <q-toolbar-title>
            <strong>Face Training</strong>
          </q-toolbar-title>
        </q-toolbar>
      </q-header>

      <q-drawer v-model='drawer' show-if-above :width='300' :breakpoint='500' bordered class='bg-grey-3'>
        <q-scroll-area class='fit'>
          <q-list bordered separator>
            <q-item clickable v-ripple v-for='person in people' :key='person.name'
                    :active='link === person.name' active-class='my-menu-link' @click='onLeftPersonMenuClicked(person)'>
              <q-item-section>{{ person.name }}</q-item-section>
              <q-item-section v-if='person.image_paths&&person.image_paths.length' avatar>
                <q-avatar>
                  <img :src='person.image_paths[0]' alt='no image' />
                </q-avatar>
              </q-item-section>
            </q-item>
            <q-separator />
          </q-list>
        </q-scroll-area>
      </q-drawer>

      <q-page-container>
        <q-page padding>
          {{ selectedPerson }}
          <ViewerComponent v-if='showGallery' :images='images' :show-delete='true' @on-delete='onImageDelete' />
          <q-inner-loading :showing='showPageLoading' />
        </q-page>
      </q-page-container>
    </q-layout>
  </div>
</template>

<script lang='ts'>
import { onMounted, ref } from 'vue';
import ViewerComponent from 'src/components/ViewerComponent.vue';
import { FrTrainViewModel } from '../utils/models/fr_models';
import { NodeService } from '../utils/services/node_service';
import { ImageItem } from 'src/utils/models/detected';

export default {
  name: 'FrTraining',
  components:{ViewerComponent},
  setup() {
    const people = ref<FrTrainViewModel[]>([]);
    const selectedPerson = ref<FrTrainViewModel>({ name: '', image_paths: [] });
    const link = ref<string>('');
    const nodeService = new NodeService();
    const images = ref<ImageItem[]>([]);
    const showPageLoading = ref<boolean>(false);
    const showGallery = ref<boolean>(true);

    const dataBind = async () =>{
      const items = await nodeService.getFrTrainPersons();
      if (items && items.length > 0) {
        for (const item of items) {
          if (item && item.image_paths && item.image_paths.length) {
            for (let j = 0; j < item.image_paths.length; ++j) {
              item.image_paths[j] = nodeService.LocalService.getNodeAddress(item.image_paths[j]);
            }
          }
        }
        link.value = items[0].name;
        if (selectedPerson.value.name){
          await onLeftPersonMenuClicked(selectedPerson.value);
        }else{
          await onLeftPersonMenuClicked(items[0]);
        }
      }
      people.value = items;
    }

    onMounted(async () => {
      await dataBind();
    });

    async function onLeftPersonMenuClicked(person: FrTrainViewModel) {
      selectedPerson.value = person;
      link.value = person.name;

      showPageLoading.value = true;
      try {
        const items = await nodeService.getFrTrainPersonImages(person.name);
        if (items && items.length > 0) {
          for (const item of items) {
            if (item && item.imagePath) {
              item.imagePath = nodeService.LocalService.getNodeAddress(item.imagePath);
            }
          }
        }
        images.value = items;
      } finally {
        showPageLoading.value = false;
      }
    }

    return {
      drawer: ref<boolean>(true),
      people, selectedPerson, link, images, showPageLoading, showGallery,
      onLeftPersonMenuClicked,
      async onImageDelete(src: string){
        await nodeService.deleteFrTrainPersonImage(src);
        showGallery.value = false;
        setTimeout(() => {
          showGallery.value = true;
          void dataBind();
        }, 100);
      }
    };
  }
};

</script>

<style lang='sass'>
.my-menu-link
  color: white
  background: $deep-purple-9
</style>
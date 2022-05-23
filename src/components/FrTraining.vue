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
        </q-page>
      </q-page-container>
    </q-layout>
  </div>
</template>

<script lang='ts'>
import { onMounted, ref } from 'vue';
import { FrTrainViewModel } from '../utils/models/fr_models';
import { NodeService } from '../utils/services/node_service';

export default {
  name: 'FrTraining',
  setup() {
    const people = ref<FrTrainViewModel[]>([]);
    const selectedPerson = ref<FrTrainViewModel>({ name: '', image_paths: [] });
    const link = ref<string>('');
    const nodeService = new NodeService();

    onMounted(async () => {
      const items = await nodeService.getFrTrainPersons();
      console.log(JSON.stringify(people.value));
      if (items && items.length > 0) {
        for (const item of items) {
          if (item && item.image_paths && item.image_paths.length) {
            for (let j = 0; j < item.image_paths.length; ++j) {
              item.image_paths[j] = nodeService.LocalService.getNodeAddress(item.image_paths[j]);
            }
          }
        }
        link.value = items[0].name;
      }
      people.value = items;
    });

    function onLeftPersonMenuClicked(person: FrTrainViewModel) {
      selectedPerson.value = person;
      link.value = person.name;
    }

    return {
      drawer: ref<boolean>(true),
      people, selectedPerson, link,
      onLeftPersonMenuClicked
    };
  }
};
</script>

<style lang='sass'>
.my-menu-link
  color: white
  background: $deep-purple-9
</style>
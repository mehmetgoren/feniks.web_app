<template>
  <div class='q-pa-sm'>
    <q-card class='my-card' style='max-width: 570px' >
      <q-card-section class='bg-purple text-white'>
        <div class='text-subtitle2'>Predefined Cameras</div>
      </q-card-section>
      <q-card-actions align='left'>
        <q-table
          title='Cameras'
          :rows='cameras'
          :columns='columns'
          row-key='id'
          :filter='filter'
        >
          <template v-slot:top-right>
            <q-input borderless dense debounce='300' v-model='filter' placeholder='Search'>
              <template v-slot:append>
                <q-icon name='search' />
              </template>
            </q-input>
          </template>
        </q-table>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script lang='ts'>
import { useStore } from 'src/store';
import { ref, onMounted, computed } from 'vue';
import { HubService } from '../utils/services/hub_service';
export default {
  name: 'Hub',
  setup(){
    const $store = useStore();
    const dense = computed(() => $store.getters['settings/dense']);
    const cameraService = ref(new HubService());
    const cameras = ref();
    const filter = ref('');

    onMounted(async () => {
      await dataBind();
    });

    const dataBind = async () => {
      cameras.value = await cameraService.value.getAll();
    };

    return {dense, cameras, columns, filter};
  }
};
const columns = [
  { name: 'brandName', align: 'center', label: 'Brand', field: 'brandName', sortable: true },
  { name: 'modelName', align: 'center', label: 'Model', field: 'modelName', sortable: true },
  { name: 'rtspRoute', align: 'center', label: 'Rtsp Route', field: 'rtspRoute', sortable: true },
  { name: 'rtspPort', align: 'center', label: 'Rtsp Port', field: 'rtspPort', sortable: true },
  { name: 'description', align: 'center', label: 'Description', field: 'description', sortable: true },
];
</script>

<style scoped>

</style>

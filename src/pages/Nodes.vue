<template>

  <div class='q-pa-sm'>
    <q-card class='my-card' style='max-width: 350px'>
      <q-card-section class='bg-purple text-white'>
        <div class='text-subtitle2'>Add a Node</div>
      </q-card-section>
      <q-card-actions align='left'>
        <q-form style='max-width: 500px' id='frm1' v-if='selected' @submit='onSubmit' @reset='onReset' class='q-pa-xs'>
          <q-input v-model='selected.node_address' filled :dense='dense' label='Node URL *' lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please enter Node URL address']" />

          <q-input :dense='dense' filled v-model='selected.name' label='Node Name *' lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please enter name']" />

          <q-input :dense='dense' filled label='Node Description *' v-model='selected.description' />

          <q-toggle v-model='selected.enabled' label='Enabled' />

          <div class='q-pa-md q-gutter-sm'>
            <q-btn label='Save' type='submit' color='primary' :dense='dense' icon='save' />
            <q-btn @click='onDelete' label='Delete' color='red' :dense='dense' icon='remove' />
            <q-btn label='Reset' type='reset' color='primary' flat class='q-ml-sm' :dense='dense' icon='restart_alt' />
          </div>
        </q-form>
      </q-card-actions>
    </q-card>
    <q-space style='height: 10px;' />
    <q-table title='Nodes' :rows='nodes' :columns='columns' row-key='node_address'
      :filter='filter' selection='single' v-model:selected='selectionList'>
      <template v-slot:top-right>
        <q-input borderless dense debounce='300' v-model='filter' placeholder='Search'>
          <template v-slot:append>
            <q-icon name='search' />
          </template>
        </q-input>
      </template>
      <template v-slot:body-cell-enabled='props'>
        <q-td :props='props'>
          <div>
            <q-toggle
              v-model='props.value'
              :color="props.value ? 'green' : 'red'" disabled
            />
          </div>
        </q-td>
      </template>
    </q-table>

  </div>

</template>

<script lang='ts'>
import { NodeRepository } from 'src/utils/db';
import { ref, onMounted, computed, watch } from 'vue';
import { useStore } from 'src/store';
import {Node} from '../utils/entities';

export default {
  name: 'AddNode',
  setup() {
    const $store = useStore();
    const dense = computed(() => $store.getters['settings/dense']);
    const nodeRep = ref(new NodeRepository());
    const nodes = ref();
    const selected = ref({ node_address: '', name: '', description: '', enabled: true });
    const filter = ref('');
    const selectionList: any = ref([]);

    onMounted(async () => {
      await dataBind();
    });

    watch(selectionList, () => {
      const sv = selectionList.value[0];
      if (sv) {
        selected.value = Object.assign({}, sv);
      } else {
        onReset();
      }
    });

    const dataBind = async () => {
      nodes.value = await nodeRep.value.getAll();
    };

    const onSubmit = async () => {
      const node: Node = {
        node_address: selected.value.node_address,
        name: selected.value.name,
        description: selected.value.description,
        enabled: selected.value.enabled
      };
      await nodeRep.value.save(node);
      await dataBind();
      selected.value = <any>node;
      selectionList.value = [node];
    };

    const onReset = () => {
      const node = selected.value;
      node.node_address = '';
      node.name = '';
      node.description = '';
      node.enabled = true;
    };

    const onDelete = (e: any) => {
      console.log(e);
      const node = selected.value;
      nodeRep.value.delete(node);
      (<any>document.getElementById('frm1')).reset();
      void dataBind();
    };

    return { dense, selected, onSubmit, onReset, onDelete, nodes, columns, filter, selectionList };
  }
};
const columns = [
  { name: 'node_address', align: 'center', label: 'Node URL', field: 'node_address', sortable: true },
  { name: 'name', align: 'center', label: 'Name', field: 'name', sortable: true },
  { name: 'description', align: 'center', label: 'Description', field: 'description', sortable: true },
  { name: 'enabled', align: 'center', label: 'Enabled', field: 'enabled', sortable: true }
];
</script>

<style scoped>

</style>

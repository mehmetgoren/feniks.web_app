<template>

  <div class='q-pa-sm'>
    <q-card class='my-card'>
      <q-card-section class='bg-purple text-white'>
        <div class='row items-center no-wrap'>
          <div class='col text-subtitle2'>
            {{$t('nodeinfo')}}
          </div>
          <div class='col-auto'>
            <q-btn :label="$t('returntologin')"  dense icon='arrow_back' @click='onGoBack'/>
          </div>
        </div>
      </q-card-section>
      <q-card-actions align='left'>
        <q-form id='frm1' v-if='selected' @submit='onSubmit' @reset='onReset' class='q-pa-xs' style='width: 100%;'>
          <q-input v-model='selected.node_address' filled dense :label="$t('nodeip')" lazy-rules
                   :rules="[ val => val && val.length > 0 || $t('vnodeip')]"/>

          <q-input type="number" v-model='selected.node_port' filled dense :label="$t('nodeport')" lazy-rules
                   :rules="[ val => val && val > 0 || $t('vnodeport')]"/>

          <q-input dense filled v-model='selected.name' :label="$t('nodename')" lazy-rules
                   :rules="[ val => val && val.length > 0 || $t('vnodename')]"/>

          <q-input dense filled :label="$t('nodedesc')" v-model='selected.description'/>

          <q-toggle v-model='selected.active' :label="$t('active')"/>

          <div class='q-pa-md q-gutter-sm'>
            <q-btn :label="$t('save')" type='submit' color='primary' dense icon='save'/>
            <q-btn @click='onDelete' :label="$t('delete')" color='red' dense icon='remove'/>
            <q-btn :label="$t('reset')" type='reset' color='primary' flat class='q-ml-sm' dense icon='restart_alt'/>
          </div>
        </q-form>
      </q-card-actions>
    </q-card>
    <q-space style='height: 10px;'/>
    <q-table :title="$t('nodelist')" :rows='nodes' :columns='columns' row-key='node_address'
             :filter='filter' selection='single' v-model:selected='selectionList'>
      <template v-slot:top-right>
        <q-input borderless dense debounce='300' v-model='filter' placeholder='Search'>
          <template v-slot:append>
            <q-icon name='search'/>
          </template>
        </q-input>
      </template>
      <template v-slot:body-cell-enabled='props'>
        <q-td :props='props'>
          <div>
            <q-toggle v-model='props.value' :color="props.value ? 'green' : 'red'" disabled/>
          </div>
        </q-td>
      </template>
    </q-table>

  </div>

</template>

<script lang='ts'>
import {NodeRepository} from 'src/utils/db';
import {ref, onMounted, watch} from 'vue';
import {Node} from '../utils/entities';
import {useI18n} from 'vue-i18n';

export default {
  name: 'AddNode',
  emits: ['on-go-back'],
  //@ts-ignore
  setup(props: any, {emit}) {
    const { t } = useI18n({ useScope: 'global' })
    const nodeRep = ref(new NodeRepository());
    const nodes = ref();
    const selected = ref<Node>({node_address: window.location.hostname, node_port: 8072, name: '', description: '', active: false});
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
        node_port: selected.value.node_port,
        name: selected.value.name,
        description: selected.value.description,
        active: selected.value.active
      };
      await nodeRep.value.save(node);
      await dataBind();
      selected.value = <any>node;
      selectionList.value = [node];
    };

    const onReset = () => {
      const node = selected.value;
      node.node_address = '';
      node.node_port = 8072;
      node.name = '';
      node.description = '';
      node.active = true;
    };

    const onDelete = async () => {
      const node = selected.value;
      await nodeRep.value.delete(node);
      (<any>document.getElementById('frm1')).reset();
      await dataBind();
    };

    return {
      selected, onSubmit, onReset, onDelete, nodes, columns:createColumns(t), filter, selectionList,
      onGoBack() {
        emit('on-go-back', null);
      }
    };
  }
};

function createColumns(t:any){
  return [
    {name: 'node_address', align: 'center', label: t('nodeip'), field: 'node_address', sortable: true},
    {name: 'node_port', align: 'center', label: t('nodeport'), field: 'node_port', sortable: true},
    {name: 'name', align: 'center', label: t('nodename'), field: 'name', sortable: true},
    {name: 'description', align: 'center', label: t('nodedesc'), field: 'description', sortable: true},
    {name: 'active', align: 'center', label: t('active'), field: 'active', sortable: true}
  ];
}
</script>

<style scoped>

</style>

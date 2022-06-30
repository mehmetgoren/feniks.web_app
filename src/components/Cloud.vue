<template>
  <div class='q-pa-sm' v-if="viewModel">
    <q-card class='my-card'>
      <q-card-section class='bg-blue-grey-6 text-white'>
        <div class='row items-center no-wrap'>
          <div class='col text-subtitle2'>Telegram</div>
        </div>
      </q-card-section>
      <q-card-actions align='left'>
        <q-form @submit='onSubmit' @reset='onReset' class='q-pa-xs' style='width: 100%;'>
          <q-toggle v-model='viewModel.enabled' label='Active' color="blue-grey-6" />

          <q-input v-if="viewModel?.bot" dense filled v-model='viewModel.bot.token' label='Token *' lazy-rules
                   :rules="[ val => val && val.length > 0 || 'Please enter token']" color="blue-grey-6" />

          <q-input v-if="viewModel?.bot" v-model='viewModel.bot.url' filled dense label='URL *' lazy-rules
                   :rules="[ val => val && val.length > 0 || 'Please enter URL address']" color="blue-grey-6" />

          <div class='q-pa-md q-gutter-sm'>
            <q-btn label='Save' type='submit' color='blue-grey-6' dense icon='save' :disable="submitLoading"/>
            <q-btn label='Refresh' type='reset' color='blue-grey-6' flat class='q-ml-sm' dense icon='restart_alt' />
          </div>
        </q-form>
      </q-card-actions>
    </q-card>
    <q-space style='height: 10px;' />
    <q-table v-if="viewModel?.users" title='Telegram Users' :rows='viewModel.users' :columns='telegramColumns' row-key='node_address' :filter='filter' >
      <template v-slot:top-right>
        <q-input borderless dense debounce='300' v-model='filter' placeholder='Search'>
          <template v-slot:append>
            <q-icon name='search' />
          </template>
        </q-input>
      </template>
      <template v-slot:body-cell-delete='props'>
        <q-td :props='props'>
          <div>
            <q-btn round color='deep-orange' icon='delete' @click='onDeleteUser(props.row)' />
          </div>
        </q-td>
      </template>
    </q-table>

  </div>
</template>

<script lang="ts">
import {NodeService} from 'src/utils/services/node_service';
import {TelegramUser, TelegramViewModel} from 'src/utils/models/cloud_models';
import {onMounted, ref} from 'vue';
import {useQuasar} from 'quasar';

export default {
  name: 'Cloud',
  setup(){
    const $q = useQuasar()
    const nodeService = new NodeService();
    const viewModel = ref<TelegramViewModel>();
    const filter = ref<string>('');
    const submitLoading = ref<boolean>(false);

    async function dataBind(){
      viewModel.value = await nodeService.getTelegramViewModel();
    }

    onMounted(async () => {
      await dataBind();
    });

    const onSubmit = async () => {
      submitLoading.value = true;
      try{
        if(!viewModel.value || !viewModel.value?.bot.token || !viewModel.value?.bot.url) {
          $q.notify({
            color: 'red-5',
            textColor: 'white',
            icon: 'warning',
            message: 'Please enter the required fields'
          })
          return;
        }
        await nodeService.saveTelegramViewModel(viewModel.value);
        await dataBind();
      }finally {
        submitLoading.value = false;
      }
    };

    const onReset = async () => {
      await dataBind();
    };

    const onDelete = async (userId: number) => {
      await nodeService.deleteTelegramUser(userId);
      await dataBind();
    };


    return{
      viewModel, filter, submitLoading,
      onSubmit, onReset,
      onDeleteUser(telegramUser: TelegramUser) {
        $q.dialog({
          title: 'Confirm',
          message: 'Are you sure you want to delete this user?',
          cancel: true,
          persistent: false
        }).onOk(() => {
          void onDelete(telegramUser.id);
        });
      },
      telegramColumns: createTelegramColumns()
    }
  }
}
function createTelegramColumns() {
  const align = 'left';
  return [
    { name: 'username', align, label: 'User name', field: 'username', sortable: true },
    { name: 'first_name', align, label: 'First Name', field: 'first_name', sortable: true },
    { name: 'last_name', align, label: 'Last Name', field: 'last_name', sortable: true },
    { name: 'is_bot', align, label: 'Is Bot ?', field: 'is_bot', format: (val: any) => val === '1' ? 'Yes' : 'No', sortable: true },
    { name: 'language_code', align, label: 'Language Code', field: 'language_code', sortable: true },
    { name: 'delete', align: 'center', label: 'Delete', field: 'delete' }
  ];
}
</script>

<style scoped>

</style>

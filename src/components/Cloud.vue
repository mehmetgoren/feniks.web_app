<template>
  <div class="row">
    <div class="col-6" v-if="gdriveModel">
      <q-card class='my-card' style="margin-right: 5px;">
        <q-card-section class='bg-blue-grey-6 text-white'>
          <div class='row items-center no-wrap'>
            <div class='col text-subtitle2'>Google Drive</div>
          </div>
        </q-card-section>
        <q-card-actions align='left'>
          <q-form @submit='onGdriveSubmit' @reset='onGdriveReset' class='q-pa-xs' style='width: 100%;'>
            <q-toggle v-model='gdriveModel.enabled' label='Active' color="blue-grey-6" />
            <q-input v-model="gdriveModel.credentials_json" filled type="textarea" label="Credentials" rows="13" />
            <q-space style='margin-bottom: 15px;' />
            <q-input v-model='gdriveModel.auth_code' label='Auth Code' dense filled color="blue-grey-6" />
            <q-space style='margin-bottom: 15px;' />
            <q-input v-model="gdriveModel.token_json" filled type="textarea" label="Credentials" rows="8" readonly />
            <q-space style='margin-bottom: 15px;' />
            <q-input v-model='gdriveModel.url' label='URL' dense filled color="blue-grey-6" readonly />

            <div class='q-pa-md q-gutter-sm'>
              <q-btn label='Save' type='submit' color='blue-grey-6' dense icon='save' :disable="gdriveSubmitLoading">
                <q-inner-loading :showing='gdriveSubmitLoading' />
              </q-btn>
              <q-btn label='Refresh' type='reset' color='blue-grey-6' flat class='q-ml-sm' dense icon='restart_alt' />
            </div>
          </q-form>
        </q-card-actions>
      </q-card>
    </div>
    <div class="col-6" v-if="telegramModel">
      <q-card class='my-card'>
        <q-card-section class='bg-blue-grey-6 text-white'>
          <div class='row items-center no-wrap'>
            <div class='col text-subtitle2'>Telegram</div>
          </div>
        </q-card-section>
        <q-card-actions align='left'>
          <q-form @submit='onTelegramSubmit' @reset='onTelegramReset' class='q-pa-xs' style='width: 100%;'>
            <q-toggle v-model='telegramModel.enabled' label='Active' color="blue-grey-6"/>

            <q-input v-if="telegramModel?.bot" dense filled v-model='telegramModel.bot.token' label='Token *' lazy-rules
                     :rules="[ val => val && val.length > 0 || 'Please enter token']" color="blue-grey-6"/>

            <q-input v-if="telegramModel?.bot" v-model='telegramModel.bot.url' filled dense label='URL *' lazy-rules
                     :rules="[ val => val && val.length > 0 || 'Please enter URL address']" color="blue-grey-6"/>

            <div class='q-pa-md q-gutter-sm'>
              <q-btn label='Save' type='submit' color='blue-grey-6' dense icon='save' :disable="telegramSubmitLoading">
                <q-inner-loading :showing='telegramSubmitLoading' />
              </q-btn>
              <q-btn label='Refresh' type='reset' color='blue-grey-6' flat class='q-ml-sm' dense icon='restart_alt' />
            </div>
          </q-form>
        </q-card-actions>
      </q-card>
      <q-space style='height: 10px;'/>
      <q-table v-if="telegramModel?.users" title='Telegram Users' :rows='telegramModel.users'
               :columns='telegramColumns' row-key='node_address' :filter='filter'>
        <template v-slot:top-right>
          <q-input borderless dense debounce='300' v-model='filter' placeholder='Search'>
            <template v-slot:append>
              <q-icon name='search'/>
            </template>
          </q-input>
        </template>
        <template v-slot:body-cell-delete='props'>
          <q-td :props='props'>
            <div>
              <q-btn round color='deep-orange' icon='delete' @click='onDeleteUser(props.row)'/>
            </div>
          </q-td>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script lang="ts">
import {NodeService} from 'src/utils/services/node_service';
import {GdriveViewModel, TelegramUser, TelegramViewModel} from 'src/utils/models/cloud_models';
import {onMounted, ref} from 'vue';
import {useQuasar} from 'quasar';
import {formatJson} from 'src/utils/utils';

export default {
  name: 'Cloud',
  setup() {
    const $q = useQuasar()
    const nodeService = new NodeService();
    const telegramModel = ref<TelegramViewModel>();
    const gdriveModel = ref<GdriveViewModel>();
    const filter = ref<string>('');
    const telegramSubmitLoading = ref<boolean>(false);
    const gdriveSubmitLoading = ref<boolean>(false);

    async function telegramDataBind() {
      telegramModel.value = await nodeService.getTelegramViewModel();
    }

    async function gdriveDatabind() {
      gdriveModel.value = await nodeService.getGdriveViewModel();
      if (gdriveModel.value) {
        gdriveModel.value.credentials_json = formatJson(gdriveModel.value.credentials_json);
        gdriveModel.value.token_json = formatJson(gdriveModel.value.token_json);
      }
    }

    onMounted(async () => {
      await telegramDataBind();
      await gdriveDatabind();
    });

    const onTelegramSubmit = async () => {
      telegramSubmitLoading.value = true;
      try {
        if (!telegramModel.value || !telegramModel.value?.bot.token || !telegramModel.value?.bot.url) {
          $q.notify({
            color: 'red-5',
            textColor: 'white',
            icon: 'warning',
            message: 'Please enter the required fields'
          })
          return;
        }
        await nodeService.saveTelegramViewModel(telegramModel.value);
        await telegramDataBind();
      } finally {
        telegramSubmitLoading.value = false;
      }
    };

    const onTelegramReset = async () => {
      await telegramDataBind();
    };

    const onDelete = async (userId: number) => {
      await nodeService.deleteTelegramUser(userId);
      await telegramDataBind();
    };

    const onGdriveSubmit = async () => {
      gdriveSubmitLoading.value = true;
      try {
        if (gdriveModel.value){
          await nodeService.saveGdriveViewModel(gdriveModel.value);
        }
      }finally {
        gdriveSubmitLoading.value = false;
      }
    };

    const onGdriveReset = async () => {
      await gdriveDatabind();
    };

    return {
      telegramModel, filter, telegramSubmitLoading, gdriveModel, gdriveSubmitLoading,
      onTelegramSubmit, onTelegramReset, onGdriveSubmit, onGdriveReset,
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
    {name: 'username', align, label: 'User name', field: 'username', sortable: true},
    {name: 'first_name', align, label: 'First Name', field: 'first_name', sortable: true},
    {name: 'last_name', align, label: 'Last Name', field: 'last_name', sortable: true},
    {name: 'is_bot', align, label: 'Is Bot ?', field: 'is_bot', format: (val: any) => val === '1' ? 'Yes' : 'No', sortable: true},
    {name: 'language_code', align, label: 'Language Code', field: 'language_code', sortable: true},
    {name: 'delete', align: 'center', label: 'Delete', field: 'delete'}
  ];
}
</script>

<style scoped>

</style>

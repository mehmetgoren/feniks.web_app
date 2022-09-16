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
            <q-toggle v-model='gdriveModel.enabled' :label="$t('active')" color="blue-grey-6"/>
            <q-input v-model="gdriveModel.credentials_json" filled type="textarea" :label="$t('credentials')" rows="13"/>
            <q-space style='margin-bottom: 15px;'/>
            <q-input v-model='gdriveModel.auth_code' :label="$t('auth_code')" dense filled color="blue-grey-6"/>
            <q-space style='margin-bottom: 15px;'/>
            <q-input v-model="gdriveModel.token_json" filled type="textarea" :label="$t('token_json')" rows="8" disable/>
            <q-space style='margin-bottom: 15px;'/>
            <q-input v-model='gdriveModel.url' :label="$t('url')" dense filled color="blue-grey-6" disable/>

            <div class='q-pa-md q-gutter-sm'>
              <q-btn :label="$t('save')" type='submit' color='blue-grey-6' dense icon='save' :disable="gdriveSubmitLoading">
                <q-inner-loading :showing='gdriveSubmitLoading'/>
              </q-btn>
              <q-btn :label="$t('refresh')" type='reset' color='blue-grey-6' flat class='q-ml-sm' dense icon='restart_alt'/>
              <q-btn :label="$t('refresh_credentials')" color='red' dense icon='report' :disable="gdriveResetLoading"
                     @click="onResetGdriveTokenAndUrl">
                <q-inner-loading :showing='gdriveResetLoading'/>
              </q-btn>
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
            <q-toggle v-model='telegramModel.enabled' :label="$t('active')" color="blue-grey-6"/>

            <q-input v-if="telegramModel?.bot" dense filled v-model='telegramModel.bot.token' :label="$t('token')" lazy-rules
                     :rules="[ val => val && val.length > 0 || $t('v_enter_token')]" color="blue-grey-6"/>

            <q-input v-if="telegramModel?.bot" v-model='telegramModel.bot.url' filled dense :label="$t('url')" lazy-rules
                     :rules="[ val => val && val.length > 0 ||  $t('v_enter_url')]" color="blue-grey-6"/>

            <div class='q-pa-md q-gutter-sm'>
              <q-btn :label="$t('save')" type='submit' color='blue-grey-6' dense icon='save' :disable="telegramSubmitLoading">
                <q-inner-loading :showing='telegramSubmitLoading'/>
              </q-btn>
              <q-btn :label="$t('refresh')" type='reset' color='blue-grey-6' flat class='q-ml-sm' dense icon='restart_alt'/>
            </div>
          </q-form>
        </q-card-actions>
      </q-card>
      <q-space style='height: 10px;'/>
      <q-table v-if="telegramModel?.users" :title="'Telegram ' + $t('users')" :rows='telegramModel.users'
               :columns='telegramColumns' row-key='node_address' :filter='filter'
               :loading-label="$t('loading')" :no-data-label="$t('no_data')" :no-results-label="$t('no_results')"
               :selected-rows-label="$t('selected_rows')" :rows-per-page-label="$t('rows_per_page')">
        <template v-slot:top-right>
          <q-input borderless dense debounce='300' v-model='filter' :placeholder="$t('search')">
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
import {useI18n} from 'vue-i18n';

export default {
  name: 'Cloud',
  setup() {
    const {t} = useI18n({useScope: 'global'});
    const $q = useQuasar();
    const nodeService = new NodeService();
    const telegramModel = ref<TelegramViewModel>();
    const gdriveModel = ref<GdriveViewModel>();
    const filter = ref<string>('');
    const telegramSubmitLoading = ref<boolean>(false);
    const gdriveSubmitLoading = ref<boolean>(false);
    const gdriveResetLoading = ref<boolean>(false);

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
        await nodeService.restartAfterCloudChanges();
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
        if (gdriveModel.value) {
          await nodeService.saveGdriveViewModel(gdriveModel.value);
          await nodeService.restartAfterCloudChanges();
        }
      } finally {
        gdriveSubmitLoading.value = false;
      }
    };

    const onGdriveReset = async () => {
      await gdriveDatabind();
    };

    const onResetGdriveTokenAndUrl = () => {
      const doResetGdriveTokenAndUrl = async () => {
        gdriveResetLoading.value = true;
        try {
          await nodeService.resetGdriveTokenAndUrl();
          await gdriveDatabind();
        } finally {
          gdriveResetLoading.value = false;
        }
      };

      $q.dialog({
        title: 'Confirm',
        message: 'Are you sure you want to reset GDrive integration?',
        cancel: true,
        persistent: false
      }).onOk(() => {
        void doResetGdriveTokenAndUrl();
      });
    };

    return {
      telegramModel, filter, telegramSubmitLoading, gdriveModel, gdriveSubmitLoading, gdriveResetLoading,
      onTelegramSubmit, onTelegramReset, onGdriveSubmit, onGdriveReset, onResetGdriveTokenAndUrl,
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
      telegramColumns: createTelegramColumns(t)
    }
  }
}

function createTelegramColumns(t: any) {
  const align = 'left';
  return [
    {name: 'username', align, label: t('username'), field: 'username', sortable: true},
    {name: 'first_name', align, label: t('first_name'), field: 'first_name', sortable: true},
    {name: 'last_name', align, label: t('last_name'), field: 'last_name', sortable: true},
    {name: 'is_bot', align, label: t('is_bot'), field: 'is_bot', format: (val: any) => val === '1' ? 'Yes' : 'No', sortable: true},
    {name: 'language_code', align, label: t('lang_code'), field: 'language_code', sortable: true},
    {name: 'delete', align: 'center', label: t('delete'), field: 'delete'}
  ];
}
</script>

<style scoped>

</style>

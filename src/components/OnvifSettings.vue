<template>
  <q-layout view='lHh lpr lFf' container class='shadow-2 rounded-borders'>
    <q-header elevated :class='"bg-" + color'>
      <q-toolbar>
        <q-btn flat round dense icon='settings_ethernet'/>
        <q-toolbar-title>
          <label style='text-transform: uppercase;font-size: medium'> {{ address }}</label>
        </q-toolbar-title>
        <q-space/>
        <q-btn dense flat icon='close' v-close-popup>
          <q-tooltip class='bg-white text-primary'>{{ $t('close') }}</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page padding style='background-color: whitesmoke;'>
        <div class='row'>
          <div class='col-4'>
            <q-toolbar :class='"bg-" + color + " text-white shadow-2 rounded-borders"' style='width: auto;'>
              <label style='text-transform: uppercase;font-size: medium'>{{ $t('onvif_parameters') }}</label>
            </q-toolbar>
            <q-space style='height: 5px;'/>
            <q-form class='q-pa-xs'>
              <q-input filled v-model.trim='model.onvif_params.address' :label="$t('address')" dense :color='color'/>
              <q-space style='height: 10px;'/>
              <q-input filled v-model.number='model.onvif_params.port' type='number' :label="$t('port')" dense :color='color'/>
              <q-space style='height: 10px;'/>
              <q-input filled v-model.trim='model.onvif_params.username' :label="$t('username')" dense :color='color'/>
              <q-space style='height: 10px;'/>
              <q-input filled v-model.trim='model.onvif_params.password' :label="$t('password')" dense :color='color'/>

              <q-space style='height: 10px;'/>
              <q-btn-group>
                <q-btn :label="$t('onvif_scan')" dense icon='settings_ethernet' :color='color' @click='onOnvifScan' :disable='showOnvifLoading'>
                  <q-inner-loading :showing='showOnvifLoading'/>
                </q-btn>
                <q-btn :label="$t('reboot')" dense icon='restart_alt' :color='color' style='margin-left: 5px;' @click='onOnvifReboot'>
                  <q-inner-loading :showing='showOnvifReboot'/>
                </q-btn>
                <q-btn :label="$t('factory_reset')" dense icon='factory' :color='color' style='margin-left: 5px;'/>
                <q-btn :label="$t('firmware_upgrade')" dense icon='upgrade' :color='color' style='margin-left: 5px;'/>
              </q-btn-group>
            </q-form>
          </div>

          <div class='col-4'>
            <div style='margin-left: 5px;'>
              <q-toolbar :class='"bg-" + color + " text-white shadow-2 rounded-borders"' style='width: auto;'>
                <label style='text-transform: uppercase;font-size: medium'>{{ $t('device_info') }}</label>
              </q-toolbar>
              <q-space style='height: 5px;'/>
              <q-form class='q-pa-xs' v-if='model.onvif&&model.onvif.device_info'>
                <q-input filled v-model.trim='model.onvif.device_info.manufacturer' :label="$t('manufacturer')" dense :color='color' readonly/>
                <q-space style='height: 10px;'/>
                <q-input filled v-model.trim='model.onvif.device_info.model' :label="$t('model')" dense :color='color' readonly/>
                <q-space style='height: 10px;'/>
                <q-input filled v-model.trim='model.onvif.device_info.firmware_version' :label="$t('firmware_version')" dense :color='color'
                         readonly/>
                <q-space style='height: 10px;'/>
                <q-input filled v-model.trim='model.onvif.device_info.serial_number' :label="$t('serial_number')" dense :color='color' readonly/>
                <q-space style='height: 10px;'/>
                <q-input filled v-model.trim='model.onvif.device_info.hardware_id' :label="$t('hardware_id')" dense :color='color' readonly/>
              </q-form>
            </div>
          </div>

          <div class='col-4'>
            <div style='margin-left: 5px;'>
              <q-toolbar :class='"bg-" + color + " text-white shadow-2 rounded-borders"' style='width: auto;'>
                <label style='text-transform: uppercase;font-size: medium'>Onvif {{ $t('data') }} 1</label>
              </q-toolbar>
              <q-space style='height: 5px;'/>
              <q-form class='q-pa-xs' v-if='model.onvif'>
                <q-space style='height: 10px;'/>
                <q-input filled v-model.trim='model.onvif.host_name' :label="$t('host_name')" dense :color='color' readonly/>
                <q-space style='height: 10px;'/>
                <q-input v-if="model.onvif.ip_addresses" filled :model-value='model.onvif.ip_addresses.join(" , ")'
                         :label="$t('ip_addresses')" dense :color='color' readonly/>
                <q-space v-if="model.onvif.ip_addresses" style='height: 10px;'/>
                <q-input filled v-model.trim='model.onvif.hw_address' :label="$t('hw_address')" dense :color='color' readonly/>
                <q-space style='height: 10px;'/>
                <q-input filled v-model.trim='model.onvif.local_datetime' :label="$t('local_datetime')" dense :color='color' readonly/>
                <q-space style='height: 10px;'/>
                <q-toggle dense v-model='model.onvif.is_discoverable' checked-icon='check' :color='color'
                          :label="$t('discoverable') + (model.onvif.is_discoverable ? $t('yes') : $t('no'))" disable/>
              </q-form>
            </div>
          </div>

        </div>
        <div class='row'>
          <div class='col-8'>
            <q-space style='height: 5px;'/>
            <q-toolbar :class='"bg-" + color + " text-white shadow-2 rounded-borders"' style='width: auto;'>
              <q-toolbar-title><label style='text-transform: uppercase;font-size: medium'>{{ $t('hacking_results') }}</label></q-toolbar-title>
              <q-btn :label="$t('scan')" flat icon-right='radar' @click='onScanTarget' dense :disable='showScanLoading'>
                <q-inner-loading :showing='showScanLoading'/>
              </q-btn>
            </q-toolbar>
            <q-space style='height: 5px;'/>
            <q-table title='Hacking Results' :rows='hackResults' :columns='columns'
                     row-key='route' :pagination='initialPagination' :rows-per-page-label="$t('rows_per_page')"
                     selection='single' v-model:selected='hackSelected' @selection='onHackSelected'/>
          </div>
          <div class='col-4'>
            <div style='margin: 5px 0 0 5px;'>
              <q-toolbar :class='"bg-" + color + " text-white shadow-2 rounded-borders"' style='width: auto;'>
                <label style='text-transform: uppercase;font-size: medium'>Onvif {{ $t('data') }} 2</label>
              </q-toolbar>
              <q-space style='height: 5px;'/>
              <q-form class='q-pa-xs' v-if='model.onvif'>
                <q-space style='height: 10px;'/>
                <q-input filled v-model.number='model.onvif.stream_uri' :label="$t('stream_uri')" dense :color='color' readonly/>
                <q-space style='height: 10px;'/>
                <q-input filled v-model.number='model.onvif.http_port' :label="$t('http_port')" dense :color='color' readonly/>
                <q-space style='height: 10px;'/>
                <q-input filled v-model.number='model.onvif.https_port' :label="$t('https_port')" dense :color='color' readonly/>
                <q-space style='height: 10px;'/>
                <q-input filled v-model.number='model.onvif.rtsp_port' :label="$t('rtsp_port')" dense :color='color' readonly/>
                <q-space style='height: 10px;'/>
                <q-table :title="$t('users2')" :rows='model.onvif.users' :columns='columnsUsers' dense
                         row-key='username' :pagination='initialPagination' :rows-per-page-label="$t('rows_per_page')"/>
                <q-space style='height: 10px;'/>
                <q-input filled type='textarea' v-model.number='model.onvif.logs' :label="$t('logs')" dense :color='color' readonly/>
              </q-form>
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>

  </q-layout>
</template>

<!--suppress JSIncompatibleTypesComparison -->
<script lang='ts'>
import {OnvifAction, OnvifEvent, OnvifModel} from '../utils/models/onvif_models';
import {onBeforeUnmount, onMounted, ref} from 'vue';
import {PublishService, SubscribeService} from 'src/utils/services/websocket_services';
import {useQuasar} from 'quasar';
import {WsConnection} from 'src/utils/ws/connection';
import {NodeService} from 'src/utils/services/node_service';
import {parseIP} from 'src/utils/utils';
import {useI18n} from 'vue-i18n';

export default {
  name: 'OnvifSettings',
  props: {
    address: {
      type: String
    },
    color: {
      type: String,
      required: true,
      default: 'primary'
    }
  },

  setup(props: any) {
    const { t } = useI18n({ useScope: 'global' });
    const $q = useQuasar();
    const addr: string = <string>(!props.address ? '127.0.0.1' : parseIP(props.address) ? parseIP(props.address) : '127.0.0.1');
    const onvifParams = {address: addr, port: 554, username: '', password: ''};

    const model = ref<OnvifModel>({hack_result: {}, onvif_params: onvifParams, created_at: ''});
    const hackResults = ref<ExecResultView2[]>([]);
    const showScanLoading = ref<boolean>(false);
    const showOnvifLoading = ref<boolean>(false);
    const showOnvifReboot = ref<boolean>(false);
    const hackSelected = ref<string[]>([]);

    const nodeService = new NodeService();
    const publishService = new PublishService();
    let connOnvif: WsConnection | null = null;

    function hackResultsBind() {
      const hr = model.value.hack_result;
      //@ts-ignore
      if (hr !== null && hr.route !== null && hr.route.length) {
        const items: ExecResultView2[] = [];
        //@ts-ignore
        for (const route of hr?.route) {
          //@ts-ignore
          const copy: ExecResultView2 = {...hr};
          //@ts-ignore
          copy.route = route;
          items.push(copy);
        }
        hackResults.value = items;
      }
    }

    onMounted(async () => {
      const nodeIp = await nodeService.LocalService.getNodeIP();
      const nodePort = await nodeService.LocalService.getNodePort();
      const subscribeService = new SubscribeService(nodeIp, nodePort);

      if (addr.length > 0) {
        const serverOnvif = await nodeService.getOnvif(addr);
        if (serverOnvif) {
          model.value = serverOnvif;
          hackResultsBind();
        }
      }

      connOnvif = subscribeService.subscribeOnvif((event: MessageEvent) => {
        const result: OnvifEvent = JSON.parse(event.data);
        switch (result.type) {
          case OnvifAction.HackTarget:
            try {
              if (!result.base64_model) {
                model.value.hack_result = {};
              } else {
                model.value.hack_result = JSON.parse(atob(result.base64_model));
              }
              hackResultsBind();
            } finally {
              showScanLoading.value = false;
            }
            break;
          case  OnvifAction.GetTargetInfo:
            try {
              if (!result.base64_model) {
                model.value.onvif = {};
              } else {
                model.value.onvif = JSON.parse(atob(result.base64_model));
              }
            } finally {
              showOnvifLoading.value = false;
            }
            break;
          case OnvifAction.Reboot:
            showOnvifReboot.value = false;
            break;
        }
      });
    });

    onBeforeUnmount(() => {
      if (connOnvif) {
        connOnvif.close();
      }
    });

    const onScanTarget = () => {
      if (!model.value.onvif_params.address) {
        $q.notify({
          message: t('v_enter_address_field'),
          caption: '',
          color: 'red'
        });
        return;
      }
      void publishService.publishOnvif({address: model.value.onvif_params.address}, OnvifAction.HackTarget);
      showScanLoading.value = true;
    };

    const onHackSelected = (selection: any) => {
      const rows: ExecResultView2[] = selection.rows;
      if (rows.length > 0) {
        const first = rows[0];
        model.value.onvif_params.address = first.address;
        model.value.onvif_params.port = first.port;
        model.value.onvif_params.username = first.username;
        model.value.onvif_params.password = first.password;
      }
    };

    function checkOnvif(): boolean {
      const op = model.value.onvif_params;
      //@ts-ignore
      const ret = !op.address || op.port < 1 || !op.username || !op.address;
      if (ret) {
        $q.notify({
          message: t('please_input_all_fields_onvif'),
          caption: '',
          color: 'red'
        });
      }
      return !ret;
    }

    const onOnvifScan = () => {
      if (!checkOnvif()) {
        return;
      }
      void publishService.publishOnvif(model.value.onvif_params, OnvifAction.GetTargetInfo);
      showOnvifLoading.value = true;
    };

    const onOnvifReboot = () => {
      if (!checkOnvif()) {
        return;
      }
      void publishService.publishOnvif(model.value.onvif_params, OnvifAction.Reboot);
      showOnvifReboot.value = true;
    };

    return {
      model, hackResults, onScanTarget, showScanLoading, hackSelected, onHackSelected, showOnvifLoading, onOnvifScan,
      onOnvifReboot, showOnvifReboot,
      columns: [
        {name: 'address', align: 'center', label: t('address'), field: 'address', sortable: true},
        {name: 'route', align: 'center', label: t('route'), field: 'route', sortable: true},
        {name: 'port', align: 'center', label: t('port'), field: 'port', sortable: true},
        {name: 'device', align: 'center', label: t('device'), field: 'device', sortable: true},
        {name: 'username', align: 'center', label: t('username'), field: 'username', sortable: true},
        {name: 'password', align: 'center', label: t('password'), field: 'password', sortable: true},
        {name: 'credentials_found', align: 'center', label: t('credentials_found'), field: 'credentials_found', sortable: true},
        {name: 'route_found', align: 'center', label: t('route_found'), field: 'route_found', sortable: true},
        {name: 'available', align: 'center', label: t('available'), field: 'available', sortable: true},
        {name: 'authentication_type', align: 'center', label: t('authentication_type'), field: 'authentication_type', sortable: true}
      ],
      initialPagination: {
        rowsPerPage: 10
      },
      columnsUsers: [
        {name: 'username', align: 'center', label: t('username'), field: 'username', sortable: true},
        {name: 'user_level', align: 'center', label: t('user_level'), field: 'user_level', sortable: true}
      ]
    };
  }
};

interface ExecResultView2 {
  device?: string;
  username?: string;
  password?: string;
  route?: string;
  address?: string;
  port?: number;

  credentials_found?: boolean;
  route_found?: boolean;
  available?: boolean;

  authenticationType?: string;
}
</script>

<style scoped>

</style>

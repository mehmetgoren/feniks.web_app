<template>
  <q-layout view='lHh lpr lFf' container class='shadow-2 rounded-borders'>
    <q-header elevated :class='"bg-" + color'>
      <q-toolbar>
        <q-btn flat round dense icon='settings_ethernet' />
        <q-toolbar-title>
          <label style='text-transform: uppercase;font-size: medium'> {{ address }}</label>
        </q-toolbar-title>
        <q-space />
        <q-btn dense flat icon='close' v-close-popup>
          <q-tooltip class='bg-white text-primary'>Close</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page padding style='background-color: whitesmoke;'>
        <div class='row'>
          <div class='col-4'>
            <q-toolbar :class='"bg-" + color + " text-white shadow-2 rounded-borders"' style='width: auto;'>
              <label style='text-transform: uppercase;font-size: medium'>Onvif Parameters</label>
            </q-toolbar>
            <q-space style='height: 5px;' />
            <q-form class='q-pa-xs'>
              <q-input filled v-model.trim='model.onvif_params.address' label='Address' :dense='dense' :color='color' />
              <q-space style='height: 10px;' />
              <q-input filled v-model.number='model.onvif_params.port' type='number' label='Port' :dense='dense' :color='color' />
              <q-space style='height: 10px;' />
              <q-input filled v-model.trim='model.onvif_params.username' label='User Name' :dense='dense' :color='color' />
              <q-space style='height: 10px;' />
              <q-input filled v-model.trim='model.onvif_params.password' label='Password' :dense='dense' :color='color' />

              <q-space style='height: 10px;' />
              <q-btn label='Onvif Scan' :dense='dense' icon='settings_ethernet' :color='color' @click='onOnvifScan' :disable='showOnvifLoading'>
                <q-inner-loading :showing='showOnvifLoading' />
              </q-btn>

              <q-btn label='Reboot' :dense='dense' icon='restart_alt' :color='color' style='margin-left: 5px;' @click='onOnvifReboot'>
                <q-inner-loading :showing='showOnvifReboot' />
              </q-btn>
              <q-btn label='Factory Reset' :dense='dense' icon='factory' :color='color' style='margin-left: 5px;' />
              <q-btn label='Firmware Upgrade' :dense='dense' icon='upgrade' :color='color' style='margin-left: 5px;' />
            </q-form>
          </div>

          <div class='col-4'>
            <div style='margin-left: 5px;'>
              <q-toolbar :class='"bg-" + color + " text-white shadow-2 rounded-borders"' style='width: auto;'>
                <label style='text-transform: uppercase;font-size: medium'>Device Info</label>
              </q-toolbar>
              <q-space style='height: 5px;' />
              <q-form class='q-pa-xs' v-if='model.onvif&&model.onvif.device_info'>
                <q-input filled v-model.trim='model.onvif.device_info.manufacturer' label='Manufacturer' :dense='dense' :color='color' readonly />
                <q-space style='height: 10px;' />
                <q-input filled v-model.trim='model.onvif.device_info.model' label='Model' :dense='dense' :color='color' readonly />
                <q-space style='height: 10px;' />
                <q-input filled v-model.trim='model.onvif.device_info.firmware_version' label='Firmware Version' :dense='dense' :color='color' readonly />
                <q-space style='height: 10px;' />
                <q-input filled v-model.trim='model.onvif.device_info.serial_number' label='Serial Number' :dense='dense' :color='color' readonly />
                <q-space style='height: 10px;' />
                <q-input filled v-model.trim='model.onvif.device_info.hardware_id' label='Hardware Id' :dense='dense' :color='color' readonly />
              </q-form>
            </div>
          </div>

          <div class='col-4'>
            <div style='margin-left: 5px;'>
              <q-toolbar :class='"bg-" + color + " text-white shadow-2 rounded-borders"' style='width: auto;'>
                <label style='text-transform: uppercase;font-size: medium'>Onvif Data 1</label>
              </q-toolbar>
              <q-space style='height: 5px;' />
              <q-form class='q-pa-xs' v-if='model.onvif'>
                <q-space style='height: 10px;' />
                <q-input filled v-model.trim='model.onvif.host_name' label='Host Name' :dense='dense' :color='color' readonly />
                <q-space style='height: 10px;' />
                <q-input filled :model-value='model.onvif.ip_addresses.join(" , ")' label='Ip Addresses' :dense='dense' :color='color' readonly />
                <q-space style='height: 10px;' />
                <q-input filled v-model.trim='model.onvif.hw_address' label='Hw Address' :dense='dense' :color='color' readonly />
                <q-space style='height: 10px;' />
                <q-input filled v-model.trim='model.onvif.local_datetime' label='Local Datetime' :dense='dense' :color='color' readonly />
                <q-space style='height: 10px;' />
                <q-toggle :dense='dense' v-model='model.onvif.is_discoverable' checked-icon='check' :color='color'
                          :label='"Discoverable " + (model.onvif.is_discoverable ? "Yes" : "No")' disable />
              </q-form>
            </div>
          </div>

        </div>
        <div class='row'>
          <div class='col-8'>
            <q-space style='height: 5px;' />
            <q-toolbar :class='"bg-" + color + " text-white shadow-2 rounded-borders"' style='width: auto;'>
              <q-toolbar-title><label style='text-transform: uppercase;font-size: medium'>Hacking Results</label></q-toolbar-title>
              <q-btn label='Scan' flat icon-right='radar' @click='onScanTarget' :dense='dense' :disable='showScanLoading'>
                <q-inner-loading :showing='showScanLoading' />
              </q-btn>
            </q-toolbar>
            <q-space style='height: 5px;' />
            <q-table title='Hacking Results' :rows='hackResults' :columns='columns'
                     row-key='route' :pagination='initialPagination'
                     selection='single' v-model:selected='hackSelected' @selection='onHackSelected' />
          </div>
          <div class='col-4'>
            <div style='margin: 5px 0 0 5px;'>
              <q-toolbar :class='"bg-" + color + " text-white shadow-2 rounded-borders"' style='width: auto;'>
                <label style='text-transform: uppercase;font-size: medium'>Onvif Data 2</label>
              </q-toolbar>
              <q-space style='height: 5px;' />
              <q-form class='q-pa-xs' v-if='model.onvif'>
                <q-space style='height: 10px;' />
                <q-input filled v-model.number='model.onvif.stream_uri' label='Stream Uri' :dense='dense' :color='color' readonly />
                <q-space style='height: 10px;' />
                <q-input filled v-model.number='model.onvif.http_port' label='Http Port' :dense='dense' :color='color' readonly />
                <q-space style='height: 10px;' />
                <q-input filled v-model.number='model.onvif.https_port' label='Https Port' :dense='dense' :color='color' readonly />
                <q-space style='height: 10px;' />
                <q-input filled v-model.number='model.onvif.rtsp_port' label='Rtsp Port' :dense='dense' :color='color' readonly />
                <q-space style='height: 10px;' />
                <q-table title='Users' :rows='model.onvif.users' :columns='columnsUsers' :dense='dense'
                         row-key='username' :pagination='initialPagination' />
                <q-space style='height: 10px;' />
                <q-input filled type='textarea' v-model.number='model.onvif.logs' label='Logs' :dense='dense' :color='color' readonly />
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
import { OnvifAction, OnvifEvent, OnvifModel } from '../utils/models/onvif_models';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { PublishService, SubscribeService } from 'src/utils/services/websocket_services';
import { useQuasar } from 'quasar';
import { useStore } from 'src/store';
import { WsConnection } from 'src/utils/ws/connection';
import { NodeService } from 'src/utils/services/node_service';
import { parseIP } from 'src/utils/utils';

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
    const $q = useQuasar();
    const $store = useStore();
    const dense = computed(() => $store.getters['settings/dense']);

    const addr: string = <string>(!props.address ? '127.0.0.1' : parseIP(props.address) ? parseIP(props.address) : '127.0.0.1');
    const onvifParams = { address: addr, port: 554, username: '', password: '' };

    const model = ref<OnvifModel>({ hack_result: {}, onvif_params: onvifParams, created_at: '' });
    const hackResults = ref<ExecResultView2[]>([]);
    const showScanLoading = ref<boolean>(false);
    const showOnvifLoading = ref<boolean>(false);
    const showOnvifReboot = ref<boolean>(false);
    const hackSelected = ref<string[]>([]);

    const nodeService = new NodeService();
    const publishService = new PublishService();
    const subscribeService = new SubscribeService();
    let connOnvif: WsConnection | null = null;

    function hackResultsBind() {
      const hr = model.value.hack_result;
      //@ts-ignore
      if (hr !== null && hr.route !== null && hr.route.length) {
        const items: ExecResultView2[] = [];
        //@ts-ignore
        for (const route of hr?.route) {
          //@ts-ignore
          const copy: ExecResultView2 = { ...hr };
          //@ts-ignore
          copy.route = route;
          items.push(copy);
        }
        hackResults.value = items;
      }
    }

    onMounted(async () => {
      if (addr.length > 0) {
        const serverOnvif = await nodeService.getOnvif(addr);
        if (serverOnvif != null) {
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
          message: 'Please input Address',
          caption: '',
          color: 'red'
        });
        return;
      }
      void publishService.publishOnvif({ address: model.value.onvif_params.address }, OnvifAction.HackTarget);
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
          message: 'Please input all fields (Address, Port, User Name and Password)',
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
      dense, model, hackResults, onScanTarget, showScanLoading, hackSelected, onHackSelected, showOnvifLoading, onOnvifScan,
      onOnvifReboot, showOnvifReboot,
      columns: [
        { name: 'address', align: 'center', label: 'Address', field: 'address', sortable: true },
        { name: 'route', align: 'center', label: 'Route', field: 'route', sortable: true },
        { name: 'port', align: 'center', label: 'port', field: 'port', sortable: true },
        { name: 'device', align: 'center', label: 'Device', field: 'device', sortable: true },
        { name: 'username', align: 'center', label: 'User Name', field: 'username', sortable: true },
        { name: 'password', align: 'center', label: 'Password', field: 'password', sortable: true },
        { name: 'credentials_found', align: 'center', label: 'Credentials Found', field: 'credentials_found', sortable: true },
        { name: 'route_found', align: 'center', label: 'Route Found', field: 'route_found', sortable: true },
        { name: 'available', align: 'center', label: 'Available', field: 'available', sortable: true },
        { name: 'authentication_type', align: 'center', label: 'Authentication Type', field: 'authentication_type', sortable: true }
      ],
      initialPagination: {
        rowsPerPage: 10
      },
      columnsUsers: [
        { name: 'username', align: 'center', label: 'User Name', field: 'username', sortable: true },
        { name: 'user_level', align: 'center', label: 'User Level', field: 'user_level', sortable: true }
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
<template>
  <div class='q-pa-md q-gutter-sm' style='margin-bottom: -35px;'>
    <q-toolbar class='bg-cyan text-white shadow-2 rounded-borders' style='width: 99.5%'>
      <label style='text-transform: uppercase;font-size: medium; font-weight: bold;margin-right: 15px;'> {{ currentNode.name }}</label>
      <q-tabs v-model='tab' narrow-indicator inline-label dense shrink stretch align='left' :breakpoint="0">
        <q-tab name='config' icon='settings_applications' :label="$t('config')"/>
        <q-tab name='cloud' icon='cloud' :label="$t('cloud')"/>
        <q-tab name='general' icon='developer_board' :label="$t('general')"/>
        <q-tab name='info' icon='analytics' :label="$t('info')"/>
      </q-tabs>
    </q-toolbar>
  </div>

  <div class='q-pa-md q-gutter-sm' v-if='config&&tab==="config"'>
    <div class='row'>

      <div class='col-4'>
        <q-card class="my-card" flat bordered>
          <q-card-section class="bg-cyan text-white">
            <CommandBar v-if='tab==="config"' :show-delete='false' @on-save='onSave' @on-restore='onRestore'
                        :show-refresh="true" :inactive-refresh="loadingConfig" @on-refresh="configDatabind"/>
          </q-card-section>
          <q-separator/>
          <q-card-section>
            <q-input v-model.trim='device.device_name' filled dense :label="$t('device') + ' ' + $t('name')" disable/>
            <q-space style='height: 10px;'/>
            <q-select emit-value map-options filled disable dense
                      v-model='device.device_type' :options='optDeviceTypes' :label="$t('device') + ' ' + $t('type')"/>
          </q-card-section>
        </q-card>
        <q-space style='height: 10px;'/>

        <q-card class="my-card" flat bordered>
          <q-card-section class="bg-cyan text-white">
            <div class="text-subtitle2">
              <div class="text-subtitle2"><label style='text-transform: uppercase;font-size: medium'>{{ $t('general') }}</label></div>
            </div>
          </q-card-section>
          <q-separator/>
          <q-card-section>
            <q-input v-model.trim='general.root_folder_path' filled dense :label="$t('rootfolderpath')"/>
            <q-space style='height: 10px;'/>
            <q-input type="number" v-model.number='general.heartbeat_interval' filled dense :label="$t('heartbeat_interval')"/>
          </q-card-section>
        </q-card>
        <q-space style='height: 10px;'/>

        <q-card class="my-card" flat bordered>
          <q-card-section class="bg-cyan text-white">
            <div class="text-subtitle2">
              <label style='text-transform: uppercase;font-size: medium'>{{ $t('database') }}</label>
            </div>
          </q-card-section>
          <q-separator/>
          <q-card-section>
            <q-select emit-value map-options filled dense v-model='db.type' :options='dbTypes' :label="$t('database')"/>
            <q-space style='height: 10px;'/>
            <q-input v-model.trim='db.connection_string' filled dense :label="$t('connection_string')"/>
          </q-card-section>
        </q-card>
        <q-space style='height: 10px;'/>

        <q-card class="my-card" flat bordered>
          <q-card-section class="bg-cyan text-white">
            <div class="text-subtitle2">
              <label style='text-transform: uppercase;font-size: medium'>{{ $t('archive') }}</label>
            </div>
          </q-card-section>
          <q-separator/>
          <q-card-section>
            <q-input type="number" v-model.number='archive.limit_percent' filled dense :label="$t('limit_percent')"/>
            <q-space style='height: 10px;'/>
            <q-select emit-value map-options filled dense v-model='archive.action_type' :options='archiveActionTypes' :label="$t('action_type')"/>
            <q-space v-show="archive.action_type===1" style='height: 10px;'/>
            <q-input v-show="archive.action_type===1" v-model.trim='archive.move_location' filled dense :label="$t('move_location')"/>
          </q-card-section>
        </q-card>
        <q-space style='height: 10px;'/>

        <q-card class="my-card" flat bordered>
          <q-card-section class="bg-cyan text-white">
            <div class="text-subtitle2">
              <label style='text-transform: uppercase;font-size: medium'>{{ $t('ui') }}</label>
            </div>
          </q-card-section>
          <q-separator/>
          <q-card-section>
            <q-input type="number" v-model.number='ui.gs_width' filled dense :label="$t('grid_stack_row')"/>
            <q-space style='height: 10px;'/>
            <q-input type="number" v-model.number='ui.gs_height' filled dense :label="$t('grid_stack_column')"/>
            <q-space style='height: 10px;'/>
            <q-input type="number" v-model.number='ui.booster_interval' filled dense :label="$t('booster_interval')"/>
            <q-space style='height: 10px;'/>
            <q-input type="number" v-model.number='ui.seek_to_live_edge_internal' filled dense :label="$t('seek_to_live_edge_internal')"/>
          </q-card-section>
        </q-card>
        <q-space style='height: 10px;'/>

        <q-card class="my-card" flat bordered style="margin: 0 5px 0 5px;">
          <q-card-section class="bg-cyan text-white">
            <div class="text-subtitle2">
              <label style='text-transform: uppercase;font-size: medium'>{{ $t('recurring_jobs') }}</label>
            </div>
          </q-card-section>
          <q-separator/>
          <q-card-section>
            <q-toggle v-model='jobs.mac_ip_matching_enabled' filled dense :label="$t('mac_ip_match_enabled')"/>
            <q-space style='height: 10px;'/>
            <q-input type="number" v-model.number='jobs.mac_ip_matching_interval' filled dense :label="$t('mac_ip_matching_interval')"/>
            <q-toggle v-model='jobs.black_screen_monitor_enabled' filled dense :label="$t('black_screen_monitor_enabled')"/>
            <q-space style='height: 10px;'/>
            <q-input type="number" v-model.number='jobs.black_screen_monitor_interval' filled dense :label="$t('black_screen_monitor_interval')"/>
          </q-card-section>
        </q-card>
        <q-space style='height: 10px;'/>

      </div>

      <div class='col-4'>

        <q-card class="my-card" flat bordered style="margin: 0 5px 0 5px;">
          <q-card-section class="bg-cyan text-white">
            <div class="text-subtitle2">
              <label style='text-transform: uppercase;font-size: medium'>{{ $t('snapshot') }}</label>
            </div>
          </q-card-section>
          <q-separator/>
          <q-card-section>
            <q-input v-model.number='snapshot.process_count' type='number' filled dense :label="$t('process_count')"/>
          </q-card-section>
        </q-card>
        <q-space style='height: 10px;'/>

        <q-card class="my-card" flat bordered style="margin: 0 5px 0 5px;">
          <q-card-section class="bg-cyan text-white">
            <div class="text-subtitle2">
              <label style='text-transform: uppercase;font-size: medium'>{{ $t('opencv_stream_reader') }}</label>
            </div>
          </q-card-section>
          <q-separator/>
          <q-card-section>
            <q-toggle v-model='sourceReader.resize_img' filled dense :label="$t('resize_image')">
              <q-tooltip><strong>{{ $t('tresize') }}</strong></q-tooltip>
            </q-toggle>
            <q-space style='height: 10px;'/>
            <q-input v-model.number='sourceReader.buffer_size' type='number' filled dense :label="$t('buffer_size')"/>
            <q-space style='height: 10px;'/>
            <q-input v-model.number='sourceReader.max_retry' type='number' filled dense :label="$t('max_retry')"/>
            <q-space style='height: 10px;'/>
            <q-input v-model.number='sourceReader.max_retry_in' type='number' filled dense :label="$t('max_retry_in')"/>
          </q-card-section>
        </q-card>
        <q-space style='height: 10px;'/>

        <q-card class="my-card" flat bordered style="margin: 0 5px 0 5px;">
          <q-card-section class="bg-cyan text-white">
            <div class="text-subtitle2">
              <label style='text-transform: uppercase;font-size: medium'>FFmpeg</label>
            </div>
          </q-card-section>
          <q-separator/>
          <q-card-section>
            <q-toggle v-model='ffmpeg.use_double_quotes_for_path' filled dense :label="$t('use_double_quotes_for_path')"/>
            <q-space style='height: 10px;'/>
            <q-input v-model.number='ffmpeg.max_operation_retry_count' type='number' filled dense :label="$t('max_retry_count')"/>
            <q-space style='height: 10px;'/>
            <q-input v-model.number='ffmpeg.rtmp_server_init_interval' type='number' filled dense :label="$t('rtmp_server_init_interval')"/>
            <q-space style='height: 10px;'/>
            <q-input v-model.number='ffmpeg.watch_dog_interval' type='number' filled dense :label="$t('watch_dog_interval')"/>
            <q-space style='height: 10px;'/>
            <q-input v-model.number='ffmpeg.watch_dog_failed_wait_interval' type='number' filled dense :label="$t('watch_dog_failed_wait_interval')"/>
            <q-space style='height: 10px;'/>
            <q-input v-model.number='ffmpeg.start_task_wait_for_interval' type='number' filled dense :label="$t('start_task_wait_for_interval')"/>
            <q-space style='height: 10px;'/>
            <q-input v-model.number='ffmpeg.record_concat_limit' type='number' filled dense :label="$t('record_concat_limit')"/>
            <q-space style='height: 10px;'/>
            <q-input v-model.number='ffmpeg.record_video_file_indexer_interval' type='number' filled dense
                     :label="$t('record_video_file_indexer_interval')"/>
            <q-space style='height: 10px;'/>
            <q-input v-model.number='ffmpeg.rtmp_server_port_start' type='number' filled dense :label="$t('rtmp_server_port_start')"/>
            <q-space style='height: 10px;'/>
            <q-input v-model.number='ffmpeg.rtmp_server_port_end' type='number' filled dense :label="$t('rtmp_server_port_end')"/>
          </q-card-section>
        </q-card>
        <q-space style='height: 10px;'/>

      </div>

      <div class='col-4'>

        <q-card class="my-card" flat bordered>
          <q-card-section class="bg-cyan text-white">
            <div class="text-subtitle2">
              <label style='text-transform: uppercase;font-size: medium'>{{ $t('ai') }}</label>
            </div>
          </q-card-section>
          <q-separator/>
          <q-card-section>
            <q-toggle v-model='ai.overlay' filled dense :label="$t('overlay')"/>
            <q-space style='height: 10px;'/>
            <q-input type="number" v-model.number='ai.video_clip_duration' filled dense :label="$t('video_clip_duration')"/>
            <q-space style='height: 10px;'/>
            <q-input type="number" v-model.number='ai.face_recog_mtcnn_threshold' filled dense :label="$t('face_recog_mtcnn_threshold')"/>
            <q-space style='height: 10px;'/>
            <q-input type="number" v-model.number='ai.face_recog_prob_threshold' filled dense :label="$t('face_recog_prob_threshold')"/>
            <q-space style='height: 10px;'/>
            <q-input type="number" v-model.number='ai.plate_recog_instance_count' filled dense :label="$t('plate_recog_instance_count')"/>
          </q-card-section>
        </q-card>
        <q-space style='height: 10px;'/>

        <q-card class="my-card" flat bordered>
          <q-card-section class="bg-cyan text-white">
            <div class="text-subtitle2">
              <label style='text-transform: uppercase;font-size: medium'>PyTorch</label>
            </div>
          </q-card-section>
          <q-separator/>
          <q-card-section>
            <q-input v-model.trim='torch.model_name' filled dense :label="$t('model_name')"/>
            <q-space style='height: 10px;'/>
            <q-input v-model.trim='torch.model_name_specific' filled dense :label="$t('specific_model_name')"/>
          </q-card-section>
        </q-card>
        <q-space style='height: 10px;'/>

        <q-card class="my-card" flat bordered>
          <q-card-section class="bg-cyan text-white">
            <div class="text-subtitle2">
              <label style='text-transform: uppercase;font-size: medium'>Tensorflow</label>
            </div>
          </q-card-section>
          <q-separator/>
          <q-card-section>
            <q-input v-model='tf.model_name' filled dense :label="$t('model_name')"/>
            <q-space style='height: 10px;'/>
            <q-input v-model='tf.cache_folder' filled dense :label="$t('cache_folder')"/>
          </q-card-section>
        </q-card>
        <q-space style='height: 10px;'/>

        <q-card class="my-card" flat bordered>
          <q-card-section class="bg-cyan text-white">
            <div class="text-subtitle2">
              <label style='text-transform: uppercase;font-size: medium'>NVIDIA JETSON</label>
            </div>
          </q-card-section>
          <q-separator/>
          <q-card-section>
            <q-input v-model.trim='jetson.model_name' filled dense :label="$t('model_name')"/>
          </q-card-section>
        </q-card>
        <q-space style='height: 10px;'/>

        <q-card class="my-card" flat bordered>
          <q-card-section class="bg-cyan text-white">
            <div class="text-subtitle2">
              <label style='text-transform: uppercase;font-size: medium'>DeepStack</label>
            </div>
          </q-card-section>
          <q-separator/>
          <q-card-section>
            <q-input v-model.trim='deepstack.server_url' filled dense :label="$t('server_url')"/>
            <q-space style='height: 10px;'/>
            <q-input type="number" v-model.number='deepstack.server_port' filled dense :label="$t('server_port')"/>
            <q-space style='height: 10px;'/>
            <q-select emit-value map-options filled dense v-model='deepstack.performance_mode' :options='deepStackPerOpts'
                      :label="$t('performance_mode')"/>
            <q-space style='height: 10px;'/>
            <q-input type="password" v-model.trim='deepstack.api_key' filled dense :label="$t('api_key')"/>
            <q-space style='height: 10px;'/>
            <q-toggle v-model='deepstack.od_enabled' filled dense :label="$t('od_enabled')"/>
            <q-space style='height: 10px;'/>
            <q-input type="number" v-model.number='deepstack.od_threshold' filled dense :label="$t('od_threshold')"/>
            <q-space style='height: 10px;'/>
            <q-toggle v-model='deepstack.fr_enabled' filled dense :label="$t('fr_enabled')"/>
            <q-space style='height: 10px;'/>
            <q-input type="number" v-model.number='deepstack.fr_threshold' filled dense :label="$t('fr_threshold')"/>
            <q-space style='height: 10px;'/>
            <q-select emit-value map-options filled dense v-model='deepstack.docker_type' :options='deepStackDockerTypes'
                      :label="$t('docker_type')"/>
          </q-card-section>
        </q-card>
        <q-space style='height: 10px;'/>

      </div>

    </div>
  </div>
  <div class='q-pa-md q-gutter-sm' v-if='config&&tab==="cloud"'>
    <Cloud/>
  </div>
  <div class='q-pa-md q-gutter-sm' v-if='config&&tab==="general"' style='margin-top: -45px;'>
    <q-space style='height: 1px;'/>
    <q-card class="my-card" flat bordered>
      <q-card-section class="bg-yellow-14 text-white">
        <div class="text-subtitle2">
          <label style='text-transform: uppercase;font-size: medium'>{{ $t('running_services') }}</label>
        </div>
      </q-card-section>
      <q-separator/>
      <q-table :pagination='initialPagination' :rows='services' row-key='name' :columns='servicesColumns' color='yellow-14'
               :rows-per-page-label="$t('rows_per_page')" :filter="filterServices" :loading="loadingServices">

        <template v-slot:body-cell-restart='props'>
          <q-td :props='props' v-if="props.row.instance_type===1">
            <q-btn color='primary' icon='restart_alt' @click='onRestartService(props.row)' :disable="!props.row.restart_button_enabled">
              <q-tooltip>{{ $t('restart_service') }}</q-tooltip>
              <q-inner-loading :showing='restartLoading[props.row.name]'/>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:body-cell-start='props'>
          <q-td :props='props' v-if="props.row.instance_type===1">
            <q-btn color='secondary' icon='play_circle' @click='onStartService(props.row)' :disable="!props.row.start_button_enabled">
              <q-tooltip>{{ $t('start_service') }}</q-tooltip>
              <q-inner-loading :showing='startLoading[props.row.name]'/>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:body-cell-stop='props'>
          <q-td :props='props' v-if="props.row.instance_type===1">
            <q-btn color='red' icon='stop_circle' @click='onStopService(props.row)' :disable="!props.row.stop_button_enabled">
              <q-tooltip>{{ $t('stop_service') }}</q-tooltip>
              <q-inner-loading :showing='stopLoading[props.row.name]'/>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:top-right>
          <q-btn icon='refresh' :label="$t('refresh')" color='yellow-14' style='margin-right: 15px;' @click='serviceDataBind'/>
          <q-input borderless dense debounce='300' v-model='filterServices' :placeholder="$t('search')">
            <template v-slot:append>
              <q-icon name='search'/>
            </template>
          </q-input>
        </template>

        <template v-slot:loading>
          <q-inner-loading showing color="lime-6"/>
        </template>

      </q-table>
    </q-card>
    <q-space style='height: 10px;'/>

    <q-card class="my-card" flat bordered v-if="!readonlyMode">
      <q-card-section class="bg-teal text-white">
        <div class="text-subtitle2">
          <label style='text-transform: uppercase;font-size: medium'>{{ $t('users2') }}</label>
        </div>
      </q-card-section>
      <q-separator/>
      <q-table :pagination='initialPagination' :rows='users' row-key='id' :columns='userColumns' color='teal'
               :rows-per-page-label="$t('rows_per_page')" :filter="filterUsers" :loading="loadingUsers">
        <template v-slot:body-cell-delete='props'>
          <q-td :props='props'>
            <div>
              <q-btn round color='deep-orange' icon='delete' @click='onDeleteUser(props.row)'>
                <q-tooltip>{{ $t('delete') }}</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <template v-slot:top-right>
          <q-btn icon='refresh' :label="$t('refresh')" color='teal' style='margin-right: 15px;' @click='userDataBind'/>
          <q-input borderless dense debounce='300' v-model='filterUsers' :placeholder="$t('search')">
            <template v-slot:append>
              <q-icon name='search'/>
            </template>
          </q-input>
        </template>

        <template v-slot:loading>
          <q-inner-loading showing color="teal"/>
        </template>

      </q-table>
    </q-card>
    <q-space style='height: 10px;' v-if="!readonlyMode"/>

    <q-card class="my-card" flat bordered>
      <q-card-section class="bg-brown-5 text-white">
        <div class="text-subtitle2">
          <label style='text-transform: uppercase;font-size: medium'>{{ $t('scan_network_for_cameras') }}</label>
        </div>
      </q-card-section>
      <q-separator/>
      <q-card-section>
        <q-input v-model='networkScanResults.created_at' filled readonly dense :label="$t('last_scan_at')"/>
        <q-space style='height: 10px;'/>
        <q-btn icon='radar' :label="$t('scan_network_for_cameras')" color='brown-5' @click='onScanNetwork' :disable='showScanLoading'>
          <q-inner-loading :showing='showScanLoading'/>
        </q-btn>
        <q-space style='height: 10px;'/>
        <q-table :title="$t('scan_network_results')" :rows='networkScanResults.results' :columns='networkColumns'
                 row-key='address' :pagination='initialPagination' color='brown-5' :rows-per-page-label="$t('rows_per_page')"
                 :loading="showScanLoading" :filter="filterNetworkScanResults">

          <template v-slot:top-right>
            <q-input borderless dense debounce='300' v-model='filterNetworkScanResults' :placeholder="$t('search')">
              <template v-slot:append>
                <q-icon name='search'/>
              </template>
            </q-input>
          </template>

          <template v-slot:loading>
            <q-inner-loading showing color="brown-5"/>
          </template>

        </q-table>
      </q-card-section>
    </q-card>
    <q-space style='height: 10px;'/>

    <q-card class="my-card" flat bordered>
      <q-card-section class="bg-blue-6 text-white">
        <div class="text-subtitle2">
          <label style='text-transform: uppercase;font-size: medium'>RTSP {{ $t('templates') }}</label>
        </div>
      </q-card-section>
      <q-separator/>
      <q-table :pagination='initialPagination' :rows='rtmpTemplates' row-key='id' :columns='rtmpTemplatesColumns' color='light-blue-6'
               :rows-per-page-label="$t('rows_per_page')" :loading="loadingRtmpTemplates" :filter="filterRtmpTemplates">
        <template v-slot:top-right>
          <q-btn icon='refresh' :label="$t('refresh')" color='light-blue-6' style='margin-right: 15px;' @click='rtmpTemplatesDataBind'/>
          <q-input borderless dense debounce='300' v-model='filterRtmpTemplates' :placeholder="$t('search')">
            <template v-slot:append>
              <q-icon name='search'/>
            </template>
          </q-input>
        </template>

        <template v-slot:loading>
          <q-inner-loading showing color="light-blue-6"/>
        </template>
      </q-table>
    </q-card>
    <q-space style='height: 10px;'/>

  </div>
  <div class='q-pa-md q-gutter-sm' v-if='config&&tab==="info"'>
    <q-toolbar class='bg-lime-7 text-white shadow-2 rounded-borders' style='width: 99.5%;margin-bottom: -20px;'>
      <q-tabs v-model='otherTabs' narrow-indicator inline-label dense shrink stretch align='left'>
        <q-tab name="gpu" icon="memory" :label="$t('gpu')"/>
        <q-tab name='failedstreams' icon='sms_failed' :label="$t('failed_streams')"/>
        <q-tab name='recstucks' icon='radio_button_checked' :label="$t('stuck_records')"/>
        <q-tab name='ods' icon='collections' :label="$t('od_models')"/>
        <q-tab name='various' icon='notes' :label="$t('various_infos')"/>
      </q-tabs>
    </q-toolbar>
    <div v-if='otherTabs==="gpu"' style="margin-top: 25px;">
      <GpuInfo/>
    </div>
    <div v-if='otherTabs==="failedstreams"' style="margin-top: 25px;">
      <q-table :pagination='initialPagination' :rows='failedStreams' row-key='id' :columns='failedStreamsColumns'
               :rows-per-page-label="$t('rows_per_page')" color='lime-6' :loading="loadingFailedStreams">
        <template v-slot:top-right>
          <q-btn icon='refresh' :label="$t('refresh')" color='lime-6' style='margin-right: 15px;' @click='failedStreamsDatabind'/>
        </template>
        <template v-slot:loading>
          <q-inner-loading showing color="lime-6"/>
        </template>
      </q-table>
    </div>
    <div v-if='otherTabs==="recstucks"' style="margin-top: 25px;">onceDetector
      <q-table :pagination='initialPagination' :rows='recStucks' row-key='id' :columns='recStucksColumns' color='lime-6'
               :rows-per-page-label="$t('rows_per_page')" :loading="loadingRecStucks">
        <template v-slot:top-right>
          <q-btn icon='refresh' :label="$t('refresh')" color='lime-6' style='margin-right: 15px;' @click='recStucksDatabind'/>
        </template>
        <template v-slot:loading>
          <q-inner-loading showing color="lime-6"/>
        </template>
      </q-table>
    </div>
    <div v-if='otherTabs==="ods"' style="margin-top: 25px;">
      <q-table :pagination='initialPagination' :rows='ods' row-key='id' :columns='odColumns' color='lime-6'
               :rows-per-page-label="$t('rows_per_page')" :loading="loadingOds">
        <template v-slot:top-right>
          <q-btn icon='refresh' :label="$t('refresh')" color='lime-6' style='margin-right: 15px;' @click='odsDatabind'/>
        </template>
        <template v-slot:loading>
          <q-inner-loading showing color="lime-6"/>
        </template>
      </q-table>
    </div>
    <div v-if='otherTabs==="various"' style="margin-top: 35px">
      <ImportExportSource/>
      <q-separator style="margin: 15px 0 15px 0;" />
      <table style='width: 500px;' class="bg-teal-1">
        <tr>
          <td>
            <q-input v-model='variousInfos.rtmp_port_counter' type='number' :label="$t('rtmp_counter')" readonly/>
          </td>
          <td>
            <q-btn icon='refresh' :label="$t('refresh')" color='lime-6' style='margin-right: 15px;' @click='variousInfosDataBind'
                   :disable="loadingVariousInfo">
              <q-inner-loading :showing="loadingVariousInfo" color="lime-6"/>
            </q-btn>
          </td>
        </tr>
        <tr>
          <td>
            <q-input v-model='variousInfos.ffmpeg_process_zombies.length' type='number' :label="$t('total_detected_zombie_ffmpeg_processes')"
                     readonly/>
          </td>
        </tr>
      </table>
      <q-separator style="margin: 15px 0 15px 0;" />
      <q-list bordered class='rounded-borders bg-teal-1' style="max-width: 300px;margin-top: 15px;">
        <q-item-label header>{{ $t('zombie_rtmp_containers') }}</q-item-label>
        <q-item clickable v-ripple v-for='zr in variousInfos.rtmp_container_zombies' :key='zr'>
          <q-item-section>
            <q-item-label caption lines='2'>
              {{ zr }}
            </q-item-label>
          </q-item-section>
          <q-separator inset='item'/>
        </q-item>
      </q-list>
    </div>
  </div>
  <!--  <div class='q-pa-md q-gutter-sm' v-if='config&&tab==="others"'>-->
  <!--    <div class='row'>-->
  <!--      <div class='col-6'>-->
  <!--        <Dashboard/>-->
  <!--      </div>-->
  <!--      <div class='col-6'>-->
  <!--        <Hub/>-->
  <!--      </div>-->
  <!--    </div>-->
  <!--  </div>-->
</template>

<script lang='ts'>
import {NodeService} from 'src/utils/services/node_service';
import {onBeforeUnmount, onMounted, ref} from 'vue';
import {
  Config, JetsonConfig, DeviceConfig, TorchConfig, SourceReaderConfig,
  FFmpegConfig, TensorflowConfig, AiConfig, GeneralConfig, UiConfig, DbConfig, JobsConfig,
  DeepStackConfig, ArchiveConfig, SnapshotConfig
} from 'src/utils/models/config';
import {PublishService, SubscribeService} from 'src/utils/services/websocket_services';
import {NetworkDiscoveryModel, OnvifAction, OnvifEvent} from 'src/utils/models/onvif_models';
import {databindWithLoading, fixArrayDates, myDateToJsDate, validateModel} from 'src/utils/utils';
import {WsConnection} from 'src/utils/ws/connection';
import {ServiceModel} from 'src/utils/models/service_model';
import {User} from 'src/utils/models/user_model';
import {useQuasar} from 'quasar';
import {NodeRepository} from 'src/utils/db';
import {Node} from 'src/utils/entities';
import CommandBar from 'src/components/CommandBar.vue';
import GpuInfo from 'components/GpuInfo.vue';
import {FailedStreamModel, RecStuckModel, RtspTemplateModel, VariousInfos} from 'src/utils/models/others_models';
import {OdModel} from 'src/utils/models/od_model';
import Cloud from 'components/Cloud.vue';
import ImportExportSource from 'components/ImportExportSource.vue';
import {SelectOption} from 'src/utils/services/local_service';
import {useI18n} from 'vue-i18n';
import {StoreService} from 'src/utils/services/store_service';

export default {
  name: 'NodeConfig',
  components: {Cloud, CommandBar, GpuInfo, ImportExportSource},
  setup() {
    const {t} = useI18n({useScope: 'global'});
    const $q = useQuasar();
    const nodeService = new NodeService();
    const publishService = new PublishService();
    const storeService = new StoreService();
    const config = ref<Config>();
    const loadingConfig = ref<boolean>(false);
    const device = ref<DeviceConfig>();
    const general = ref<GeneralConfig>();
    const db = ref<DbConfig>();
    const dbTypes = ref(nodeService.LocalService.createDbTypes());


    const optDeviceTypes = ref(getDeviceTypes());
    const sourceReader = ref<SourceReaderConfig>();
    const ffmpeg = ref<FFmpegConfig>();
    const ai = ref<AiConfig>();
    const ui = ref<UiConfig>();
    const jobs = ref<JobsConfig>();
    const deepstack = ref<DeepStackConfig>();
    const deepStackPerOpts = ref<SelectOption[]>(nodeService.LocalService.createDeepStackPerformanceModes());
    const deepStackDockerTypes = ref<SelectOption[]>(nodeService.LocalService.createDeepStackDockerTypes());
    const archive = ref<ArchiveConfig>();
    const snapshot = ref<SnapshotConfig>();
    const archiveActionTypes = ref<SelectOption[]>(nodeService.LocalService.createArchiveActionTypes(t));

    //jetson
    const jetson = ref<JetsonConfig>();
    const jetsonFilter = ref<string>();

    //torch
    const torch = ref<TorchConfig>();
    const tf = ref<TensorflowConfig>();
    const torchFilter = ref<string>();
    const tfFilter = ref<string>();

    const showScanLoading = ref<boolean>(false);
    const networkScanResults = ref<NetworkDiscoveryModel>({});
    const filterNetworkScanResults = ref<string>('');
    let connOnvif: WsConnection | null = null;

    const currentNode = ref<Node>(nodeService.LocalService.createEmptyNode());

    const services = ref<ServiceModel[]>([]);
    const loadingServices = ref<boolean>(false);
    const filterServices = ref<string>('');
    const restartLoading = ref<any>({});
    const startLoading = ref<any>({});
    const stopLoading = ref<any>({});
    const users = ref<User[]>([]);
    const loadingUsers = ref<boolean>(false);
    const filterUsers = ref<string>('');
    const rtmpTemplates = ref<RtspTemplateModel[]>([]);
    const loadingRtmpTemplates = ref<boolean>(false);
    const filterRtmpTemplates = ref<string>('');

    const failedStreams = ref<FailedStreamModel[]>([]);
    const loadingFailedStreams = ref<boolean>(false);
    const recStucks = ref<RecStuckModel[]>([]);
    const loadingRecStucks = ref<boolean>(false);
    const variousInfos = ref<VariousInfos>({rtmp_port_counter: 0, rtmp_container_zombies: [], ffmpeg_process_zombies: []});
    const loadingVariousInfo = ref<boolean>(false);
    const ods = ref<OdModel[]>([]);
    const loadingOds = ref<boolean>(false);
    const readonlyMode = storeService.readonlyMode;

    const setConfigValue = (c: Config) => {
      device.value = c.device;
      sourceReader.value = c.source_reader;
      general.value = c.general;
      db.value = c.db;
      ffmpeg.value = c.ffmpeg;
      torch.value = c.torch;
      tf.value = c.tensorflow;
      jetson.value = c.jetson;
      ai.value = c.ai;
      ui.value = c.ui;
      jobs.value = c.jobs;
      deepstack.value = c.deep_stack;
      archive.value = c.archive;
      snapshot.value = c.snapshot;
    };

    const configDatabind = async () => {
      await databindWithLoading(loadingConfig, async () => {
        config.value = await nodeService.getConfig();
        setConfigValue(config.value);
      });
    }

    const serviceDataBind = async () => {
      await databindWithLoading(loadingServices, async () => {
        const svcs = await nodeService.getServices();
        for (const svc of svcs) {
          restartLoading.value[svc.name] = false;
        }
        fixArrayDates(svcs, 'created_at', 'heartbeat');
        services.value = svcs;
      });
    };

    const userDataBind = async () => {
      if (readonlyMode.value){
        return;
      }
      await databindWithLoading(loadingUsers, async () => {
        const usrs = await nodeService.getUsers();
        fixArrayDates(usrs, 'last_login_at');
        users.value = usrs;
      });
    };

    const failedStreamsDatabind = async () => {
      await databindWithLoading(loadingFailedStreams, async () => {
        failedStreams.value = await nodeService.getFailedStreams();
        fixArrayDates(failedStreams.value, 'last_check_at');
      });
    };

    const recStucksDatabind = async () => {
      await databindWithLoading(loadingRecStucks, async () => {
        recStucks.value = await nodeService.getRecStucks();
        fixArrayDates(recStucks.value, 'last_check_at');
      });
    };

    const odsDatabind = async () => {
      await databindWithLoading(loadingOds, async () => {
        ods.value = await nodeService.getOds();
        fixArrayDates(ods.value, 'created_at');
      });
    }

    const variousInfosDataBind = async () => {
      await databindWithLoading(loadingVariousInfo, async () => {
        variousInfos.value = await nodeService.getVariousInfos();
      });
    };

    const rtmpTemplatesDataBind = async () => {
      await databindWithLoading(loadingRtmpTemplates, async () => {
        rtmpTemplates.value = await nodeService.getRtspTemplates();
      });
    };

    onMounted(async () => {
      const nodeIp = await nodeService.LocalService.getNodeIP();
      const nodePort = await nodeService.LocalService.getNodePort();
      const subscribeService = new SubscribeService(nodeIp, nodePort);

      const an = await new NodeRepository().getActiveNode();
      if (an) {
        currentNode.value = an;
      }
      await configDatabind();
      const on = await nodeService.getOnvifNetwork();
      if (on) {
        networkScanResults.value = on;
        networkScanResults.value.created_at = myDateToJsDate(<string>networkScanResults.value.created_at).toLocaleString();
      }

      await serviceDataBind();
      await userDataBind();

      await rtmpTemplatesDataBind();

      await failedStreamsDatabind();
      await recStucksDatabind();
      await odsDatabind();
      await variousInfosDataBind();

      connOnvif = subscribeService.subscribeOnvif((event: MessageEvent) => {
        const result: OnvifEvent = JSON.parse(event.data);
        if (result.type === OnvifAction.NetworkDiscovery) {
          networkScanResults.value.results = JSON.parse(atob(result.base64_model));
          showScanLoading.value = false;
        }
      });
    });
    onBeforeUnmount(() => {
      if (connOnvif) {
        connOnvif.close();
      }
    });

    const onSave = async () => {
      const prevConfig = await nodeService.getConfig();
      const validationResult = validateModel(t, prevConfig, config.value);
      if (validationResult.length > 0) {
        for (const result of validationResult) {
          $q.notify({
            message: result,
            caption: t('invalid'),
            color: 'red',
            position: 'bottom-right'
          });
        }
        return;
      }
      const portDiff = (config.value?.ffmpeg.rtmp_server_port_end ?? 0) - (config.value?.ffmpeg.rtmp_server_port_start ?? 0);
      if (portDiff < 1){
        $q.notify({
          message: t('v_rtmp_server_port_start'),
          caption: t('invalid'),
          color: 'red',
          position: 'bottom-right'
        });
        return;
      }
      if ((config.value?.ffmpeg.rtmp_server_port_start ?? 0)< 1024){
        $q.notify({
          message: t('v_l_rtmp_server_port_start'),
          caption: t('invalid'),
          color: 'red',
          position: 'bottom-right'
        });
        return;
      }
      if ((config.value?.ffmpeg.rtmp_server_port_end ?? 0)> 65535){
        $q.notify({
          message: t('v_g_rtmp_server_port_end'),
          caption: t('invalid'),
          color: 'red',
          position: 'bottom-right'
        });
        return;
      }
      const source = await nodeService.getSourceList();
      if (source.length * 5 > portDiff){
        $q.notify({
          message: t('v_rtmp_server_port_start_source'),
          caption: t('invalid'),
          color: 'red',
          position: 'bottom-right'
        });
        return;
      }

      await nodeService.saveConfig(<Config>config.value);
      await nodeService.restartAllServices();
    };

    const onRestore = async () => {
      config.value = await nodeService.restoreConfig();
      setConfigValue(config.value);
    };

    const onDoDeleteUser = async (user: User) => {
      await nodeService.deleteUser(user.id);
      await userDataBind();
    };


    const onRestartService = async (service: ServiceModel) => {
      restartLoading.value[service.name] = true;
      try {
        await nodeService.restartService(service);
      } finally {
        restartLoading.value[service.name] = false;
      }
      await serviceDataBind();
    };

    const onStartService = async (service: ServiceModel) => {
      startLoading.value[service.name] = true;
      try {
        await nodeService.startService(service);
      } finally {
        startLoading.value[service.name] = false;
      }
      await serviceDataBind();
    };

    const onStopService = async (service: ServiceModel) => {
      stopLoading.value[service.name] = true;
      try {
        await nodeService.stopService(service);
      } finally {
        stopLoading.value[service.name] = false;
      }
      await serviceDataBind();
    };

    return {
      config, device, optDeviceTypes, snapshot, sourceReader,
      jetson, jetsonFilter, ffmpeg, tf, ai, general, ui, jobs, db, dbTypes, deepstack, archive,
      torch, torchFilter, tfFilter, showScanLoading, users, restartLoading, startLoading, stopLoading, loadingConfig,
      deepStackPerOpts, deepStackDockerTypes, archiveActionTypes,
      loadingFailedStreams, loadingRecStucks, loadingOds, loadingVariousInfo,
      filterServices, loadingServices, loadingUsers, filterUsers, filterNetworkScanResults,
      currentNode, tab: ref<string>('config'),
      imageExtensions: ['jpg', 'jpeg', 'png', 'bmp', 'gif'],
      onSave, onRestore, onScanNetwork: function () {
        void publishService.publishOnvif({}, OnvifAction.NetworkDiscovery);
        showScanLoading.value = true;
      },
      networkScanResults, services,
      networkColumns: createNetworkColumns(t),
      initialPagination: {
        rowsPerPage: 15
      },
      servicesColumns: createServiceColumns(t),
      userColumns: createUserColumns(t),
      onDeleteUser(user: User) {
        $q.dialog({
          title: 'Confirm',
          message: 'Are you sure you want to delete this user?',
          cancel: true,
          persistent: false
        }).onOk(() => {
          void onDoDeleteUser(user);
        });
      },
      rtmpTemplates, rtmpTemplatesColumns: createRtmpTemplatesColumns(t),
      otherTabs: ref<string>('gpu'),
      failedStreams, failedStreamsColumns: createFailedStreamsColumns(t),
      recStucks, recStucksColumns: createRecStucksColumns(t),
      variousInfos, loadingRtmpTemplates, filterRtmpTemplates, readonlyMode,
      ods, odColumns: createOdColumns(t),
      onRestartService, onStartService, onStopService, serviceDataBind, userDataBind, rtmpTemplatesDataBind,
      failedStreamsDatabind, recStucksDatabind, odsDatabind, variousInfosDataBind, configDatabind
    };
  }
};

function getDeviceTypes() {
  return [{value: 0, label: 'PC'}, {value: 1, label: 'IoT'}];
}

function createNetworkColumns(t: any) {
  const align = 'left';
  return [
    {name: 'address', align, label: t('address'), field: 'address', sortable: true},
    {name: 'route', align, label: t('route'), field: 'route', format: (val: any) => `${val.join(' ')}`, sortable: true},
    {name: 'port', align, label: t('port'), field: 'port', sortable: true},
    {name: 'device', align, label: t('device'), field: 'device', sortable: true},
    {name: 'username', align, label: t('username'), field: 'username', sortable: true},
    {name: 'password', align, label: t('password'), field: 'password', sortable: true},
    {name: 'credentials_found', align, label: t('credentials_found'), field: 'credentials_found', sortable: true},
    {name: 'route_found', align, label: t('route_found'), field: 'route_found', sortable: true},
    {name: 'available', align, label: t('available'), field: 'available', sortable: true},
    {name: 'authentication_type', align, label: t('authentication_type'), field: 'authentication_type', sortable: true}
  ];
}

function createServiceColumns(t: any) {
  return [
    {name: 'restart', align: 'center', label: '', field: 'restart'},
    {name: 'start', align: 'center', label: '', field: 'start'},
    {name: 'stop', align: 'center', label: '', field: 'stop'},
    {name: 'description', align: 'left', label: t('description'), field: 'description', sortable: true},
    {name: 'platform', align: 'left', label: t('platform'), field: 'platform', sortable: true},
    {name: 'created_at', align: 'left', label: t('created_at'), field: 'created_at', format: (val: any) => `${val.toLocaleString()}`, sortable: true},
    {name: 'heartbeat', align: 'left', label: t('heartbeat'), field: 'heartbeat', format: (val: any) => `${val.toLocaleString()}`, sortable: true},
    {name: 'platform_version', align: 'left', label: t('platform_version'), field: 'platform_version', sortable: true},
    {
      name: 'instance_type', align: 'left', label: t('instance_type'), field: 'instance_type',
      format: (val: number) => val === 1 ? 'Docker Container' : 'Systemd', sortable: true
    },
    {name: 'hostname', align: 'left', label: t('hostname'), field: 'hostname', sortable: true},
    {name: 'ip_address', align: 'left', label: t('ip_address'), field: 'ip_address', sortable: true},
    {name: 'mac_address', align: 'left', label: t('mac_address'), field: 'mac_address', sortable: true},
    {name: 'processor', align: 'left', label: t('processor'), field: 'processor', sortable: true},
    {name: 'cpu_count', align: 'left', label: t('cpu_count'), field: 'cpu_count', sortable: true},
    {name: 'ram', align: 'left', label: t('ram'), field: 'ram', sortable: true},
    {name: 'pid', align: 'left', label: t('pid'), field: 'pid', sortable: true},
    {name: 'name', align: 'left', label: t('name'), field: 'name', sortable: true},
    {name: 'instance_name', align: 'left', label: t('instance_name'), field: 'instance_name', sortable: true}
  ];
}

function createUserColumns(t: any) {
  const align = 'left';
  return [
    {name: 'username', align, label: t('username'), field: 'username', sortable: true},
    {name: 'email', align, label: t('email'), field: 'email', sortable: true},
    {
      name: 'last_login_at',
      align,
      label: t('last_login_at'),
      field: 'last_login_at',
      format: (val: any) => `${val.toLocaleString()}`,
      sortable: true
    },
    {name: 'delete', align: 'center', label: '', field: 'delete'}
  ];
}

function createRtmpTemplatesColumns(t: any) {
  const align = 'left';
  return [
    {name: 'name', align, label: t('name'), field: 'name', sortable: true},
    {name: 'description', align, label: t('description'), field: 'description', sortable: true},
    {name: 'brand', align, label: t('brand'), field: 'brand', sortable: true},
    {name: 'default_user', align, label: t('default_user'), field: 'default_user', sortable: true},
    {name: 'default_password', align, label: t('default_password'), field: 'default_password', sortable: true},
    {name: 'default_port', align, label: t('default_port'), field: 'default_port', sortable: true},
    {name: 'route', align, label: t('route'), field: 'route', sortable: true},
    {name: 'templates', align, label: t('templates2'), field: 'templates', sortable: true}
  ];
}

function createFailedStreamsColumns(t: any) {
  const align = 'left';
  return [
    {name: 'brand', align, label: t('brand'), field: 'brand', sortable: true},
    {name: 'name', align, label: t('name'), field: 'name', sortable: true},
    {name: 'address', align, label: t('address'), field: 'address', sortable: true},

    {name: 'rtmp_container_failed_count', align, label: t('rtmp_container_failed_count'), field: 'rtmp_container_failed_count', sortable: true},
    {name: 'rtmp_feeder_failed_count', align, label: t('rtmp_feeder_failed_count'), field: 'rtmp_feeder_failed_count', sortable: true},
    {name: 'hls_failed_count', align, label: t('hls_failed_count'), field: 'hls_failed_count', sortable: true},
    {name: 'ffmpeg_reader_failed_count', align, label: t('ffmpeg_reader_failed_count'), field: 'ffmpeg_reader_failed_count', sortable: true},
    {name: 'record_failed_count', align, label: t('record_failed_count'), field: 'record_failed_count', sortable: true},
    {name: 'snapshot_failed_count', align, label: t('snapshot_failed_count'), field: 'snapshot_failed_count', sortable: true},
    {name: 'record_stuck_process_count', align, label: t('record_stuck_process_count'), field: 'record_stuck_process_count', sortable: true},
    {name: 'source_state_conflict_count', align, label: t('source_state_conflict_count'), field: 'source_state_conflict_count', sortable: true},
    {name: 'last_check_at', align, label: t('last_check_at'), field: 'last_check_at', format: (val: any) => `${val.toLocaleString()}`, sortable: true}
  ];
}

function createRecStucksColumns(t: any) {
  const align = 'left';
  return [
    {name: 'brand', align, label: t('brand'), field: 'brand', sortable: true},
    {name: 'name', align, label: t('name'), field: 'name', sortable: true},
    {name: 'address', align, label: t('address'), field: 'address', sortable: true},

    {name: 'record_segment_interval', align, label: t('record_segment_interval'), field: 'record_segment_interval', sortable: true},
    {name: 'record_output_dir', align, label: t('record_output_dir'), field: 'record_output_dir', sortable: true},
    {name: 'file_ext', align, label: t('file_ext'), field: 'file_ext', sortable: true},
    {name: 'last_modified_file', align, label: t('last_modified_file'), field: 'last_modified_file', sortable: true},
    {name: 'last_modified_size', align, label: t('last_modified_size'), field: 'last_modified_size', sortable: true},
    {name: 'failed_count', align, label: t('failed_count'), field: 'failed_count', sortable: true},
    {name: 'failed_modified_file', align, label: t('failed_modified_file'), field: 'failed_modified_file', sortable: true},
    {name: 'last_check_at', align, label: t('last_check_at'), field: 'last_check_at', format: (val: any) => `${val.toLocaleString()}`, sortable: true}
  ];
}

function createOdColumns(t: any) {
  const align = 'left';
  const style = 'max-width:200px;white-space: nowrap;overflow: hidden !important;text-overflow: ellipsis;';
  return [
    {name: 'brand', align, label: t('brand'), field: 'brand', sortable: true},
    {name: 'name', align, label: t('name'), field: 'name', sortable: true},
    {name: 'address', align, label: t('address'), field: 'address', sortable: true},

    {name: 'created_at', align, label: t('created_at'), field: 'created_at', format: (val: any) => `${val.toLocaleString()}`, sortable: true},

    {name: 'threshold_list', align, label: t('threshold_list'), field: 'threshold_list', sortable: true, style},
    {name: 'selected_list', align, label: t('selected_list'), field: 'selected_list', sortable: true, style},
    {name: 'zones_list', align, label: t('zones_list'), field: 'zones_list', sortable: true},
    {name: 'masks_list', align, label: t('masks_list'), field: 'masks_list', sortable: true},
    {name: 'start_time', align, label: t('start_time'), field: 'start_time', sortable: true},
    {name: 'end_time', align, label: t('end_time'), field: 'end_time', sortable: true}
  ];
}

</script>

<style scoped>

</style>

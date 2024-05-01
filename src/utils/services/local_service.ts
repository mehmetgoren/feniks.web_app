import { checkIpIsLoopBack, isNullOrEmpty, parseIP, parsePort } from 'src/utils/utils';
import {SourceModel} from 'src/utils/models/source_model';
import {StreamModel} from 'src/utils/models/stream_model';
import {SmartVisionModel} from 'src/utils/models/ai_model';
import {User} from 'src/utils/models/user_model';
import {GalleryLocationsService} from 'src/utils/services/gallery_locations_service';
import {Config} from 'src/utils/models/config';
import { UiConfig, createDefaultUiConfig } from '../models/ui_config';
export class LocalService {

  private getDefaultDirPath(config: Config): string {
    const dirPaths = config?.general?.dir_paths;
    if (dirPaths?.length > 0) {
      return dirPaths[0];
    }
    return '';
  }

  private getSourceDirPath(config: Config, streamModel: StreamModel | SourceModel): string {
    const sourceDirPath = streamModel.root_dir_path;
    if (!isNullOrEmpty(sourceDirPath)) {
      return <string>sourceDirPath;
    }
    return this.getDefaultDirPath(config);
  }

  public getHlsAddress(config: Config, streamModel: StreamModel | SourceModel): string {
    let route = `${this.getSourceDirPath(config, streamModel)}/stream/${streamModel.id}/stream.m3u8`
    if (route.startsWith('/')) {
      route = route.slice(1);
    }
    return this.getServerAddress(route);
  }


  public getServerAddress(route: string): string {
    let nodeAddress = `http://${this.getNodeServerIp()}:8072`;
    if (nodeAddress.endsWith('/')) {
      nodeAddress = nodeAddress.slice(0, -1);
    }
    return `${nodeAddress}/${route}`;
  }

  public getServerAddressWithoutDash(route: string): string {
    return this.getServerAddress('').slice(0, -1) + route;
  }

  public getServerIp(): string {
    const serverAddress = this.getServerAddress('');
    return parseIP(serverAddress) ?? '127.0.0.1';
  }

  public getServerPort(): number {
    const serverAddress = this.getServerAddress('');
    return parsePort(serverAddress) ?? 8072;
  }

  public isRemoteServer(): boolean {
    const serverIp = this.getServerIp();
    return !checkIpIsLoopBack(serverIp);
  }

  public getNodeServerIp(): string {
    let nodeIp = localStorage.getItem('feniks_node_server_ip') ?? '';
    if (!nodeIp){
      nodeIp = window.location.hostname || '127.0.0.1'
    }
    return nodeIp;
  }
  public setNodeServerIp(address: string) {
    localStorage.setItem('feniks_node_server_ip', address);
  }

  public setCurrentUser(user: User | null) {
    //@ts-ignore
    sessionStorage.setItem('currentUser', user === null ? null : JSON.stringify({username: user.username, token: user.token}));
  }

  public getCurrentUser(): User | null {
    const json = sessionStorage.getItem('currentUser');
    if (json) {
      return JSON.parse(json);
    }
    return null;
  }

  public getLang(): string {
    try {
      return localStorage.getItem('feniks_language') ?? '';
    } catch {
      return '';
    }
  }

  public setLang(lang: string) {
    localStorage.setItem('feniks_language', lang);
  }

  public saveTheme(theme: Themes) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;
    localStorage.setItem(`theme_${currentUser.token}`, theme.toString());
  }

  public getTheme(): Themes {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return Themes.Light;
    const themeStr = localStorage.getItem(`theme_${currentUser.token}`);
    if (!themeStr) return Themes.Light;
    return <Themes>parseInt(themeStr);
  }

  public setUiConfig(uiConfig: UiConfig) {
    localStorage.setItem('ui_config', JSON.stringify(uiConfig));
  }
  public getUiConfig(): UiConfig {
    const json = localStorage.getItem('ui_config');
    if (json) {
      return JSON.parse(json);
    }
    return createDefaultUiConfig();
  }

  public createGalleryLocationService(): GalleryLocationsService {
    return new GalleryLocationsService(this);
  }

  public getDeviceArchitectures(): SelectOption[] {
    return [{value: 0, label: 'x86'}, {value: 1, label: 'Arm'}];
  }

  public createSenseAiImages(): SelectOption[] {
    return [
      {value:0, label:'CPU'},
      {value:1, label:'GPU_CUDA_11_7'},
      {value:2, label:'GPU_CUDA_12_2'},
      {value:3, label:'ARM64'},
      {value:4, label:'RPI64'}
    ];
  }

  public createRtspTransport(): SelectOption[] {
    return [
      {value: 0, label: 'Auto'},
      {value: 1, label: 'TCP'},
      {value: 2, label: 'UDP'},
      {value: 3, label: 'HTTP'}
    ];
  }

  public createAccelerationEngines(): SelectOption[] {
    return [
      {value: 0, label: 'Auto'},
      {value: 1, label: 'NVIDIA NVENC Cuda'},
      {value: 2, label: 'NVIDIA NVENC Cuvid'},
      {value: 3, label: 'Video Decode and Presentation API for Unix (VDPAU)'},
      {value: 4, label: 'Video Acceleration API (VA-API)'},
      {value: 5, label: 'ARM DRM Object Sharing'},
      {value: 6, label: 'OpenCL'}
    ];
  }

  public createVideoDecoders(): SelectOption[] {
    return [
      {value: 0, label: 'Auto'},
      {value: 1, label: 'NVDEC (H.264 NVIDIA Hardware)'},
      // {value: 2, label: 'NVDEC (H.265 NVIDIA Hardware)'},
      // {value: 3, label: 'NVDEC (MJPEG NVIDIA Hardware)'},
      // {value: 4, label: 'NVDEC (MPEG4 NVIDIA Hardware)'},
      {value: 5, label: 'Quick Sync Video (H.264 INTEL Hardware)'},
      // {value: 6, label: 'Quick Sync Video (H.265 INTEL Hardware)'},
      // {value: 7, label: 'Quick Sync Video (MPEG2 INTEL Hardware)'},
      {value: 8, label: 'MMAL (H.264 Raspberry Pi Hardware)'},
      // {value: 9, label: 'MMAL (MPEG2 Raspberry Pi Hardware)'},
      // {value: 10, label: 'MMAL (MPEG4 Raspberry Pi Hardware)'}
    ];
  }

  public createStreamTypes(): SelectOption[] {
    return [
      {value: 0, label: 'FLV'},
      {value: 1, label: 'HLS'},
      {value: 2, label: 'WebSockets'} // It is PIPE_READER on server side
    ];
  }

  public createStreamVideoCodecs(): SelectOption[] {
    return [
      {value: 0, label: 'Auto'},
      {value: 1, label: 'libx264 (H.264 Software)'},
      // {value: 2, label: 'libx265 (H265 Software)'},
      {value: 3, label: 'copy'},
      {value: 4, label: 'NVENC (H.264 NVIDIA Hardware)'},
      // {value: 5, label: 'NVENC (H.265 NVIDIA Hardware)'},
      {value: 6, label: 'Video Acceleration API (H.264 GPU Hardware)'},
      // {value: 7, label: 'Video Acceleration API (H.265 GPU Hardware)'},
      {value: 8, label: 'Quick Sync Video (H.264 INTEL Hardware)'},
      // {value: 9, label: 'Quick Sync Video (H.265 INTEL Hardware)'},
      // {value: 10, label: 'Quick Sync Video (MPEG2 INTEL Hardware)'},
      {value: 11, label: 'OpenMAX (H.264 Raspberry Pi Hardware)'},
      // {value: 12, label: 'AV1 (AV1 Software)'},
      // {value: 13, label: 'VP8 (VP8 Software)'},
      // {value: 14, label: 'VP9 (VP9 Software)'}
    ];
  }

  public createPresets(t: any): SelectOption[] {
    return [
      {value: 0, label: t('auto')},
      {value: 1, label: t('ultra_fast')},
      {value: 2, label: t('super_fast')},
      {value: 3, label: t('very_fast')},
      {value: 4, label: t('faster')},
      {value: 5, label: t('fast')},
      {value: 6, label: t('medium')},
      {value: 7, label: t('slow')},
      {value: 8, label: t('slower')},
      {value: 9, label: t('very_slow')},
      {value: 10, label: t('placebo')}
    ];
  }

  public createAudioCodecs(): SelectOption[] {
    return [
      {value: 0, label: 'No Audio'},
      // {value: 1, label: 'Vorbis'},
      // {value: 2, label: 'Opus'},
      // {value: 3, label: 'MP3LAME'},
      {value: 4, label: 'AAC'},
      {value: 5, label: 'AC3'},
      // {value: 6, label: 'DTS'},
      // {value: 7, label: 'ALAC'},
      {value: 8, label: 'copy'}
    ];
  }

  public createMediaServerTypes(): SelectOption[] {
    return [
      {value: 0, label: 'Go 2 RTC'},
      {value: 1, label: 'SRS'},
      {value: 2, label: 'LiveGo'},
      {value: 3, label: 'Node Media Server'}
    ];
  }

  public createAudioChannels(): SelectOption[] {
    return [
      {value: 0, label: 'Source'},
      {value: 1, label: 'Mono'},
      {value: 2, label: 'Stereo'}
      // {value: 9, label: '5.1'}
    ];
  }

  public createAudioQualities(): SelectOption[] {
    return [
      {value: 0, label: 'Auto'},
      {value: 1, label: '400'},
      {value: 2, label: '320'},
      {value: 3, label: '256'},
      {value: 4, label: '224'},
      {value: 5, label: '192'},
      {value: 6, label: '160'},
      {value: 7, label: '128'},
      {value: 8, label: '96'},
      {value: 9, label: 'Mute'}
    ];
  }

  public createAudioSampleRates(): SelectOption[] {
    return [
      {value: 0, label: 'Auto'},
      {value: 1, label: '7.35k'},
      {value: 2, label: '8k'},
      {value: 3, label: '11.025k'},
      {value: 4, label: '12k'},
      {value: 5, label: '16k'},
      {value: 6, label: '22.05k'},
      {value: 7, label: '24k'},
      {value: 8, label: '32k'},
      {value: 9, label: '44.1k'},
      {value: 10, label: '48k'}
    ];
  }

  public createRecordFileTypes(): SelectOption[] {
    return [
      {value: 0, label: 'MP4'},
      {value: 1, label: 'WebM'},
      // {value: 2, label: 'FLV'},
      // {value: 3, label: 'MKV'},
      // {value: 4, label: 'AVI'},
      // {value: 5, label: 'MPG'},
      // {value: 6, label: 'OGV'}
    ];
  }

  public createRecordVideoCodecs(): SelectOption[] {
    return [
      {value: 0, label: 'Auto'},
      {value: 1, label: 'libx264 (H264 Software)'},
      {value: 2, label: 'libx265 (H265 Software)'},
      {value: 3, label: 'libvpx (VP8 Software)'},
      {value: 4, label: 'libvpx-vp9 (VP9 Software)'},
      {value: 5, label: 'libsvtav1 (AV1 Software)'},
      {value: 6, label: 'copy'},
      {value: 7, label: 'NVENC (H.264 NVIDIA Hardware)'},
      {value: 8, label: 'NVENC (H.265 NVIDIA Hardware)'},
      {value: 9, label: 'NVENC (AV1 NVIDIA Hardware)'},
      {value: 10, label: 'Video Acceleration API (H.264 GPU Hardware)'},
      {value: 11, label: 'Video Acceleration API (H.265 GPU Hardware)'},
      {value: 12, label: 'Video Acceleration API (AV1 GPU Hardware)'},
      {value: 13, label: 'Quick Sync Video (H.264 Intel Hardware)'},
      {value: 14, label: 'Quick Sync Video (H.265 Intel Hardware)'},
      {value: 15, label: 'Quick Sync Video (VP8 Intel Hardware)'},
      {value: 16, label: 'Quick Sync Video (VP9 Intel Hardware)'},
      {value: 17, label: 'Quick Sync Video (AV1 Intel Hardware)'},
      // {value: 18, label: 'Quick Sync Video (MPEG2 Intel Hardware)'},
      {value: 19, label: 'H.264 OpenMAX (Raspberry Pi)'}
    ];
  }


  public createDbTypes(): SelectOption[] {
    return [
      {value: 0, label: 'SQLite'},
      {value: 1, label: 'MongoDB'}
    ];
  }

  public createEmptySource(): SourceModel {
    return {
      // FFmpeg model starts
      id: '',
      address: '',
      rtsp_transport: 1, //TCP

      analyzation_duration: 1000000, // or set to 100000 if you are using RTSP and having stream issues.
      probe_size: 1000000, //or set to 100000 if you are using RTSP and having stream issues.
      input_frame_rate: 0,
      use_camera_timestamp: false,
      use_hwaccel: false,
      hwaccel_engine: 0,
      video_decoder: 0,
      hwaccel_device: '',

      stream_type: 0, //FLV
      ms_address: '',
      stream_video_codec: 3, // copy
      preset: 0,
      hls_time: 2,
      hls_list_size: 3,
      stream_quality: 0,
      stream_frame_rate: 0,
      stream_width: 0,
      stream_height: 0,
      stream_rotate: 0,
      stream_audio_codec: 4, // aac
      stream_audio_channel: 0,
      stream_audio_quality: 0,
      stream_audio_sample_rate: 0,
      stream_audio_volume: 100,

      record_file_type: 0, //MP4
      record_video_codec: 6, //copy
      record_quality: 0,
      record_preset: 0,
      record_frame_rate: 0,
      record_width: 0,
      record_height: 0,
      record_segment_interval: 15,
      record_rotate: 0,
      record_audio_codec: 4, //aac
      record_audio_channel: 0,
      record_audio_quality: 0,
      record_audio_sample_rate: 0,
      record_audio_volume: 100,

      log_level: 5, //Warning
      // FFmpeg model ends

      // Source model starts
      brand: '',
      name: '',
      description: '',

      mac_address: '',
      ip_address: '',

      enabled: true,
      state: 0, //NotStartedYet
      ms_type: 0, //Go 2 RTC

      snapshot_enabled: false,
      snapshot_frame_rate: 1,
      snapshot_width: 640,
      snapshot_height: 360,
      md_type: 1, // OpenCV
      md_opencv_threshold: 30,
      md_contour_area_limit: 10000,
      md_imagehash_threshold: 3,
      md_psnr_threshold: 0.2,

      ffmpeg_reader_frame_rate: 5,
      ffmpeg_reader_width: 640,
      ffmpeg_reader_height: 360,

      record_enabled: false,
      ai_clip_enabled: false,

      flv_player_type: 0, // 0 is MpegTsJs, 1 is FlvJs
      booster_enabled: false,
      live_buffer_latency_chasing: true,

      go2rtc_player_mode: 0, // 0 is MSE, 1 is WebRTC

      black_screen_check_enabled: false,
      created_at: '',
      root_dir_path: ''
      // Source model ends
    };
  }

  public createEmptyStream(): StreamModel {
    return {
      id: '',
      brand: '',
      name: '',
      address: '',

      ms_feeder_pid: 0,
      ms_feeder_args: '',
      hls_pid: 0,
      hls_args: '',
      created_at: '',

      ms_type: 0, //Go 2 RTC
      stream_type: 0, //FLV
      ms_initialized: false,
      ms_image_name: '',
      ms_container_name: '',
      ms_address: '',
      ms_stream_address: '',
      ms_container_ports: '',
      ms_container_commands: '',

      mp_ffmpeg_reader_owner_pid: 0,
      ffmpeg_reader_frame_rate: 1,
      ffmpeg_reader_width: 640,
      ffmpeg_reader_height: 360,

      record_enabled: false,
      record_pid: 0,
      record_args: '',
      record_duration: 900,

      snapshot_enabled: false,
      snapshot_pid: 0,
      snapshot_frame_rate: 1,
      snapshot_width: 1280,
      snapshot_height: 720,

      ai_clip_enabled: false,
      ai_clip_pid: 0,
      ai_clip_args: '',

      flv_player_type: 0, // 0 is MpegTsJs, 1 is FlvJs
      booster_enabled: false,
      live_buffer_latency_chasing: true,

      go2rtc_player_mode: 0, // 0 is MSE, 1 is WebRTC

      concat_demuxer_pid: 0,
      concat_demuxer_args: '',

      root_dir_path: ''
    };
  }

  public createEmptySmartVisionModel(): SmartVisionModel {
    return {
      id: '',
      brand: '',
      name: '',
      address: '',
      created_at: '',
      selected_list_json: '{"person":0.8}',
      zones_list: '',
      masks_list: '',
      start_time: '',
      end_time: ''
    };
  }

  public getCoco91Names() {
    return [{label: 'person', value: 0}, {label: 'bicycle', value: 1}, {
      label: 'car',
      value: 2
    }, {label: 'motorcycle', value: 3}, {label: 'airplane', value: 4}, {label: 'bus', value: 5}, {
      label: 'train',
      value: 6
    }, {label: 'truck', value: 7}, {label: 'boat', value: 8}, {
      label: 'traffic light',
      value: 9
    }, {label: 'fire hydrant', value: 10}, {label: 'street sign', value: 11}, {
      label: 'stop sign',
      value: 12
    }, {label: 'parking meter', value: 13}, {label: 'bench', value: 14}, {label: 'bird', value: 15}, {
      label: 'cat',
      value: 16
    }, {label: 'dog', value: 17}, {label: 'horse', value: 18}, {label: 'sheep', value: 19}, {
      label: 'cow',
      value: 20
    }, {label: 'elephant', value: 21}, {label: 'bear', value: 22}, {label: 'zebra', value: 23}, {
      label: 'giraffe',
      value: 24
    }, {label: 'hat', value: 25}, {label: 'backpack', value: 26}, {label: 'umbrella', value: 27}, {
      label: 'shoe',
      value: 28
    }, {label: 'eye glasses', value: 29}, {label: 'handbag', value: 30}, {
      label: 'tie',
      value: 31
    }, {label: 'suitcase', value: 32}, {label: 'frisbee', value: 33}, {
      label: 'skis',
      value: 34
    }, {label: 'snowboard', value: 35}, {label: 'sports ball', value: 36}, {
      label: 'kite',
      value: 37
    }, {label: 'baseball bat', value: 38}, {label: 'baseball glove', value: 39}, {
      label: 'skateboard',
      value: 40
    }, {label: 'surfboard', value: 41}, {label: 'tennis racket', value: 42}, {
      label: 'bottle',
      value: 43
    }, {label: 'plate', value: 44}, {label: 'wine glass', value: 45}, {label: 'cup', value: 46}, {
      label: 'fork',
      value: 47
    }, {label: 'knife', value: 48}, {label: 'spoon', value: 49}, {label: 'bowl', value: 50}, {
      label: 'banana',
      value: 51
    }, {label: 'apple', value: 52}, {label: 'sandwich', value: 53}, {
      label: 'orange',
      value: 54
    }, {label: 'broccoli', value: 55}, {label: 'carrot', value: 56}, {
      label: 'hot dog',
      value: 57
    }, {label: 'pizza', value: 58}, {label: 'donut', value: 59}, {label: 'cake', value: 60}, {
      label: 'chair',
      value: 61
    }, {label: 'couch', value: 62}, {label: 'potted plant', value: 63}, {
      label: 'bed',
      value: 64
    }, {label: 'mirror', value: 65}, {label: 'dining table', value: 66}, {
      label: 'window',
      value: 67
    }, {label: 'desk', value: 68}, {label: 'toilet', value: 69}, {label: 'door', value: 70}, {
      label: 'tv',
      value: 71
    }, {label: 'laptop', value: 72}, {label: 'mouse', value: 73}, {label: 'remote', value: 74}, {
      label: 'keyboard',
      value: 75
    }, {label: 'cell phone', value: 76}, {label: 'microwave', value: 77}, {
      label: 'oven',
      value: 78
    }, {label: 'toaster', value: 79}, {label: 'sink', value: 80}, {
      label: 'refrigerator',
      value: 81
    }, {label: 'blender', value: 82}, {label: 'book', value: 83}, {label: 'clock', value: 84}, {
      label: 'vase',
      value: 85
    }, {label: 'scissors', value: 86}, {label: 'teddy bear', value: 87}, {
      label: 'hair drier',
      value: 88
    }, {label: 'toothbrush', value: 89}, {label: 'hair brush', value: 90}];
  }

  public saveScreenshot(sourceId: string, base64Img: string) {
    sessionStorage.setItem(`ss${sourceId}`, base64Img);
  }

  public getScreenshot(sourceId: string): string {
    const base64 = sessionStorage.getItem(`ss${sourceId}`);
    if (!base64) {
      return '';
    }
    return base64;
  }

  public saveThumbnail(sourceId: string | null, base64Img: string) {
    if (!sourceId) {
      return;
    }
    sessionStorage.setItem(`thbnl${sourceId}`, base64Img);
  }

  public getThumbnail(sourceId: string | null): string {
    if (!sourceId) {
      return '';
    }
    const base64 = sessionStorage.getItem(`thbnl${sourceId}`);
    if (!base64) {
      return '';
    }
    return base64;
  }

  public createArchiveActionTypes(t: any): SelectOption[] {
    return [
      {value: 0, label: t('delete')},
      {value: 1, label: t('move_another_location')}
    ];
  }

  public createFlvPlayerTypes(t: any): SelectOption[] {
    return [
      {value: 0, label: `${t('low_latency')} ${t('player')}`},
      {value: 1, label: `${t('flv')} ${t('player')}`}
    ];
  }

  public createSourceStates(t: any): SelectOption[] {
    return [
      {value: 0, label: t('not_started_yet')},
      {value: 1, label: t('started')},
      {value: 2, label: t('stopped')}
    ];
  }

  public createMotionDetectionTypes(t: any): SelectOption[] {
    return [
      {value: 0, label: t('no_motion_detection')},
      {value: 1, label: 'Open CV'},
      {value: 2, label: t('image_hash')},
      {value: 3, label: 'PSNR'}
    ];
  }

  public createGo2RtcModes(t: any): SelectOption[] {
    return [
      {value: 0, label: t('mse')},
      {value: 1, label: t('webrtc')}
    ];
  }
}


export interface SelectOption {
  value: any;
  label: string;
}

export enum Themes {
  Light = 0,
  Dark = 1
}

import {isNullOrEmpty} from 'src/utils/utils';
import {SourceModel} from 'src/utils/models/source_model';
import {StreamModel} from 'src/utils/models/stream_model';
import {OdModel} from 'src/utils/models/od_model';
import {User} from 'src/utils/models/user_model';
import {NodeRepository} from 'src/utils/db';
import {Node} from 'src/utils/entities';
import {GalleryLocationsService} from 'src/utils/services/gallery_locations_service';

export class LocalService {

  private readonly rep: NodeRepository = new NodeRepository();

  public getHlsAddress(nodeIp: string, nodePort: number, sourceId: string) {
    return `${this.nodeHttpProtocol}://${nodeIp}:${nodePort}/livestream/${sourceId}/stream.m3u8`;
  }

  get hubHttpProtocol(): string {
    return 'http';
  }

  //todo: move to the config(Redis)
  get hubIP(): string {
    return 'localhost';
  }

  get hubPort(): string {
    return '7242';
  }

  public getHubAddress(route: string): string {
    return `${this.hubHttpProtocol}://${this.hubIP}:${this.hubPort}/${route}`;
  }

  get nodeHttpProtocol(): string {
    return 'http';
  }

  async getNodeIP(): Promise<string> {
    const node = await this.rep.getActiveNode();
    if (node) {
      return node.node_address;
    }
    return '';
  }

  async getNodePort(): Promise<number> {
    const node = await this.rep.getActiveNode();
    if (node) {
      return node.node_port;
    }
    return 8072;
  }

  public async getNodeAddress(route: string): Promise<string> {
    const nodeIp = await this.getNodeIP();
    const nodePort = await this.getNodePort();
    if (isNullOrEmpty(route))
      return `${this.nodeHttpProtocol}://${nodeIp}:${nodePort}`;
    return `${this.nodeHttpProtocol}://${nodeIp}:${nodePort}/${route}`;
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

  public createGalleryLocationService(): GalleryLocationsService {
    return new GalleryLocationsService(this);
  }

  public createRtspTransport(): SelectOption[] {
    return [
      {value: 0, label: 'Auto'},
      {value: 1, label: 'TCP'},
      {value: 2, label: 'UDP'},
      {value: 3, label: 'HTTP'}
    ];
  }

  public createLogLevels(t: any): SelectOption[] {
    return [
      {value: 0, label: t('none')},
      {value: 1, label: t('quiet')},
      {value: 2, label: t('panic')},
      {value: 3, label: t('fatal')},
      {value: 4, label: t('error')},
      {value: 5, label: t('warning')},
      {value: 6, label: t('info')},
      {value: 7, label: t('verbose')},
      {value: 8, label: t('debug')},
      {value: 9, label: t('trace')}
    ];
  }

  public createAccelerationEngines(): SelectOption[] {
    return [
      {value: 0, label: 'Auto'},
      {value: 1, label: 'vdpau'},
      {value: 2, label: 'cuda (NVIDIA NVENC)'},
      {value: 3, label: 'vaapi (VA-API)'},
      {value: 4, label: 'DRM object sharing'},
      {value: 5, label: 'OpenCL'},
      {value: 6, label: 'cuvid (NVIDIA NVENC)'}
    ];
  }

  public createVideoDecoders(): SelectOption[] {
    return [
      {value: 0, label: 'Auto'},
      {value: 1, label: 'NVIDIA H.264 CUVID'},
      // {value: 2, label: 'NVIDIA H.265 CUVID'},
      // {value: 3, label: 'NVIDIA MJPEG CUVID'},
      // {value: 4, label: 'NVIDIA MPEG4 CUVID'},
      {value: 5, label: 'Quick Sync Video H.264'},
      // {value: 6, label: 'Quick Sync Video H.265'},
      // {value: 7, label: 'Quick Sync Video MPEG2'},
      {value: 8, label: 'Raspberry Pi H.264'},
      // {value: 9, label: 'Raspberry Pi MPEG-2'},
      // {value: 10, label: 'Raspberry Pi MPEG-4'}
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
      {value: 1, label: 'libx264'},
      // {value: 2, label: 'libx265'},
      {value: 3, label: 'copy'},
      {value: 4, label: 'H.264 VA-API (Intel HW Accel)'},
      // {value: 5, label: 'H.265 VA-API (Intel HW Accel)'},
      {value: 6, label: 'H.264 NVENC (NVIDIA HW Accel)'},
      // {value: 7, label: 'H.265 NVENC (NVIDIA HW Accel)'},
      {value: 8, label: 'H.264 (Quick Sync Video)'},
      // {value: 9, label: 'H.265 (Quick Sync Video)'},
      // {value: 10, label: 'MPEG2 (Quick Sync Video)'},
      {value: 11, label: 'H.264 openMAX (Raspberry Pi)'},
      // {value: 12, label: 'AV1'},
      // {value: 13, label: 'VP8'},
      // {value: 14, label: 'VP9'}
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

  public createRotations(t: any): SelectOption[] {
    return [
      {value: 0, label: t('no_rotation')},
      {value: 1, label: '180 ' + t('degrees')},
      {value: 2, label: '90 ' + t('vertical_flip')},
      {value: 3, label: '90 ' + t('clockwise')},
      {value: 4, label: '90 ' + t('clockwise_and_vertical_flip')},
      {value: 5, label: '90 ' + t('counter')}
    ];
  }

  public createAudioCodecs(): SelectOption[] {
    return [
      {value: 0, label: 'No Audio'},
      {value: 1, label: 'Vorbis'},
      {value: 2, label: 'Opus'},
      {value: 3, label: 'MP3LAME'},
      {value: 4, label: 'AAC'},
      {value: 5, label: 'AC3'},
      {value: 6, label: 'DTS'},
      {value: 7, label: 'ALAC'},
      {value: 8, label: 'copy'}
    ];
  }

  public createRtmpServerTypes(): SelectOption[] {
    return [
      {value: 0, label: 'SRS'},
      {value: 1, label: 'SRS Realtime'},
      {value: 2, label: 'LiveGo'},
      {value: 3, label: 'Node Media Server'}
    ];
  }

  public createAudioChannels(): SelectOption[] {
    return [
      {value: 0, label: 'Source'},
      {value: 1, label: 'Mono'},
      {value: 2, label: 'Stereo'},
      {value: 9, label: '5.1'}
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
      {value: 2, label: '11.025k'},
      {value: 3, label: '12k'},
      {value: 4, label: '16k'},
      {value: 3, label: '22.05k'},
      {value: 3, label: '24k'},
      {value: 3, label: '32k'},
      {value: 3, label: '44.1k'},
      {value: 3, label: '48k'}
    ];
  }

  public createRecordFileTypes(): SelectOption[] {
    return [
      {value: 0, label: 'MP4'},
      // {value: 1, label: 'WebM'},
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
      // {value: 1, label: 'libvpx (WebM Default)'},
      // {value: 2, label: 'libvpx-vp9 (WebM VP9)'},
      // {value: 3, label: 'libx265 (MP4)'},
      {value: 4, label: 'libx264 (MP4 Default)'},
      {value: 5, label: 'copy'},
      {value: 6, label: 'H.264 VA-API (MP4 Intel HW Accel)'},
      // {value: 7, label: 'H.c265 VA-API (MP4 Intel HW Accel)'},
      {value: 8, label: 'H.264 NVENC (MP4 NVIDIA HW Accel)'},
      // {value: 9, label: 'H.265 NVENC (MP4 NVIDIA HW Accel)'},
      {value: 10, label: 'H.264 (MP4 Quick Sync Video)'},
      // {value: 11, label: 'H.265 (MP4 Quick Sync Video)'},
      // {value: 12, label: 'MPEG2 (MP4 Quick Sync Video)'},
      {value: 13, label: 'H.264 OpenMAX (MP4 Raspberry Pi)'},
      // {value: 14, label: 'VP8 NVENC (WebM NVIDIA HW Accel)'},
      // {value: 15, label: 'VP9 NVENC (WebM NVIDIA HW Accel)'},
      // {value: 16, label: 'VP8 (WebM Quick Sync Video)'}
    ];
  }

  public createSnapshotTypes(): SelectOption[] {
    return [
      {value: 0, label: 'Standard'},
      {value: 1, label: 'OpenCVPersistent'},
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
      rtmp_address: '',
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
      record_video_codec: 5, //copy
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
      rtmp_server_type: 1, //SRS Realtime

      snapshot_enabled: false,
      snapshot_type: 0, // 0 is FFmpeg, 1 is OpenCV Persistent
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

      created_at: ''
      // Source model ends
    };
  }

  public createEmptyStream(): StreamModel {
    return {
      id: '',
      brand: '',
      name: '',
      address: '',

      rtmp_feeder_pid: 0,
      rtmp_feeder_args: '',
      hls_pid: 0,
      hls_args: '',
      created_at: '',

      stream_type: 0, //FLV
      rtmp_server_initialized: false,
      rtmp_server_type: 0, //SRS
      rtmp_image_name: '',
      rtmp_container_name: '',
      rtmp_address: '',
      rtmp_flv_address: '',
      rtmp_container_ports: '',
      rtmp_container_commands: '',

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
      snapshot_type: 0, // 0 is FFmpeg, 1 is OpenCV Persistent
      snapshot_frame_rate: 1,
      snapshot_width: 1280,
      snapshot_height: 720,

      ai_clip_enabled: false,
      ai_clip_pid: 0,
      ai_clip_args: '',

      flv_player_type: 0, // 0 is MpegTsJs, 1 is FlvJs
      booster_enabled: false,

      concat_demuxer_pid: 0,
      concat_demuxer_args: ''
    };
  }

  public createEmptyOd(): OdModel {
    return {
      id: '',
      brand: '',
      name: '',
      address: '',
      created_at: '',
      threshold_list: '0.1',
      selected_list: '0',
      zones_list: '',
      masks_list: '',
      start_time: '',
      end_time: ''
    };
  }

  public getCoco80Names() {
    return [{label: 'person', value: 0}, {label: 'bicycle', value: 1}, {
      label: 'car',
      value: 2
    }, {label: 'motorbike', value: 3}, {label: 'aeroplane', value: 4}, {label: 'bus', value: 5}, {
      label: 'train',
      value: 6
    }, {label: 'truck', value: 7}, {label: 'boat', value: 8}, {
      label: 'traffic light',
      value: 9
    }, {label: 'fire hydrant', value: 10}, {label: 'stop sign', value: 11}, {
      label: 'parking meter',
      value: 12
    }, {label: 'bench', value: 13}, {label: 'bird', value: 14}, {label: 'cat', value: 15}, {
      label: 'dog',
      value: 16
    }, {label: 'horse', value: 17}, {label: 'sheep', value: 18}, {label: 'cow', value: 19}, {
      label: 'elephant',
      value: 20
    }, {label: 'bear', value: 21}, {label: 'zebra', value: 22}, {
      label: 'giraffe',
      value: 23
    }, {label: 'backpack', value: 24}, {label: 'umbrella', value: 25}, {
      label: 'handbag',
      value: 26
    }, {label: 'tie', value: 27}, {label: 'suitcase', value: 28}, {label: 'frisbee', value: 29}, {
      label: 'skis',
      value: 30
    }, {label: 'snowboard', value: 31}, {label: 'sports ball', value: 32}, {
      label: 'kite',
      value: 33
    }, {label: 'baseball bat', value: 34}, {label: 'baseball glove', value: 35}, {
      label: 'skateboard',
      value: 36
    }, {label: 'surfboard', value: 37}, {label: 'tennis racket', value: 38}, {
      label: 'bottle',
      value: 39
    }, {label: 'wine glass', value: 40}, {label: 'cup', value: 41}, {label: 'fork', value: 42}, {
      label: 'knife',
      value: 43
    }, {label: 'spoon', value: 44}, {label: 'bowl', value: 45}, {label: 'banana', value: 46}, {
      label: 'apple',
      value: 47
    }, {label: 'sandwich', value: 48}, {label: 'orange', value: 49}, {
      label: 'broccoli',
      value: 50
    }, {label: 'carrot', value: 51}, {label: 'hot dog', value: 52}, {label: 'pizza', value: 53}, {
      label: 'donut',
      value: 54
    }, {label: 'cake', value: 55}, {label: 'chair', value: 56}, {
      label: 'sofa',
      value: 57
    }, {label: 'pottedplant', value: 58}, {label: 'bed', value: 59}, {
      label: 'diningtable',
      value: 60
    }, {label: 'toilet', value: 61}, {label: 'tvmonitor', value: 62}, {
      label: 'laptop',
      value: 63
    }, {label: 'mouse', value: 64}, {label: 'remote', value: 65}, {
      label: 'keyboard',
      value: 66
    }, {label: 'cell phone', value: 67}, {label: 'microwave', value: 68}, {
      label: 'oven',
      value: 69
    }, {label: 'toaster', value: 70}, {label: 'sink', value: 71}, {
      label: 'refrigerator',
      value: 72
    }, {label: 'book', value: 73}, {label: 'clock', value: 74}, {label: 'vase', value: 75}, {
      label: 'scissors',
      value: 76
    }, {label: 'teddy bear', value: 77}, {label: 'hair drier', value: 78}, {label: 'toothbrush', value: 79}];
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

  public createEmptyNode(): Node {
    return {
      name: '',
      node_port: 8072,
      node_address: '',
      description: '',
      active: false
    };
  }

  public createDeepStackPerformanceModes(): SelectOption[] {
    return [
      {value: 0, label: 'Low'},
      {value: 1, label: 'Medium'},
      {value: 2, label: 'High'}
    ];
  }

  public createDeepStackDockerTypes(): SelectOption[] {
    return [
      {value: 0, label: 'CPU'},
      {value: 1, label: 'GPU'},
      {value: 2, label: 'NVIDIA JETSON'},
      {value: 3, label: 'ARM64'},
      {value: 4, label: 'ARM64_SERVER'}
    ];
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

  public createMotionDetectionTypes(t: any): SelectOption[]{
    return [
      {value: 0, label: t('no_motion_detection')},
      {value: 1, label: 'Open CV'},
      {value: 2, label: t('image_hash')},
      {value: 3, label: t('PSNR')}
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

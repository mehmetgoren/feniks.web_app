import { Node } from 'src/utils/entities';
import { isNullEmpty, isNullOrUndefined, NodeMngrAddress } from 'src/utils/utils';
import { SourceModel } from 'src/utils/models/source_model';
import { StreamModel } from 'src/utils/models/stream_model';

export class LocalService {

  public saveGsLocation(sourceId: string, option: GsLocation) {
    if (isNullEmpty(sourceId) || isNullOrUndefined(option))
      return;
    localStorage.setItem(sourceId, JSON.stringify(option));
  }

  public getGsLocation(sourceId: string): GsLocation | null {
    const json = localStorage.getItem(sourceId);
    if (json) {
      return JSON.parse(json);
    }
    return null;
  }

  public deleteGsLocation(sourceId: string) {
    localStorage.removeItem(sourceId);
  }

  public getVideoAddress() {
    return `http://${NodeMngrAddress}/livestream`;
  }

  public getActiveTab(): Node | null {
    const json = sessionStorage.getItem('setActiveTab');
    if (json) {
      return JSON.parse(json);
    }
    return null;
  }

  public setActiveTab(node: Node) {
    sessionStorage.setItem('setActiveTab', JSON.stringify(node));
  }

  public createInputType(): SelectOption[] {
    return [
      { value: 0, label: 'H.264 / H.265 / H.265+' },
      { value: 1, label: 'MPEG4' },
      { value: 2, label: 'HLS' }
    ];
  }

  public createRtspTransport(): SelectOption[] {
    return [
      { value: 0, label: 'Auto' },
      { value: 1, label: 'TCP' },
      { value: 2, label: 'UDP' },
      { value: 3, label: 'HTTP' }
    ];
  }

  public createLogLevels(): SelectOption[] {
    return [
      { value: 0, label: 'None' },
      { value: 1, label: 'Quiet' },
      { value: 2, label: 'Panic' },
      { value: 3, label: 'Fatal' },
      { value: 4, label: 'Error' },
      { value: 5, label: 'Warning' },
      { value: 6, label: 'Info' },
      { value: 7, label: 'Verbose' },
      { value: 8, label: 'Debug' },
      { value: 9, label: 'Trace' }
    ];
  }

  public createAccelerationEngines(): SelectOption[] {
    return [
      { value: 0, label: 'Auto' },
      { value: 1, label: 'vdpau' },
      { value: 2, label: 'cuda (NVIDIA NVENC)' },
      { value: 3, label: 'vaapi (VA-API)' },
      { value: 4, label: 'DRM object sharing' },
      { value: 5, label: 'OpenCL' },
      { value: 6, label: 'cuvid (NVIDIA NVENC)' }
    ];
  }

  public createVideoDecoders(): SelectOption[] {
    return [
      { value: 0, label: 'Auto' },
      { value: 1, label: 'NVIDIA H.264 CUVID' },
      { value: 2, label: 'NVIDIA H.265 CUVID' },
      { value: 3, label: 'NVIDIA MJPEG CUVID' },
      { value: 4, label: 'NVIDIA MPEG4 CUVID' },
      { value: 5, label: 'Quick Sync Video H.264' },
      { value: 6, label: 'Quick Sync Video H.265' },
      { value: 7, label: 'Quick Sync Video MPEG2' },
      { value: 8, label: 'Raspberry Pi H.264' },
      { value: 9, label: 'Raspberry Pi MPEG-2' },
      { value: 10, label: 'Raspberry Pi MPEG-4' }
    ];
  }

  public createStreamTypes(): SelectOption[] {
    return [
      { value: 0, label: 'HLS' },
      { value: 1, label: 'FLV' },
      { value: 2, label: 'Direct Read' }
    ];
  }

  public createStreamVideoCodecs(): SelectOption[] {
    return [
      { value: 0, label: 'Auto' },
      { value: 1, label: 'libx264' },
      { value: 2, label: 'libx265' },
      { value: 3, label: 'copy' },
      { value: 4, label: 'H.264 VA-API (Intel HW Accel)' },
      { value: 5, label: 'H.265 VA-API (Intel HW Accel)' },
      { value: 6, label: 'H.264 NVENC (NVIDIA HW Accel)' },
      { value: 7, label: 'H.265 NVENC (NVIDIA HW Accel)' },
      { value: 8, label: 'H.264 (Quick Sync Video)' },
      { value: 9, label: 'H.265 (Quick Sync Video)' },
      { value: 10, label: 'MPEG2 (Quick Sync Video)' },
      { value: 11, label: 'H.264 openMAX (Raspberry Pi)' },
      { value: 12, label: 'AV1' },
      { value: 13, label: 'VP8' },
      { value: 14, label: 'VP9' }
    ];
  }

  public createPresets(): SelectOption[] {
    return [
      { value: 0, label: 'Auto' },
      { value: 1, label: 'Ultra Fast' },
      { value: 2, label: 'Super Fast' },
      { value: 3, label: 'Very Fast' },
      { value: 4, label: 'Faster' },
      { value: 5, label: 'Fast' },
      { value: 6, label: 'Medium' },
      { value: 7, label: 'Slow' },
      { value: 8, label: 'Slower' },
      { value: 9, label: 'Very Slow' },
      { value: 10, label: 'Placebo' }
    ];
  }

  public createRotations(): SelectOption[] {
    return [
      { value: 0, label: 'No Rotation' },
      { value: 1, label: '180 Degrees' },
      { value: 2, label: '90 Counter Clockwise and Vertical Flip (default)' },
      { value: 3, label: '90 Clockwise' },
      { value: 4, label: '90 Clockwise and Vertical Flip' },
      { value: 5, label: '90 Counter' }
    ];
  }

  public createStreamAudioCodecs(): SelectOption[] {
    return [
      { value: 0, label: 'Auto' },
      { value: 1, label: 'No Audio' },
      { value: 2, label: 'Vorbis' },
      { value: 3, label: 'Opus' },
      { value: 4, label: 'MP3LAME' },
      { value: 5, label: 'AAC' },
      { value: 6, label: 'AC3' },
      { value: 7, label: 'DTS' },
      { value: 8, label: 'ALAC' },
      { value: 9, label: 'copy' }
    ];
  }

  public createRtmpServerTypes(): SelectOption[] {
    return [
      { value: 0, label: 'SRS' },
      { value: 1, label: 'LiveGo' },
      { value: 2, label: 'Node Media Server' }
    ];
  }

  public createFlvPlayerConnectionTypes(): SelectOption[] {
    return [
      { value: 0, label: 'HTTP' },
      { value: 1, label: 'Websocket' }
    ];
  }

  public createAudioChannels(): SelectOption[] {
    return [
      { value: 0, label: 'Source' },
      { value: 1, label: 'Mono' },
      { value: 2, label: 'Stereo' },
      { value: 9, label: '5.1' }
    ];
  }

  public createAudioQualities(): SelectOption[] {
    return [
      { value: 0, label: 'Auto' },
      { value: 1, label: '400' },
      { value: 2, label: '320' },
      { value: 3, label: '256' },
      { value: 4, label: '224' },
      { value: 5, label: '192' },
      { value: 6, label: '160' },
      { value: 7, label: '128' },
      { value: 8, label: '96' },
      { value: 9, label: 'Mute' }
    ];
  }

  public createAudioSampleRates(): SelectOption[] {
    return [
      { value: 0, label: 'Auto' },
      { value: 1, label: '7.35k' },
      { value: 2, label: '8k' },
      { value: 2, label: '11.025k' },
      { value: 3, label: '12k' },
      { value: 4, label: '16k' },
      { value: 3, label: '22.05k' },
      { value: 3, label: '24k' },
      { value: 3, label: '32k' },
      { value: 3, label: '44.1k' },
      { value: 3, label: '48k' }
    ];
  }

  public createRecordFileTypes(): SelectOption[] {
    return [
      { value: 0, label: 'MP4' },
      { value: 1, label: 'WebM' },
      { value: 2, label: 'FLV' },
      { value: 3, label: 'MKV' },
      { value: 4, label: 'AVI' },
      { value: 5, label: 'MPG' },
      { value: 6, label: 'OGV' }
    ];
  }

  public createRecordVideoCodecs(): SelectOption[] {
    return [
      { value: 0, label: 'Auto' },
      { value: 1, label: 'libvpx (WebM Default)' },
      { value: 2, label: 'libvpx-vp9 (WebM VP9)' },
      { value: 3, label: 'libx265 (MP4)' },
      { value: 4, label: 'libx264 (MP4 Default)' },
      { value: 5, label: 'copy' },
      { value: 6, label: 'H.264 VA-API (MP4 Intel HW Accel)' },
      { value: 7, label: 'H.c265 VA-API (MP4 Intel HW Accel)' },
      { value: 8, label: 'H.264 NVENC (MP4 NVIDIA HW Accel)' },
      { value: 9, label: 'H.265 NVENC (MP4 NVIDIA HW Accel)' },
      { value: 10, label: 'H.264 (MP4 Quick Sync Video)' },
      { value: 11, label: 'H.265 (MP4 Quick Sync Video)' },
      { value: 12, label: 'MPEG2 (MP4 Quick Sync Video)' },
      { value: 13, label: 'H.264 OpenMAX (MP4 Raspberry Pi)' },
      { value: 14, label: 'VP8 NVENC (WebM NVIDIA HW Accel)' },
      { value: 15, label: 'VP9 NVENC (WebM NVIDIA HW Accel)' },
      { value: 16, label: 'VP8 (WebM Quick Sync Video)' }
    ];
  }

  public createRecordAudioCodecs(): SelectOption[] {
    return [
      { value: 0, label: 'Auto' },
      { value: 1, label: 'No Audio' },
      { value: 2, label: 'Vorbis (WebM Default)' },
      { value: 3, label: 'Opus (WebM)' },
      { value: 4, label: 'MP3LAME (MP4)' },
      { value: 5, label: 'AAC (MP4 Default)' },
      { value: 6, label: 'AC3 (MP4)' },
      { value: 7, label: 'DTS' },
      { value: 8, label: 'ALAC' },
      { value: 9, label: 'copy' }
    ];
  }

  public createEmptySource(): SourceModel {
    return {
      enabled: true,
      id: '',
      brand: '',
      name: '',
      description: '',
      record: false,

      rtsp_address: '',
      input_type: 0,
      rtsp_transport: 0,
      analyzation_duration: 1000000, // or set to 100000 if you are using RTSP and having stream issues.
      probe_size: 1000000, //or set to 100000 if you are using RTSP and having stream issues.
      input_frame_rate: 0,
      use_camera_timestamp: false,
      use_hwaccel: false,
      hwaccel_engine: 0,
      video_decoder: 0,
      hwaccel_device: '',

      stream_type: 0,
      rtmp_server_type: 1,
      flv_player_connection_type: 0,
      rtmp_server_address: '',
      need_reload_interval: 300,
      direct_read_frame_rate: 1,
      direct_read_width: 640,
      direct_read_height: 360,
      stream_video_codec: 3, // copy
      stream_audio_codec: 9, // copy
      stream_audio_channel: 0,
      stream_audio_quality: 0,
      stream_audio_sample_rate: 0,
      stream_audio_volume: 100,
      hls_time: 2,
      hls_list_size: 3,
      hls_preset: 0,
      stream_quality: 0,
      stream_frame_rate: 0,
      stream_width: 0,
      stream_height: 0,
      stream_rotate: 0,

      jpeg_enabled: false,
      jpeg_frame_rate: 1,
      jpeg_use_vsync: false,
      jpeg_quality: 2, // 2-31. lower value is better.
      jpeg_width: 1280,
      jpeg_height: 720,
      use_disk_image_reader_service: false,

      record_file_type: 0,
      record_video_codec: 5,
      record_quality: 0,
      record_preset: 0,
      record_frame_rate: 0,
      record_width: 0,
      record_height: 0,
      record_segment_interval: 15,
      record_rotate: 0,
      record_audio_codec: 9,
      record_audio_channel: 0,
      record_audio_quality: 0,
      record_audio_sample_rate: 0,
      record_audio_volume: 100,

      log_level: 5 //Warning
    };
  }

  public createEmptyStream(): StreamModel {
    return {
      id: '',
      brand: '',
      name: '',
      rtsp_address: '',
      pid: -1,
      created_at: '',
      args: '',
      failed_count: 0,
      stream_type: 0,
      rtmp_server_initialized: false,
      rtmp_server_type: 0,
      flv_player_connection_type: 0,
      need_reload_interval: 0,
      rtmp_image_name: '',
      rtmp_container_name: '',
      rtmp_address: '',
      rtmp_flv_address: '',
      rtmp_container_ports: '',
      rtmp_container_commands: '',
      record: false,
      record_duration: 900,
      hls_output_path: '',
      read_jpeg_output_path: '',
      record_output_folder_path: ''
    };
  }
}


export interface SelectOption {
  value: any;
  label: string;
}

export interface GsLocation {
  w: number;
  h: number;
  x: number;
  y: number;
}

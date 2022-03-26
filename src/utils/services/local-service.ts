import { Node } from 'src/utils/entities';
import { isNullEmpty, isNullOrUndefined, NodeMngrAddress } from 'src/utils/utils';
import { SourceModel } from 'src/utils/models/source_model';
import { StreamModel } from 'src/utils/models/stream_model';
import { OdModel } from 'src/utils/models/od_model';

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
      { value: 0, label: 'FLV' },
      { value: 1, label: 'FFmpeg Reader' },
      { value: 2, label: 'HLS' },
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

  public createAudioCodecs(): SelectOption[] {
    return [
      { value: 0, label: 'No Audio' },
      { value: 1, label: 'Vorbis' },
      { value: 2, label: 'Opus' },
      { value: 3, label: 'MP3LAME' },
      { value: 4, label: 'AAC' },
      { value: 5, label: 'AC3' },
      { value: 6, label: 'DTS' },
      { value: 7, label: 'ALAC' },
      { value: 8, label: 'copy' }
    ];
  }

  public createRtmpServerTypes(): SelectOption[] {
    return [
      { value: 0, label: 'SRS' },
      { value: 1, label: 'LiveGo' },
      { value: 2, label: 'Node Media Server' }
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

  public createEmptySource(): SourceModel {
    return {
      // FFmpeg model starts
      id: '',
      address: '',
      record_enabled: false,
      rtsp_transport: 0,

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
      stream_audio_codec: 8, // copy
      stream_audio_channel: 0,
      stream_audio_quality: 0,
      stream_audio_sample_rate: 0,
      stream_audio_volume: 100,

      record_file_type: 0,
      record_video_codec: 5, //copy
      record_quality: 0,
      record_preset: 0,
      record_frame_rate: 0,
      record_width: 0,
      record_height: 0,
      record_segment_interval: 15,
      record_rotate: 0,
      record_audio_codec: 8, //copy
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

      enabled: true,
      rtmp_server_type: 1, //LIVEGO

      snapshot_enabled: false,
      snapshot_frame_rate: 1,
      snapshot_width: 640,
      snapshot_height: 360,

      ffmpeg_reader_frame_rate: 1,
      ffmpeg_reader_width: 640,
      ffmpeg_reader_height: 360,

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
      rtmp_server_type: 1, //LIVEGO
      rtmp_image_name: '',
      rtmp_container_name: '',
      rtmp_address: '',
      rtmp_flv_address: '',
      rtmp_container_ports: '',
      rtmp_container_commands: '',

      ffmpeg_reader_pid: 0,
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

      hls_output_path: '',
      record_output_folder_path: ''
    };
  }

  public createEmptyOd(): OdModel{
    return {
      id: '',
      brand: '',
      name: '',
      address: '',
      created_at: '',
      threshold_list: '0.1',
      selected_list: '0',
      mask: '',
      zone: ''
    };
  }

  public getCoco80Names() {
    return [{ label: 'person', value: 0 }, { label: 'bicycle', value: 1 }, {
      label: 'car',
      value: 2
    }, { label: 'motorbike', value: 3 }, { label: 'aeroplane', value: 4 }, { label: 'bus', value: 5 }, {
      label: 'train',
      value: 6
    }, { label: 'truck', value: 7 }, { label: 'boat', value: 8 }, {
      label: 'traffic light',
      value: 9
    }, { label: 'fire hydrant', value: 10 }, { label: 'stop sign', value: 11 }, {
      label: 'parking meter',
      value: 12
    }, { label: 'bench', value: 13 }, { label: 'bird', value: 14 }, { label: 'cat', value: 15 }, {
      label: 'dog',
      value: 16
    }, { label: 'horse', value: 17 }, { label: 'sheep', value: 18 }, { label: 'cow', value: 19 }, {
      label: 'elephant',
      value: 20
    }, { label: 'bear', value: 21 }, { label: 'zebra', value: 22 }, {
      label: 'giraffe',
      value: 23
    }, { label: 'backpack', value: 24 }, { label: 'umbrella', value: 25 }, {
      label: 'handbag',
      value: 26
    }, { label: 'tie', value: 27 }, { label: 'suitcase', value: 28 }, { label: 'frisbee', value: 29 }, {
      label: 'skis',
      value: 30
    }, { label: 'snowboard', value: 31 }, { label: 'sports ball', value: 32 }, {
      label: 'kite',
      value: 33
    }, { label: 'baseball bat', value: 34 }, { label: 'baseball glove', value: 35 }, {
      label: 'skateboard',
      value: 36
    }, { label: 'surfboard', value: 37 }, { label: 'tennis racket', value: 38 }, {
      label: 'bottle',
      value: 39
    }, { label: 'wine glass', value: 40 }, { label: 'cup', value: 41 }, { label: 'fork', value: 42 }, {
      label: 'knife',
      value: 43
    }, { label: 'spoon', value: 44 }, { label: 'bowl', value: 45 }, { label: 'banana', value: 46 }, {
      label: 'apple',
      value: 47
    }, { label: 'sandwich', value: 48 }, { label: 'orange', value: 49 }, {
      label: 'broccoli',
      value: 50
    }, { label: 'carrot', value: 51 }, { label: 'hot dog', value: 52 }, { label: 'pizza', value: 53 }, {
      label: 'donut',
      value: 54
    }, { label: 'cake', value: 55 }, { label: 'chair', value: 56 }, {
      label: 'sofa',
      value: 57
    }, { label: 'pottedplant', value: 58 }, { label: 'bed', value: 59 }, {
      label: 'diningtable',
      value: 60
    }, { label: 'toilet', value: 61 }, { label: 'tvmonitor', value: 62 }, {
      label: 'laptop',
      value: 63
    }, { label: 'mouse', value: 64 }, { label: 'remote', value: 65 }, {
      label: 'keyboard',
      value: 66
    }, { label: 'cell phone', value: 67 }, { label: 'microwave', value: 68 }, {
      label: 'oven',
      value: 69
    }, { label: 'toaster', value: 70 }, { label: 'sink', value: 71 }, {
      label: 'refrigerator',
      value: 72
    }, { label: 'book', value: 73 }, { label: 'clock', value: 74 }, { label: 'vase', value: 75 }, {
      label: 'scissors',
      value: 76
    }, { label: 'teddy bear', value: 77 }, { label: 'hair drier', value: 78 }, { label: 'toothbrush', value: 79 }];
  }

  public getCoco91Names() {
    return [{ label: 'person', value: 0 }, { label: 'bicycle', value: 1 }, {
      label: 'car',
      value: 2
    }, { label: 'motorcycle', value: 3 }, { label: 'airplane', value: 4 }, { label: 'bus', value: 5 }, {
      label: 'train',
      value: 6
    }, { label: 'truck', value: 7 }, { label: 'boat', value: 8 }, {
      label: 'traffic light',
      value: 9
    }, { label: 'fire hydrant', value: 10 }, { label: 'street sign', value: 11 }, {
      label: 'stop sign',
      value: 12
    }, { label: 'parking meter', value: 13 }, { label: 'bench', value: 14 }, { label: 'bird', value: 15 }, {
      label: 'cat',
      value: 16
    }, { label: 'dog', value: 17 }, { label: 'horse', value: 18 }, { label: 'sheep', value: 19 }, {
      label: 'cow',
      value: 20
    }, { label: 'elephant', value: 21 }, { label: 'bear', value: 22 }, { label: 'zebra', value: 23 }, {
      label: 'giraffe',
      value: 24
    }, { label: 'hat', value: 25 }, { label: 'backpack', value: 26 }, { label: 'umbrella', value: 27 }, {
      label: 'shoe',
      value: 28
    }, { label: 'eye glasses', value: 29 }, { label: 'handbag', value: 30 }, {
      label: 'tie',
      value: 31
    }, { label: 'suitcase', value: 32 }, { label: 'frisbee', value: 33 }, {
      label: 'skis',
      value: 34
    }, { label: 'snowboard', value: 35 }, { label: 'sports ball', value: 36 }, {
      label: 'kite',
      value: 37
    }, { label: 'baseball bat', value: 38 }, { label: 'baseball glove', value: 39 }, {
      label: 'skateboard',
      value: 40
    }, { label: 'surfboard', value: 41 }, { label: 'tennis racket', value: 42 }, {
      label: 'bottle',
      value: 43
    }, { label: 'plate', value: 44 }, { label: 'wine glass', value: 45 }, { label: 'cup', value: 46 }, {
      label: 'fork',
      value: 47
    }, { label: 'knife', value: 48 }, { label: 'spoon', value: 49 }, { label: 'bowl', value: 50 }, {
      label: 'banana',
      value: 51
    }, { label: 'apple', value: 52 }, { label: 'sandwich', value: 53 }, {
      label: 'orange',
      value: 54
    }, { label: 'broccoli', value: 55 }, { label: 'carrot', value: 56 }, {
      label: 'hot dog',
      value: 57
    }, { label: 'pizza', value: 58 }, { label: 'donut', value: 59 }, { label: 'cake', value: 60 }, {
      label: 'chair',
      value: 61
    }, { label: 'couch', value: 62 }, { label: 'potted plant', value: 63 }, {
      label: 'bed',
      value: 64
    }, { label: 'mirror', value: 65 }, { label: 'dining table', value: 66 }, {
      label: 'window',
      value: 67
    }, { label: 'desk', value: 68 }, { label: 'toilet', value: 69 }, { label: 'door', value: 70 }, {
      label: 'tv',
      value: 71
    }, { label: 'laptop', value: 72 }, { label: 'mouse', value: 73 }, { label: 'remote', value: 74 }, {
      label: 'keyboard',
      value: 75
    }, { label: 'cell phone', value: 76 }, { label: 'microwave', value: 77 }, {
      label: 'oven',
      value: 78
    }, { label: 'toaster', value: 79 }, { label: 'sink', value: 80 }, {
      label: 'refrigerator',
      value: 81
    }, { label: 'blender', value: 82 }, { label: 'book', value: 83 }, { label: 'clock', value: 84 }, {
      label: 'vase',
      value: 85
    }, { label: 'scissors', value: 86 }, { label: 'teddy bear', value: 87 }, {
      label: 'hair drier',
      value: 88
    }, { label: 'toothbrush', value: 89 }, { label: 'hair brush', value: 90 }];
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

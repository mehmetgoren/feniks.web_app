export interface Node {
  node_address: string;
  name: string;
  description?: string;
  enabled: boolean;
}

export interface BaseEntity {
  id?: string | null;
  createdAt?: string | null;
  createdBy?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: string | null;
}

export interface Camera extends BaseEntity {
  modelId?: string | null;
  description?: string | null;
  rtspPort?: number | null;
  rtspRoute?: string | null;
}

export interface CameraDto extends Camera {
  brandName?: string | null;
  modelName?: string | null;
}

export interface Source {
  id?: string | null;
  name?: string | null;
  brand?: string | null;
  rtsp_address?: string | null;
  description?: string | null;
}

export interface DeviceConfig {
  device_name: string;
  device_services: number[];
  device_type: number;
}

export interface Handler {
  read_service_overlay: boolean;
  save_image_extension: string;
  save_image_folder_path: string;
  show_image_caption: boolean;
  show_image_fullscreen: boolean;
  show_image_wait_key: number;
}

export interface Heartbeat {
  interval: number;
}

export interface Jetson {
  model_name: string;
  threshold: number;
  white_list: number[];
}

export interface OnceDetector {
  imagehash_threshold: number;
  psnr_threshold: number;
  ssim_threshold: number;
}

export interface SourceReader {
  buffer_size: number;
  fps: number;
  kill_starter_proc: boolean;
  max_retry: number;
  max_retry_in: number;
  reader_type: number;
}

export interface Redis {
  host: string;
  port: number;
}

export interface Torch {
  model_name: string;
  model_name_specific: string;
  threshold: number;
  white_list: number[];
}

export interface Recording{
  folder_path: string;
}

export interface Config {
  device_config: DeviceConfig;
  handler: Handler;
  heartbeat: Heartbeat;
  jetson: Jetson;
  once_detector: OnceDetector;
  source_reader: SourceReader;
  redis: Redis;
  torch: Torch;
  recording: Recording;
}

export interface StreamingModel extends Source{
  output_file: string;
}

export interface RecordingModel extends StreamingModel{
  output_file: string;
  duration: number;
}

export interface VideoFile{
  source_id: string;
  name: string;
  path: string;
  size: number;
  created_at: string;
  modified_at: string;
}

export interface EditorEvent{
  source: Source;
  event_type: number;
  response_json?:string
}

export interface EditorImageResponseModel{
  source: Source;
  event_type: number;
  image_base64: string;
}

export interface SourceSettings extends Source{
  enabled?: boolean | null;
  recording?: boolean | null;
  input_type?: number | null;
  rtsp_transport?: number | null;
  analyzation_duration?: number | null;
  probe_size?: number | null;
  log_level?: number | null;
  fps?: number | null;
  use_camera_timestamp?: boolean | null;
  use_hwaccel?: boolean | null;
  hwaccel_engine?: number | null;
  video_decoder?: number | null;
  hwaccel_device?:string | null;
  stream_type?: number | null;
  stream_video_codec?: number | null;
  hls_time?: number | null;
  hls_list_size?: number | null;
  hls_preset?: number | null;
  stream_quality?: number | null;
  stream_width?: number | null;
  stream_height?: number | null;
  stream_rotate?: number | null;
  stream_video_filter?: string | null;
  stream_audio_codec?: number | null;
}

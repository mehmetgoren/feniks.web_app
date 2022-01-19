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
  type_name?: string | null;
  name?: string | null;
  brand?: string | null;
  rtsp_address?: string | null;
  id?: string | null;
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

export interface MlConfig {
  device_config: DeviceConfig;
  handler: Handler;
  heartbeat: Heartbeat;
  jetson: Jetson;
  once_detector: OnceDetector;
  source_reader: SourceReader;
  redis: Redis;
  torch: Torch;
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

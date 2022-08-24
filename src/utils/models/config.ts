export interface DeviceConfig {
  device_name: string;
  device_type: number;
}

export interface JetsonConfig {
  model_name: string;
}

export interface TorchConfig {
  model_name: string;
  model_name_specific: string;
}

export interface TensorflowConfig{
  model_name: string;
  cache_folder: string;
}

export interface OnceDetectorConfig {
  imagehash_threshold: number;
  psnr_threshold: number;
  ssim_threshold: number;
}

export interface SourceReaderConfig {
  resize_img: boolean;
  buffer_size: number;
  max_retry: number;
  max_retry_in: number;
}

export interface GeneralConfig {
  root_folder_path: string;
  heartbeat_interval: number;
}

export interface DbConfig{
  type: number;
  connection_string: string;
}

export interface FFmpegConfig {
  use_double_quotes_for_path: boolean;
  max_operation_retry_count: number;
  rtmp_server_init_interval: number;
  watch_dog_interval: number;
  watch_dog_failed_wait_interval: number;
  start_task_wait_for_interval: number;
  record_concat_limit: number;
  record_video_file_indexer_interval: number;
}

export interface AiConfig{
  overlay: boolean;
  video_clip_duration: number;
  face_recog_mtcnn_threshold: number;
  face_recog_prob_threshold: number;
  plate_recog_instance_count: number;
}

export interface UiConfig{
  gs_width:number;
  gs_height:number;
  booster_interval:number;
  seek_to_live_edge_internal:number;
}

export interface JobsConfig{
  mac_ip_matching_enabled:boolean;
  mac_ip_matching_interval: number;
}

export interface DeepStackConfig{
  server_url:string;
  server_port:number;
  performance_mode:number;
  api_key:string;
  od_enabled: boolean;
  od_threshold: number;
  fr_enabled: boolean;
  fr_threshold: number;
  docker_type: number;
}

export interface Config {
  device: DeviceConfig;
  jetson: JetsonConfig;
  torch: TorchConfig;
  tensorflow: TensorflowConfig;
  once_detector: OnceDetectorConfig;
  source_reader: SourceReaderConfig;
  general: GeneralConfig;
  db: DbConfig;
  ffmpeg: FFmpegConfig;
  ai: AiConfig;
  ui: UiConfig;
  jobs: JobsConfig;
  deep_stack: DeepStackConfig;
}

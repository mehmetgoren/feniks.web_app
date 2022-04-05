export interface DeviceConfig {
  device_name: string;
  device_type: number;
  device_services: number[];
}

export interface HeartbeatConfig {
  interval: number;
}

export interface RedisConfig {
  host: string;
  port: number;
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
  fps: number;
  buffer_size: number;
  max_retry: number;
  max_retry_in: number;
}

export interface PathConfig {
  stream: string;
  record: string;
  read: string;
}

export interface FFmpegConfig {
  use_double_quotes_for_path: boolean;
  max_operation_retry_count: number;
  rtmp_server_init_interval: number;
  watch_dog_interval: number;
  watch_dog_failed_wait_interval: number;
  start_task_wait_for_interval: number;
}

export interface AiConfig{
  read_service_overlay: boolean;
  detected_folder: string;
  video_clip_duration: number
}

export interface Config {
  device: DeviceConfig;
  heartbeat: HeartbeatConfig;
  redis: RedisConfig;
  jetson: JetsonConfig;
  torch: TorchConfig;
  tensorflow: TensorflowConfig;
  once_detector: OnceDetectorConfig;
  source_reader: SourceReaderConfig;
  path: PathConfig;
  ffmpeg: FFmpegConfig;
  ai: AiConfig;
}

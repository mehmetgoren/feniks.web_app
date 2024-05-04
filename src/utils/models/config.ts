export interface DeviceConfig {
  device_name: string;
  device_arch: number;
}

export interface GeneralConfig {
  dir_paths: string[];
}

export interface DbConfig {
  type: number;
  connection_string: string;
}

export interface FFmpegConfig {
  use_double_quotes_for_path: boolean;
  max_operation_retry_count: number;
  ms_init_interval: number;
  watch_dog_interval: number;
  watch_dog_failed_wait_interval: number;
  start_task_wait_for_interval: number;
  record_concat_limit: number;
  record_video_file_indexer_interval: number;
  ms_port_start: number;
  ms_port_end: number;
}

export interface AiConfig {
  video_clip_duration: number;
}

export interface SenseAIConfig {
  image: number;
  host: string;
  port: number;
}

export interface JobsConfig {
  mac_ip_matching_enabled: boolean;
  mac_ip_matching_interval: number;
  black_screen_monitor_enabled: boolean;
  black_screen_monitor_interval: number;
}

export interface ArchiveConfig {
  limit_percent: number;
  action_type: number;
  move_location: string;
}

export interface SnapshotConfig {
  process_count: number;
  overlay: boolean;
}

export interface DesimaConfig {
  enabled: boolean;
  address: string;
  token: string;
  web_app_address: string;
  max_retry: number;
}

export interface Config {
  device: DeviceConfig;
  general: GeneralConfig;
  db: DbConfig;
  ffmpeg: FFmpegConfig;
  ai: AiConfig;
  sense_ai: SenseAIConfig;
  jobs: JobsConfig;
  archive: ArchiveConfig;
  snapshot: SnapshotConfig;
  desima: DesimaConfig;
}

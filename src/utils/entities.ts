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

export interface SourceHub {
  buffer_size: number;
  fps: number;
  kill_starter_proc: boolean;
  max_retry: number;
  max_retry_in: number;
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
  source_hub: SourceHub;
  redis: Redis;
  torch: Torch;
}

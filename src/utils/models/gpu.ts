export interface NvidiaProcessModel {
  process_name: string;
  used_memory: string;
}

export interface NvidiaGpuModel {
  product_mame: string;
  product_architecture: string;
  driver_version: string;
  cuda_version: string;
  fan_speed: string;
  gpu_temp: string;
  power_draw: string;
  power_limit: string;
  clock_graphics:string;
  clock_sm:string;
  clock_mem:string;
  clock_video:string;
  memory_total: string;
  memory_reserved: string;
  memory_used: string;
  memory_free: string;
  gpu_util: string;
  memory_util: string;
  encoder_util: string;
  decoder_util: string;
  processes: NvidiaProcessModel[];
}

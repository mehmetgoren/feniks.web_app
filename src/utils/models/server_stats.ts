export interface CpuInfo {
  cpu_count: number;
  user_usage: number;
  user_usage_human: string;
  system_usage: number;
  system_usage_human: string;
  idle: number;
  idle_human: string;
  usage_percent: number;
  usage_percent_human: string;
}

export interface MemoryInfo {
  total: number;
  total_human: string;
  used: number;
  used_human: string;
  cached: number;
  cached_human: string;
  free: number;
  free_human: string;
  usage_percent: number;
  usage_percent_human: string;
}

export interface DiskInfo {
  mount_point: string;
  fstype: string;
  total: number;
  total_human: string;
  used: number;
  used_human: string;
  free: number;
  free_human: string;
  usage_percent: number;
  usage_percent_human: string;
}

export interface NetworkInfo {
  download: number;
  download_human: string;
  upload: number;
  upload_human: string;
}

export interface ServerStats {
  cpu: CpuInfo;
  memory: MemoryInfo;
  disk: DiskInfo;
  network: NetworkInfo;
}
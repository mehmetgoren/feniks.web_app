export interface ServiceModel {
  name: string;
  description: string;
  platform: string;
  platform_versions: string;
  hostname: string;
  ip_address: string;
  mac_address: string;
  processor: string;
  cpu_count: number;
  ram: string;
  pid: number;
  instance_type: number;
  instance_name: string;
  created_at: string;
  heartbeat: string;
}

export interface ServiceViewModel extends ServiceModel{
  restart_button_enabled:boolean;
  start_button_enabled:boolean;
  stop_button_enabled: boolean
}

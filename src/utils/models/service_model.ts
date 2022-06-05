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
  created_at: string;
  heartbeat: string;
}
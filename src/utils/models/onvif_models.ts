export enum OnvifAction {
  GetTargetInfo = 'GetTargetInfo',
  Reboot = 'Reboot',
  FactoryReset = 'FactoryReset',
  FirmwareUpgrade = 'FirmwareUpgrade',
  NetworkDiscovery = 'NetworkDiscovery',
  HackTarget = 'HackTarget'
}


export interface OnvifParams {
  address?: string;
  port?: number;
  username?: string;
  password?: string;
}

export interface OnvifEvent {
  type: OnvifAction;
  base64_model: string;
}

export interface ExecResultView {
  device?: string;
  username?: string;
  password?: string;
  route?: string[];
  address?: string;
  port?: number;

  credentials_found?: boolean;
  route_found?: boolean;
  available?: boolean;

  authenticationType?: string;
}

export interface NetworkDiscoveryModel {
  results?: ExecResultView[];
  created_at?: string;
}

export interface OnvifModel {
  hack_result?: ExecResultView;
  onvif?: TargetInfo;
  onvif_params: OnvifParams;
  created_at?: string;
}

export interface DeviceInfo {
  manufacturer: string;
  model: string;
  firmware_version: string;
  serial_number: string;
  hardware_id: string;
}

export interface User {
  username: string;
  user_level: string;
}

export interface TargetInfo {
  device_info?: DeviceInfo;
  is_discoverable?: boolean;
  host_name?: string;
  ip_addresses?: string[];
  hw_address?: string;
  http_port?: number;
  https_port?: number;
  rtsp_port?: number;
  local_datetime?: string;
  logs?: string;
  users?: User[];
  stream_uri?: string;
}


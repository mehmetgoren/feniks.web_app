export interface StreamModel {
  id: string;
  brand: string;
  name: string;
  rtsp_address: string;

  // stream
  pid: number;
  created_at: string;
  args: string;
  failed_count: number;

  //extended
  stream_type: number;
  rtmp_server_initialized: boolean;
  rtmp_server_type: number;
  flv_player_connection_type: number;
  need_reload_interval: number;
  rtmp_image_name: string;
  rtmp_container_name: string;
  rtmp_address: string;
  rtmp_flv_address: string;
  rtmp_container_ports: string;
  rtmp_container_commands: string;

  record: boolean;
  record_duration: number;

  hls_output_path: string;
  read_jpeg_output_path: string;
  record_output_folder_path: string;
}

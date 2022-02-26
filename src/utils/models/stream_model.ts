export interface StreamModel {
  id: string;
  brand: string;
  name: string;
  rtsp_address: string;

  // stream
  pid: number;
  created_at: string;
  args: string;

  //extended
  stream_type: number;
  rtmp_server_initialized: boolean;
  rtmp_server_type: number;
  flv_player_connection_type: number;
  rtmp_image_name: string;
  rtmp_container_name: string;
  rtmp_address: string;
  rtmp_flv_address: string;
  rtmp_container_ports: string;
  rtmp_container_commands: string;

  direct_read_frame_rate:number;
  direct_read_width:number;
  direct_read_height:number;

  jpeg_enabled:boolean;
  jpeg_frame_rate:number;

  record: boolean;
  record_duration: number;
  record_flv_pid: number;
  record_flv_args:string;
  record_flv_failed_count:number;

  use_disk_image_reader_service:boolean;
  reader: boolean;
  reader_frame_rate: number;
  reader_width: number;
  reader_height: number;
  reader_pid: number;
  reader_failed_count: number;

  hls_output_path: string;
  read_jpeg_output_path: string;
  record_output_folder_path: string;
}

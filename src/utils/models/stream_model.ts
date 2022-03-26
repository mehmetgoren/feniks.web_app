export interface StreamModel {
  id: string;
  brand: string;
  name: string;
  address: string;

  // stream
  rtmp_feeder_pid: number;
  rtmp_feeder_args: string;
  hls_pid: number;
  hls_args: string;
  created_at: string;

  //extended
  stream_type: number;
  rtmp_server_initialized: boolean;
  rtmp_server_type: number;
  rtmp_image_name: string;
  rtmp_container_name: string;
  rtmp_address: string;
  rtmp_flv_address: string;
  rtmp_container_ports: string;
  rtmp_container_commands: string;

  ffmpeg_reader_pid: number;
  ffmpeg_reader_frame_rate:number;
  ffmpeg_reader_width:number;
  ffmpeg_reader_height:number;

  record_enabled: boolean;
  record_pid: number;
  record_args:string;
  record_duration: number;

  snapshot_enabled: boolean;
  snapshot_pid: number;
  snapshot_frame_rate: number;
  snapshot_width: number;
  snapshot_height: number;

  hls_output_path: string;
  record_output_folder_path: string;
}

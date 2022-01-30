export interface StreamingModel {
  id: string;
  brand: string;
  name: string;
  rtsp_address: string;

  enabled: boolean;

  // streaming
  pid: number;
  created_at: string;
  args: string;
  failed_count: number;

  //extended
  streaming_type: number;
  rtmp_server_initialized: boolean;
  rtmp_server_type: number;
  rtmp_image_name: string;
  rtmp_container_name: string;
  rtmp_address: string;
  rtmp_flv_address: string;
  rtmp_container_ports: string;
  rtmp_container_commands: string;

  recording: boolean;
  record_duration: number;

  hls_output_path: string;
  read_jpeg_output_path: string;
  recording_output_folder_path: string;
}

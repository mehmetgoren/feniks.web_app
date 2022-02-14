export interface SourceModel{
  id?: string | null;
  brand?: string | null;
  name?: string | null;
  rtsp_address?: string | null;
  description?: string | null;

  enabled?: boolean | null;
  record?: boolean | null;

  input_type?: number | null;
  rtsp_transport?: number | null;

  analyzation_duration?: number | null;
  probe_size?: number | null;
  input_frame_rate?: number | null;
  use_camera_timestamp?: boolean | null;
  use_hwaccel?: boolean | null;
  hwaccel_engine?: number | null;
  video_decoder?: number | null;
  hwaccel_device?:string | null;

  stream_type?: number | null;
  rtmp_server_type?: number | null;
  flv_player_connection_type?: number | null;
  rtmp_server_address?: string | null;
  need_reload_interval?: number | null;
  direct_read_frame_rate?:number | null;
  direct_read_width?:number | null;
  direct_read_height?:number | null;
  stream_video_codec?: number | null;
  hls_time?: number | null;
  hls_list_size?: number | null;
  hls_preset?: number | null;
  stream_quality?: number | null;
  stream_frame_rate?: number | null;
  stream_width?: number | null;
  stream_height?: number | null;
  stream_rotate?: number | null;
  stream_audio_codec?: number | null;
  stream_audio_channel?: number | null;
  stream_audio_quality?: number | null;
  stream_audio_sample_rate?: number | null;
  stream_audio_volume?: number | null;

  jpeg_enabled?: boolean | null;
  jpeg_quality?: number | null;
  jpeg_frame_rate?: number | null;
  jpeg_use_vsync?: boolean | null;
  jpeg_width?: number | null;
  jpeg_height?: number | null;
  use_disk_image_reader_service?: boolean | null;

  record_file_type?: number | null;
  record_video_codec?: number | null;
  record_quality?:number | null;
  record_preset?:number | null;
  record_frame_rate?:number | null;
  record_width?: number | null;
  record_height?: number | null;
  record_segment_interval?: number | null;
  record_rotate?: number | null;
  record_audio_codec?: number | null;
  record_audio_channel?: number | null;
  record_audio_quality?: number | null;
  record_audio_sample_rate?: number | null;
  record_audio_volume?: number | null;

  log_level?: number | null;
}

export interface StreamModel {
  id: string;
  brand: string;
  name: string;
  address: string;

  // stream
  ms_feeder_pid: number;
  ms_feeder_args: string;
  hls_pid: number;
  hls_args: string;
  created_at: string;

  //extended
  ms_type: number;
  stream_type: number;
  ms_initialized: boolean;
  ms_image_name: string;
  ms_container_name: string;
  ms_address: string;
  ms_stream_address: string;
  ms_container_ports: string;
  ms_container_commands: string;

  mp_ffmpeg_reader_owner_pid: number;
  ffmpeg_reader_frame_rate: number;
  ffmpeg_reader_width: number;
  ffmpeg_reader_height: number;

  record_enabled: boolean;
  record_pid: number;
  record_args: string;
  record_duration: number;

  snapshot_enabled: boolean;
  snapshot_pid: number;
  snapshot_frame_rate: number;
  snapshot_width: number;
  snapshot_height: number;

  ai_clip_enabled: boolean;
  ai_clip_pid: number;
  ai_clip_args: string;

  flv_player_type: number;
  booster_enabled: boolean;
  live_buffer_latency_chasing: boolean;

  go2rtc_player_mode: number;

  concat_demuxer_pid: number;
  concat_demuxer_args: string;

  root_dir_path: string;
}

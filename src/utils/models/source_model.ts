export interface SourceModel {
  // FFmpegModel section starts
  id?: string | null;
  address?: string | null;
  rtsp_transport?: number | null;

  analyzation_duration?: number | null;
  probe_size?: number | null;
  input_frame_rate?: number | null;
  use_camera_timestamp?: boolean | null;
  use_hwaccel?: boolean | null;
  hwaccel_engine?: number | null;
  video_decoder?: number | null;
  hwaccel_device?: string | null;

  stream_type?: number | null;
  ms_address?: string | null;
  stream_video_codec?: number | null;
  preset?: number | null;
  hls_time?: number | null;
  hls_list_size?: number | null;
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

  record_file_type?: number | null;
  record_video_codec?: number | null;
  record_quality?: number | null;
  record_preset?: number | null;
  record_frame_rate?: number | null;
  record_width?: number | null;
  record_height?: number | null;
  record_segment_interval?: number | null;
  record_rotate?: number | null;
  record_audio_codec?: number | null;
  record_audio_channel?: number | null;
  record_audio_quality?: number | null;
  record_audio_sample_rate?: number | null;
  record_audio_volume?: number | null;

  record_enabled?: boolean | null;
  ai_clip_enabled?: boolean | null;

  root_dir_path?: string | null;

  log_level?: number | null;
  // FFmpegModel section ends

  // SourceModel section starts
  brand?: string | null;
  name?: string | null;
  description?: string | null;

  mac_address?: string | null;
  ip_address?: string | null;

  enabled?: boolean | null;
  state?: number | null;
  ms_type?: number | null;

  snapshot_enabled: boolean | null;
  snapshot_frame_rate: number | null;
  snapshot_width: number | null;
  snapshot_height: number | null;
  md_type: number | null;
  md_opencv_threshold: number | null;
  md_contour_area_limit: number | null;
  md_imagehash_threshold: number | null;
  md_psnr_threshold: number | null;

  ffmpeg_reader_frame_rate?: number | null;
  ffmpeg_reader_width?: number | null;
  ffmpeg_reader_height?: number | null;

  flv_player_type?: number | null;
  booster_enabled?: boolean | null;
  live_buffer_latency_chasing?: boolean | null;

  go2rtc_player_mode?: number | null;

  black_screen_check_enabled?: boolean | null;
  created_at?: string | null;
  // SourceModel section ends
}

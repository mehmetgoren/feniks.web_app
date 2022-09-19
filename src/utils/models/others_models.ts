export interface RtspTemplateModel {
  id: string;
  name: string;
  description: string;
  brand: string;
  default_user: string;
  default_password: string;
  default_port: string;
  route: string;
  templates: string;
}

export interface FailedStreamModel {
  id: string;
  brand: string;
  name: string;
  address: string;

  rtmp_container_failed_count: number;
  rtmp_feeder_failed_count: number;
  hls_failed_count: number;
  ffmpeg_reader_failed_count: number;
  record_failed_count: number;
  snapshot_failed_count: number;
  record_stuck_process_count: number;
  source_state_conflict_count: number;
  last_check_at: string;
}

export interface RecStuckModel {
  id: string;
  brand: string;
  name: string;
  address: string;

  record_segment_interval: number;
  record_output_dir: string;
  file_ext: string;
  last_modified_file: string;
  last_modified_size: number;
  failed_count: number;
  failed_modified_file: string;
  last_check_at: string;
}

export interface VariousInfos{
  rtmp_port_counter: number;
  rtmp_container_zombies:string[];
  ffmpeg_process_zombies:number[];
}

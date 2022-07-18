export interface VideMergeRequestEvent {
  source_id: string;
  date_str: string;
}

export interface VideMergeResponseEvent{
  source_id: string;
  output_file_name: string;
  merged_video_filenames: string[];
  merged_video_file_duration: number;
}

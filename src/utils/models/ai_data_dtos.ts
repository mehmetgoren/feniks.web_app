export interface QueryAiDataParams {
  ai_type: number;
  source_id: string;
  date_time_str: string;
  pred_class_name: string;
  no_preparing_video_file: boolean;
}

export interface VideoFileDto {
  name: string;
  created_at: string;
  duration: number;
  merged: boolean;
  object_appears_at: number;
}

export interface AiClip {
  enabled: boolean;
  file_name: string;
  created_at: string;
  last_modified_at: string;
  duration: number;
}

export interface AiDataDto {
  id: string;
  group_id: string;
  source_id: string;
  created_at: string;
  pred_cls_name: string;
  pred_score: number;
  image_file_name: string;
  video_file: VideoFileDto;
  ai_clip: AiClip;
}

import { DetectedObjectDto } from 'src/utils/models/ai_model';

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
  detected_object:DetectedObjectDto;
  image_file_name: string;
  video_file: VideoFileDto;
  ai_clip: AiClip;
}

export enum SortBy {
  Ascending = 1,
  Descending = -1
}

export interface SortInfo {
  enabled: boolean;
  field: string;
  sort: SortBy;
}

export interface PagingInfo {
  enabled: boolean;
  page: number;
  take: number;
}

export interface QueryAiDataAdvancedParams {
  module: string;
  source_id: string;
  start_date_time_str: string;
  end_date_time_str: string;
  label: string;
  no_preparing_video_file: boolean;
  sort: SortInfo;
  paging: PagingInfo;
}

export interface AiDataDeleteOptions{
  module?: string;
  id?: string;
  delete_image:boolean;
  delete_video:boolean;
}

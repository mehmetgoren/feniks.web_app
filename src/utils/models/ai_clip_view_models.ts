export interface AiObjectViewModel {
  score: number;
  label: string;
}

export interface AiPreviewViewModel {
  image_file_name: string;
  object_names: string;
  id: string;
}

export interface AiClipViewModel {
  ai_objects: AiObjectViewModel[];
  image_file_names: string[];
  data_file_names: string[];
  ids: string[];

  preview: AiPreviewViewModel;

  video_created_at: string;
  video_last_modified_at: string;
  video_file_name: string;
  video_base_file_name: string;
  duration: number;

  source_id: string;
}

export interface AiClipQueryViewModel{
  module: string;
  source_id: string;
  date: string;
}

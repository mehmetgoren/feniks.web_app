export interface DetectedObject {
  pred_score: number;
  pred_cls_idx: number;
  pred_cls_name: string;
}

export interface PreviewViewModel {
  image_file_name: string;
  object_names: string;
  id: string;
}

export interface OdVideoClipsViewModel {
  detected_objects: DetectedObject[];
  image_file_names: string[];
  data_file_names: string[];
  ids: string[];

  preview: PreviewViewModel;

  video_created_at: string;
  video_last_modified_at: string;
  video_file_name: string;
  video_base_file_name: string;
  duration: number;
}

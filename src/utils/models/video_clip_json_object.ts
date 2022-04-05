export interface DetectedObject {
  pred_score: number;
  pred_cls_idx: number;
  pred_cls_name: string;
}

export interface DetectedImage {
  id: string;
  source_id: string;
  created_at: string;
  detected_objects: DetectedObject[];
  base64_image: string;
  video_clip_enabled: boolean;
}

export interface VideoClipJsonObject {
  detected_image: DetectedImage;
  file_name: string;
  created_at: string;
  last_modified: string;
  duration: number;
}

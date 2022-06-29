export interface OdModel{
  id: string;
  brand: string;
  name: string;
  address: string;
  created_at: string;
  threshold_list: string;
  selected_list: string;
  zones_list: string;
  masks_list:string;
  start_time:string;
  end_time:string;
}

export interface DetectedObject {
  pred_score: number;
  pred_cls_idx: number;
  pred_cls_name: string;
}

export interface ObjectDetectionModel {
  id: string;
  source_id: string;
  created_at: string;
  detected_objects: DetectedObject[];
  base64_image: string;
  ai_clip_enabled: boolean;
}

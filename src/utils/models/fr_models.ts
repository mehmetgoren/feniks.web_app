export interface FrTrainViewModel {
  name: string;
  image_paths: string[];
}

export interface FaceTrainResponseEvent {
  result: boolean;
}

export interface FrTrainScreenshotViewModel {
  name: string;
  base64_images: string[];
}

export interface FrTrainRename{
  new_name: string;
  original_name: string;
}

export interface FrTrainName{
  name: string;
}

export interface DetectedFace {
  pred_score: number;
  pred_cls_idx: number;
  pred_cls_name: string;
  crop_base64_image: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface FaceRecognitionModel{
  id: string;
  source_id: string;
  created_at: string;
  detected_faces: DetectedFace[];
  base64_image: string;
  ai_clip_enabled: boolean;
}

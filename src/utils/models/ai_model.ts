export interface SmartVisionModel{
  id: string;
  brand: string;
  name: string;
  address: string;
  created_at: string;
  selected_list_json: string;
  zones_list: string;
  masks_list:string;
  start_time:string;
  end_time:string;
}

export interface DetectedObjectDto {
  score: number;
  label: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface AiDto {

  id: string;
  module: string;
  group_id: string;
  source_id: string;
  created_at: string;
  detections: DetectedObjectDto[];
  base64_image: string;
  ai_clip_enabled: boolean;
}

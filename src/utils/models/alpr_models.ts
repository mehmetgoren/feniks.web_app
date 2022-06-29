export interface Coordinates {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface Candidate {
  plate: string;
  confidence: number;
}

export interface Result {
  plate: string;
  confidence: number;
  processing_time_ms: number;
  coordinates: Coordinates;
  candidates: Candidate[];
}

export interface AlprResponse {
  base64_image: string;
  img_width: number;
  img_height: number;
  processing_time_ms: number;
  results: Result[];
  id: string;
  source_id: string;
  created_at: string;
  ai_clip_enabled: boolean;
}

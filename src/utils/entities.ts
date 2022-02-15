export interface Node {
  node_address: string;
  name: string;
  description?: string;
  enabled: boolean;
}

export interface BaseEntity {
  id?: string | null;
  createdAt?: string | null;
  createdBy?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: string | null;
}

export interface Camera extends BaseEntity {
  modelId?: string | null;
  description?: string | null;
  rtspPort?: number | null;
  rtspRoute?: string | null;
}

export interface CameraDto extends Camera {
  brandName?: string | null;
  modelName?: string | null;
}

export interface VideoFile{
  source_id: string;
  name: string;
  path: string;
  size: number;
  created_at: string;
  modified_at: string;
}

export interface EditorEvent{
  id?: string | null;
  brand?: string | null;
  name?: string | null;
  rtsp_address?: string | null;
  event_type: number;
}

export interface EditorImageResponseModel{
  id?: string | null;
  brand?: string | null;
  name?: string | null;
  rtsp_address?: string | null;
  event_type: number;
  image_base64: string;
}


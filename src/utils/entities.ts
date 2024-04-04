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

export interface VideoFile{
  source_id: string;
  name: string;
  path: string;
  size: number;
  created_at: string;
  modified_at: string;
  year: string;
  month: string;
  day: string;
  hour: string;
}

export interface EditorEvent{
  id?: string | null;
  brand?: string | null;
  name?: string | null;
  address?: string | null;
  event_type: number;
}

export interface EditorImageResponseModel{
  id?: string | null;
  brand?: string | null;
  name?: string | null;
  address?: string | null;
  event_type: number;
  image_base64: string;
}


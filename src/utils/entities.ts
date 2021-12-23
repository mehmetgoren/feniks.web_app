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

export interface Plugin{
  type_name?: string | null;
  name?: string | null;
  brand?: string | null;
  rtsp_address?: string | null;
}

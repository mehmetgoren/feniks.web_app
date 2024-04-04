export interface AiModuleModel {
  name: string;
  description: string;
  enabled: boolean;
  api_url: string;
  threshold: number;
  label_field: string;
  motion_detection_enabled: boolean;
  persistence_enabled: boolean;
  notification_enabled: boolean;
}

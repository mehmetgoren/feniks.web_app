export interface SmartSearchColor{
  hex_color: string;
  difference_method: string;
  threshold: number;
}

export interface SmartSearchParams {
  source_id: string;
  start_date_time_str: string;
  end_date_time_str: string;
  pred_class_name: string;
  color: SmartSearchColor;
}

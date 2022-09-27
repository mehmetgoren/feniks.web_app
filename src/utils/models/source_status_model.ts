export interface SourceStatusModel{
  id: string;
  enabled: boolean;
  streaming: boolean;
  recording:boolean;
}

export interface SourceEnabledModel{
  id: string;
  enabled: boolean;
}

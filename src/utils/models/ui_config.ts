export interface UiConfig {
  gs_width: number;
  gs_height: number;
  booster_interval: number;
  seek_to_live_edge_internal: number;
}

export function createDefaultUiConfig(): UiConfig {
  return {
    gs_width: 4,
    gs_height: 2,
    booster_interval: .3,
    seek_to_live_edge_internal: 30
  };
}

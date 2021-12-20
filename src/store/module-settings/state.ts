export interface ISettingsState {
  dense: boolean;
}

function state(): ISettingsState {
  return {
    dense: true
  }
}

export default state;

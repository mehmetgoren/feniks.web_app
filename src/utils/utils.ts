
export const NodeMngrPort = '2072'
export const NodeMngrAddress = 'localhost:' + NodeMngrPort
export const IonixHubAddress  = 'localhost:7242'

export function parseQs(qs = window.location.search){
  const urlSearchParams = new URLSearchParams(qs);
  const params = Object.fromEntries(urlSearchParams.entries());
  return params;
}

const COINCAP_ICON_CDN_BASE_URL = "https://assets.coincap.io/assets/icons";

export function getCoinIconUrl(symbol: string): string {
  return `${COINCAP_ICON_CDN_BASE_URL}/${symbol.toLowerCase()}@2x.png`;
}

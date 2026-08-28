

const FLAG_CDN_BASE_URL = "https://flagcdn.com/w80";

export function getFlagUrl(countryCode: string): string {
  return `${FLAG_CDN_BASE_URL}/${countryCode}.png`;
}
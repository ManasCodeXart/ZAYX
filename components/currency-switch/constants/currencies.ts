import type { Currency } from "./types";

export const CURRENCIES: readonly Currency[] = [
  { code: "USD", symbol: "$", name: "United States Dollar", countryCode: "us" },
  { code: "EUR", symbol: "€", name: "Euro", countryCode: "eu" },
  { code: "GBP", symbol: "£", name: "British Pound", countryCode: "gb" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", countryCode: "in" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", countryCode: "jp" },
  { code: "CAD", symbol: "$", name: "Canadian Dollar", countryCode: "ca" },
  { code: "AUD", symbol: "$", name: "Australian Dollar", countryCode: "au" },
  { code: "SGD", symbol: "$", name: "Singapore Dollar", countryCode: "sg" },
  { code: "CHF", symbol: "₣", name: "Swiss Franc", countryCode: "ch" },
  
  { code: "HKD", symbol: "$", name: "Hong Kong Dollar", countryCode: "hk" },
  { code: "MXN", symbol: "$", name: "Mexican Peso", countryCode: "mx" },
  
];
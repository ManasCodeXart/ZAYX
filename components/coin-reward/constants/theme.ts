import { scale, verticalScale } from "./scaling";

export const colors = {
  primary: "#9444E8",
  primaryLight: "#0ea5e9",
  primaryDark: "#0369a1",
  text: "#ffffff",
  textLight: "#e5e5e5",
  textLighter: "#d4d4d4",
  white: "#fff",
  black: "#000",
  rose: "#ef4444",
  green: "#16a34a",
  neutral50: "#fafafa",
  neutral100: "#f5f5f5",
  neutral200: "#e5e5e5",
  neutral300: "#d4d4d4",
  neutral350: "#CCCCCC",
  neutral400: "#a3a3a3",
  neutral500: "#737373",
  neutral600: "#74A866",
  neutral700: "#404040",
  neutral800: "#262626",
  neutral900: "#9344e817",
  neutral1000: "1C1C1C",
  neutral1200: "#E14949",

  grey: '#B5B5B6'
};

export const spacingX = {
  _1: scale(-1),
  _3: scale(3),
  _5: scale(5),
  _7: scale(7),
  _10: scale(10),
  _12: scale(12),
  _15: scale(15),
  _20: scale(20),
  _25: scale(25),
  _30: scale(30),
  _35: scale(35),
  _70: verticalScale(70),
   _100: verticalScale(100),
 
};

export const spacingY = {
  _8: verticalScale(-50),
  _1: verticalScale(-10),
  _5: verticalScale(5),
  _7: verticalScale(7),
  _10: verticalScale(10),
  _12: verticalScale(12),
  _15: verticalScale(15),
  _17: verticalScale(17),
  _20: verticalScale(20),
  _25: verticalScale(25),
  _30: verticalScale(30),
  _35: verticalScale(35),
  _40: verticalScale(40),
  _50: verticalScale(50),
  _60: verticalScale(60),
  _70: verticalScale(70),
  _500: verticalScale(500),
  _100: verticalScale(100),
};

export const radius = {
  _3: verticalScale(3),
  _6: verticalScale(6),
  _10: verticalScale(10),
  _12: verticalScale(12),
  _15: verticalScale(15),
  _17: verticalScale(17),
  _20: verticalScale(20),
  _30: verticalScale(30),
};

export { scale, verticalScale };


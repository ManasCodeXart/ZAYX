export type ThemeName = "light" | "dark";

export interface ThemeColors {
  background: string;
  cardBackground: string;
  textPrimary: string;
  textSecondary: string;
  pillBackground: string;
  divider: string;
  swapButtonBackground: string;
  swapButtonBorder: string;
  caret: string;
}

export const LIGHT_THEME: ThemeColors = {
  background: "#F5F5F5",
  cardBackground: "#FFFFFF",
  textPrimary: "#111111",
  textSecondary: "#888888",
  pillBackground: "#F5F5F5",
  divider: "#E0E0E0",
  swapButtonBackground: "#FFFFFF",
  swapButtonBorder: "#F5F5F5",
  caret: "#111111",
};

export const DARK_THEME: ThemeColors = {
  background: "#000000",
  cardBackground: "#131313",
  textPrimary: "#FFFFFF",
  textSecondary: "#666666",
  pillBackground: "#161616",
  divider: "#22222233",
  swapButtonBackground: "#131313",
  swapButtonBorder: "#000000",
  caret: "#FFFFFF",
};

import Svg, { Path } from "react-native-svg";

interface SwapIconProps {
  size?: number;
  color?: string;
}

export function SwapIcon({ size = 16, color = "#FFFFFF" }: SwapIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 7h12M19 7l-4-4M19 7l-4 4M17 17H5M5 17l4 4M5 17l4-4"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
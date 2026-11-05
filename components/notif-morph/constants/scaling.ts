import { Dimensions, PixelRatio } from "react-native";

const GUIDELINE_BASE_HEIGHT = 812;

export const verticalScale = (size: number) => {
  const { width, height } = Dimensions.get("window");
  const longDimension = Math.max(width, height);
  return PixelRatio.roundToNearestPixel(
    (longDimension / GUIDELINE_BASE_HEIGHT) * size,
  );
};

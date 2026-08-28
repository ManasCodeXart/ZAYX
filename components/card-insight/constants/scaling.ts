import { Dimensions, PixelRatio } from 'react-native'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const longDimension = Math.max(SCREEN_WIDTH, SCREEN_HEIGHT)

const guidelineBaseHeight = 812

export const verticalScale = (size: number) =>
  Math.round(
    PixelRatio.roundToNearestPixel((longDimension / guidelineBaseHeight) * size),
  )

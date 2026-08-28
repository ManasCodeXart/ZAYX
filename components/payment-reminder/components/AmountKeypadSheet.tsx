import { memo, useCallback, useEffect, useState } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { EASE_OUT_EXPO, ENTRANCE_SPRING } from '../constants/motion';
import { verticalScale } from '../constants/scaling';
import type { AmountKeypadSheetProps } from '../constants/types';
import { parseAmountKeyPress } from '../utils/amount';
import Keypad from './Keypad';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.38;


const CARD_WIDTH = verticalScale(365);


const AmountKeypadSheet = memo(function AmountKeypadSheet({
  visible,
  amount,
  onAmountChange,
  decimalSeparator = '.',
  hapticsEnabled = true,
}: AmountKeypadSheetProps) {
  const [isMounted, setIsMounted] = useState(visible);
  const slideY = useSharedValue(SCREEN_HEIGHT);

  useEffect(() => {
    if (!visible) return;
    setIsMounted(true);
    slideY.value = withSpring(0, ENTRANCE_SPRING);
  }, [visible, slideY]);

  useEffect(() => {
    if (visible || !isMounted) return;
    slideY.value = withTiming(SCREEN_HEIGHT, { duration: 300, easing: EASE_OUT_EXPO }, (finished) => {
      if (finished) runOnJS(setIsMounted)(false);
    });
  }, [visible, isMounted, slideY]);

  const handleKeyPress = useCallback(
    (key: string) => {
      const next =
        key === 'delete'
          ? parseAmountKeyPress.delete(amount)
          : parseAmountKeyPress.append(amount, key, decimalSeparator);
      if (next !== amount) onAmountChange(next);
    },
    [amount, decimalSeparator, onAmountChange]
  );

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideY.value }],
  }));

  if (!isMounted) return null;

  return (
    <Animated.View style={[styles.sheet, sheetStyle]}>
      <Keypad
        onKeyPress={handleKeyPress}
        decimalSeparator={decimalSeparator}
        hapticsEnabled={hapticsEnabled}
        containerStyle={styles.keypad}
        keyStyle={styles.key}
        keyTextStyle={styles.keyText}
      />
    </Animated.View>
  );
});

AmountKeypadSheet.displayName = 'AmountKeypadSheet';

export default AmountKeypadSheet;

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: verticalScale(30),
    left: (SCREEN_WIDTH - CARD_WIDTH) / 2,
    width: CARD_WIDTH,
    height: SHEET_HEIGHT,
    backgroundColor: '#141414f1',
    borderWidth: verticalScale(2),
    borderColor: '#ffffff1f',
    borderRadius: verticalScale(28),
    paddingHorizontal: verticalScale(15),
    paddingBottom: verticalScale(10),
    paddingTop: verticalScale(10),
  },
  keypad: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  key: {
    backgroundColor: '#1e1e1e9c',
    borderRadius: verticalScale(14),
    margin: verticalScale(5),
  },
  keyText: {
    fontSize: verticalScale(24),
    fontFamily: 'SpaceGroteskMedium',
  },
});

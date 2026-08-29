import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { verticalScale } from '../constants/scaling';

import type { ActionItem, DrawerPage } from '../constants/types';
import ActionPanel from './ActionPanel';
import InsightPanel from './InsightPanel';



const ACTIONS_PANEL_WIDTH = 90;
const INSIGHTS_PANEL_WIDTH = 160;

const DRAWER_RIGHT_INSET = verticalScale(16);
const DRAWER_HIDDEN_BUFFER = verticalScale(20);
const DRAWER_CLOSED_TRANSLATE_X = ACTIONS_PANEL_WIDTH + DRAWER_RIGHT_INSET + DRAWER_HIDDEN_BUFFER;

const PILL_WIDTH = verticalScale(9);
const PILL_HEIGHT = verticalScale(90);
const PILL_INSET = verticalScale(4);
const PILL_VERTICAL_OFFSET = '34%';

const SWIPE_THRESHOLD = 35;



const OPEN_SPRING = { damping: 22, stiffness: 180, mass: 0.7 };
const PAGE_SPRING = { damping: 28, stiffness: 160, mass: 0.9 };
const FADE_TIMING = { duration: 220, easing: Easing.out(Easing.quad) };



const DEFAULT_ACTIONS: readonly ActionItem[] = [
  { id: 'cards', label: 'Cards', icon: require('../assets/images/Cards.png') },
  { id: 'quick-pay', label: 'Quick Pay', icon: require('../assets/images/quickpay.png') },
  { id: 'savings', label: 'Savings', icon: require('../assets/images/savings.png') },
  { id: 'crypto', label: 'Crypto', icon: require('../assets/images/crypto.png') },
  { id: 'your-bills', label: 'Your Bills', icon: require('../assets/images/bills.png') },
];

export interface QuickActionsDrawerProps {
 
  readonly actions?: readonly ActionItem[];

  readonly onActionPress?: (actionId: string) => void;
  
  readonly onOpenChange?: (isOpen: boolean) => void;
}



export default function QuickActionsDrawer({
  actions = DEFAULT_ACTIONS,
  onActionPress,
  onOpenChange,
}: QuickActionsDrawerProps) {
  const [panelVisible, setPanelVisible] = useState(false);

  const isOpen = useSharedValue(false);
  const activePage = useSharedValue<DrawerPage>('actions');
  const drawerTranslateX = useSharedValue(DRAWER_CLOSED_TRANSLATE_X);
  const carouselTranslateX = useSharedValue(0);
  const drawerWidth = useSharedValue(ACTIONS_PANEL_WIDTH);

  const openDrawer = useCallback(() => {
    'worklet';
    isOpen.value = true;
    drawerTranslateX.value = withSpring(0, OPEN_SPRING);
    runOnJS(setPanelVisible)(true);
    if (onOpenChange) runOnJS(onOpenChange)(true);
  }, [onOpenChange]);

  const closeDrawer = useCallback(() => {
    'worklet';
    isOpen.value = false;
    drawerTranslateX.value = withSpring(DRAWER_CLOSED_TRANSLATE_X, OPEN_SPRING);
    carouselTranslateX.value = withSpring(0, PAGE_SPRING);
    drawerWidth.value = withSpring(ACTIONS_PANEL_WIDTH, PAGE_SPRING);
    activePage.value = 'actions';
    runOnJS(setPanelVisible)(false);
    if (onOpenChange) runOnJS(onOpenChange)(false);
  }, [onOpenChange]);

  const goToPage = useCallback((page: DrawerPage) => {
    'worklet';
    activePage.value = page;
    const isInsights = page === 'insights';
    carouselTranslateX.value = withSpring(isInsights ? -ACTIONS_PANEL_WIDTH : 0, PAGE_SPRING);
    drawerWidth.value = withSpring(isInsights ? INSIGHTS_PANEL_WIDTH : ACTIONS_PANEL_WIDTH, PAGE_SPRING);
  }, []);

  const handleActionPress = useCallback(
    (id: string) => {
      closeDrawer();
      onActionPress?.(id);
    },
    [closeDrawer, onActionPress]
  );



  const pillTapGesture = Gesture.Tap().onEnd(() => {
    if (!isOpen.value) openDrawer();
  });

  const pillPanGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD && !isOpen.value) openDrawer();
    });

  const pillGesture = Gesture.Simultaneous(pillTapGesture, pillPanGesture);

  const drawerPanGesture = Gesture.Pan()
    .activeOffsetX([-SWIPE_THRESHOLD, SWIPE_THRESHOLD])
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD) {
        if (activePage.value === 'actions') goToPage('insights');
      } else if (e.translationX > SWIPE_THRESHOLD) {
        if (activePage.value === 'insights') goToPage('actions');
        else closeDrawer();
      }
    });

  const overlayTapGesture = Gesture.Tap().onEnd(() => {
    closeDrawer();
  });



  const drawerAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: drawerTranslateX.value }],
    width: drawerWidth.value,
  }));

  const carouselAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: carouselTranslateX.value }],
  }));

  const overlayAnimStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isOpen.value ? 0.45 : 0, FADE_TIMING),
    pointerEvents: isOpen.value ? 'auto' : 'none',
  }));

  const pillAnimStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isOpen.value ? 0 : 1, FADE_TIMING),
  }));

  const actionsDotStyle = useAnimatedStyle(() => ({
    width: withSpring(activePage.value === 'actions' ? 16 : 6, PAGE_SPRING),
    opacity: withTiming(activePage.value === 'actions' ? 1 : 0.35, FADE_TIMING),
  }));

  const insightsDotStyle = useAnimatedStyle(() => ({
    width: withSpring(activePage.value === 'insights' ? 16 : 6, PAGE_SPRING),
    opacity: withTiming(activePage.value === 'insights' ? 1 : 0.35, FADE_TIMING),
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <GestureDetector gesture={overlayTapGesture}>
        <Animated.View style={[styles.overlay, overlayAnimStyle]} />
      </GestureDetector>

      <GestureDetector gesture={pillGesture}>
        <Animated.View style={[styles.pillContainer, pillAnimStyle]}>
          <View style={styles.pill} />
        </Animated.View>
      </GestureDetector>

      <GestureDetector gesture={drawerPanGesture}>
        <Animated.View style={[styles.drawer, drawerAnimStyle]}>
          <View style={styles.dotsRow}>
            <Animated.View style={[styles.dot, actionsDotStyle]} />
            <Animated.View style={[styles.dot, insightsDotStyle]} />
          </View>

          <Animated.View style={[styles.carousel, carouselAnimStyle]}>
            <ActionPanel
              actions={actions}
              visible={panelVisible}
              onActionPress={handleActionPress}
              width={ACTIONS_PANEL_WIDTH}
            />
            <InsightPanel visible={panelVisible} width={INSIGHTS_PANEL_WIDTH} />
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000a4',
},

  pillContainer: {
    position: 'absolute',
    right: PILL_INSET,
    top: PILL_VERTICAL_OFFSET,
    marginTop: -PILL_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  pill: {
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    borderRadius: PILL_WIDTH / 2,
    backgroundColor: '#ffffff3d',
  },
  drawer: {
    position: 'absolute',
    right: DRAWER_RIGHT_INSET,
    top: '12.5%',
    bottom: '12.5%',
    backgroundColor: '#131212',
    borderRadius: verticalScale(18),
    overflow: 'hidden',
    zIndex: 9,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: verticalScale(5),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(6),
  },
  dot: {
    height: verticalScale(6),
    borderRadius: verticalScale(3),
    backgroundColor: '#fff',
  },
  carousel: {
    flexDirection: 'row',
    flex: 1,
  },
});
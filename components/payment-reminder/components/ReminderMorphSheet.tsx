import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { CURRENCY_PREFIX } from '../constants/currency';
import { verticalScale } from '../constants/scaling';
import type { PillData, ReminderItem } from '../constants/types';

import {
  MorphContentLayer,
  MorphMeasureLayer,
  useMorphBox,
  useMorphSizeMap,
} from '../morph';
import AnimatedCounter from './AnimatedCounter';
import ReminderPill, { PILL_HEIGHT, PILL_MARGIN, PILL_START_Y, PILL_WIDTH } from './ReminderPill';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/** Expanded card width. Anchored on the pill's right edge, so the sheet grows leftward from it. */
const SHEET_WIDTH = SCREEN_WIDTH - PILL_MARGIN * 2;
/** Cap so a long list scrolls instead of overflowing the screen. */
const SHEET_MAX_HEIGHT = verticalScale(440);

// Matched to ProgressBar's `duration: 600` below so each row's amount count-up
// and its progress fill land in sync when the sheet opens. AnimatedCounter's
// own default (3000ms) was tuned for a single dramatic reveal (GravitySavings'
// balance readout) — much too slow for several rows animating at once here.
const ROW_AMOUNT_DURATION = 600;
const ROW_AMOUNT_DECIMALS = 0;

interface ReminderMorphSheetProps {
  readonly pill: PillData | null;
  readonly reminders: readonly ReminderItem[];
}

// ─── Progress Bar (inline — no extra dep needed) ──────────────────────────────

function ProgressBar({ progress }: { progress: number }) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(progress, { duration: 600 });
  }, [progress, width]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View style={styles.trackBar}>
      <Animated.View style={[styles.fillBar, barStyle]} />
    </View>
  );
}

// ─── Reminder Row ─────────────────────────────────────────────────────────────

const ReminderRow = memo(function ReminderRow({ item }: { item: ReminderItem }) {
  return (
    <View style={styles.row}>
      <Image source={item.contact.avatar} style={styles.avatar} />
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{item.contact.handle}</Text>
        <Text style={styles.rowDate}>{item.dateLabel}</Text>
      </View>

      <View style={styles.rowRight}>
        <AnimatedCounter
          value={parseFloat(item.amount)}
          decimals={ROW_AMOUNT_DECIMALS}
          duration={ROW_AMOUNT_DURATION}
          prefix={CURRENCY_PREFIX}
          style={styles.rowAmount}
        />
        <ProgressBar progress={item.progress} />
      </View>
    </View>
  );
});

// ─── ReminderMorphSheet ───────────────────────────────────────────────────────
// Owns the pill's position (so the morph box can track it), and morphs the
// reminders list out of / back into the pill instead of popping a modal.

const ReminderMorphSheet = memo(function ReminderMorphSheet({
  pill,
  reminders,
}: ReminderMorphSheetProps) {
  const [open, setOpen] = useState(false);

  const translateX = useSharedValue(SCREEN_WIDTH);
  const translateY = useSharedValue(PILL_START_Y);

  const { sizes, measure } = useMorphSizeMap();
  const { boxStyle, openProgress } = useMorphBox({
    activeKey: open ? 'sheet' : null,
    collapsedSize: { w: PILL_WIDTH, h: PILL_HEIGHT },
    sizes,
    mode: 'replace',
  });

  const handleToggle = useCallback(() => setOpen((value) => !value), []);
  const handleClose = useCallback(() => setOpen(false), []);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: openProgress.value,
  }));

  const boxPosition = useAnimatedStyle(() => ({
    top: translateY.value,
    right: SCREEN_WIDTH - translateX.value - PILL_WIDTH,
  }));

  const renderSheetContent = useCallback(
    () => (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Reminders</Text>
          <Text style={styles.cardCount}>{reminders.length}</Text>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        >
          {reminders.map((item) => (
            <ReminderRow key={item.id} item={item} />
          ))}
        </ScrollView>
      </View>
    ),
    [reminders]
  );

  const measureItems = useMemo(() => [{ key: 'sheet', render: renderSheetContent }], [renderSheetContent]);

  if (!pill) return null;

  return (
    <>
      <Pressable
        pointerEvents={open ? 'auto' : 'none'}
        onPress={handleClose}
        style={styles.backdrop}
      >
        <Animated.View style={[styles.backdropFill, backdropStyle]} />
      </Pressable>

      <View pointerEvents="box-none" style={styles.morphLayer}>
        <Animated.View style={[styles.box, boxStyle, boxPosition]}>
          <MorphContentLayer active={open} contentKey="sheet" direction={1} onMeasure={measure}>
            {renderSheetContent()}
          </MorphContentLayer>
        </Animated.View>

        <ReminderPill
          data={pill}
          onPress={handleToggle}
          translateX={translateX}
          translateY={translateY}
          draggable={!open}
        />
      </View>

      <MorphMeasureLayer items={measureItems} onMeasure={measure} />
    </>
  );
});

ReminderMorphSheet.displayName = 'ReminderMorphSheet';

export default ReminderMorphSheet;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 40,
  },
  backdropFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  morphLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  box: {
    position: 'absolute',
    backgroundColor: '#1f1e1e',
    borderRadius: verticalScale(28),
    overflow: 'hidden',
    zIndex: 50,
  },
  card: {
    width: SHEET_WIDTH,
    maxHeight: SHEET_MAX_HEIGHT,
    backgroundColor: '#141414',
    borderRadius: verticalScale(28),
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: verticalScale(20),
    paddingTop: verticalScale(18),
    paddingBottom: verticalScale(12),
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: verticalScale(16),
    fontFamily: 'SpaceGroteskSemiBold',
  },
  cardCount: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: verticalScale(14),
    fontFamily: 'SpaceGroteskMedium',
  },
  list: {
    flexShrink: 1,
  },
  listContent: {
    paddingHorizontal: verticalScale(20),
    paddingBottom: verticalScale(24),
    gap: verticalScale(22),
  },

  // ── Row ────────────────────────────────────────────────────────────────

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: verticalScale(12),
  },
  avatar: {
    width: verticalScale(48),
    height: verticalScale(48),
    borderRadius: verticalScale(24),
  },
  rowInfo: {
    flex: 1,
    gap: verticalScale(3),
  },
  rowName: {
    color: '#FFFFFF',
    fontSize: verticalScale(16),
    fontFamily: 'SpaceGroteskBold',
  },
  rowDate: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: verticalScale(13),
    fontFamily: 'SpaceGroteskMedium',
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: verticalScale(6),
  },
  rowAmount: {
    color: '#FFFFFF',
    fontSize: verticalScale(20),
    fontFamily: 'SpaceGroteskBold',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },

  // ── Progress bar ───────────────────────────────────────────────────────

  trackBar: {
    width: verticalScale(80),
    height: verticalScale(3),
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: verticalScale(2),
    overflow: 'hidden',
  },
  fillBar: {
    height: '100%',
    borderRadius: verticalScale(2),
    backgroundColor: '#FFFFFF',
  },
});

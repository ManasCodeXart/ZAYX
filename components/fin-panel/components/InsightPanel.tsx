import { StyleSheet, Text, View } from 'react-native';
import { verticalScale } from '../constants/scaling';
import { AnimatedStaggerItem } from './AnimatedStaggerItem';

const ENTER_DELAY = 80;

interface InsightPanelProps {
  readonly visible: boolean;
  readonly width: number;
}



/**
 * Second page of the drawer — intentionally blank. Swap this placeholder for
 * whatever fits your app: spending stats, subscriptions, contacts, a savings
 * streak, or anything else. Wrap your content in `AnimatedStaggerItem` (see
 * ActionPanel for the pattern) to keep the same entrance motion as the rest
 * of the drawer.
 */



export default function InsightPanel({ visible, width }: InsightPanelProps) {
  return (
    <View style={[styles.container, { width }]}>
      <AnimatedStaggerItem index={0} visible={visible} baseDelay={ENTER_DELAY}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderTitle}>Your Content Here</Text>
          <Text style={styles.placeholderSubtitle}>
            Stats, widgets, anything that fits your app.
          </Text>
        </View>
      </AnimatedStaggerItem>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: verticalScale(20),
  },
  placeholder: {
    alignItems: 'center',
    gap: verticalScale(6),
  },
  placeholderTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  placeholderSubtitle: {
    color: '#888',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: verticalScale(16),
  },
});
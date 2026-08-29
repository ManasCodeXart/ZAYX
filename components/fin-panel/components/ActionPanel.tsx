import { Image, StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { verticalScale } from '../constants/scaling';

import type { ActionItem } from '../constants/types';
import { AnimatedStaggerItem } from './AnimatedStaggerItem';

const ICON_SIZE = verticalScale(54);
const STAGGER_MS = 60;
const ENTER_DELAY = 80;

interface ActionPanelProps {
  readonly actions: readonly ActionItem[];
  readonly visible: boolean;
  readonly onActionPress: (id: string) => void;
  readonly width: number;
}

export default function ActionPanel({ actions, visible, onActionPress, width }: ActionPanelProps) {
  return (
    <View style={[styles.container, { width }]}>
      <Text style={styles.title}>Quick{'\n'}Actions</Text>
      <View style={styles.list}>
        {actions.map((action, index) => (
          <AnimatedStaggerItem
            key={action.id}
            index={index}
            visible={visible}
            baseDelay={ENTER_DELAY}
            staggerMs={STAGGER_MS}
          >
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => onActionPress(action.id)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={action.label}
            >
              <View style={styles.iconWrapper}>
                <Image source={action.icon} style={styles.icon} resizeMode="contain" />
              </View>
              <Text style={styles.label} numberOfLines={1}>
                {action.label}
              </Text>
            </TouchableOpacity>
          </AnimatedStaggerItem>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    paddingTop: verticalScale(15),
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: verticalScale(5),
  },
  list: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingBottom: verticalScale(8),
  },
  actionItem: {
    alignItems: 'center',
    gap: verticalScale(4),
  },
  iconWrapper: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: verticalScale(16),
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  label: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
});
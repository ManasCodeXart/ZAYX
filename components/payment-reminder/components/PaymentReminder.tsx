import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PROGRESS_WINDOW_DAYS } from '../constants/reminder';
import type { Contact, PillData, ReminderItem } from '../constants/types';
import ReminderCreateSheet from './ReminderCreateSheet';
import ReminderMorphSheet from './ReminderMorphSheet';

const DEFAULT_CONTACTS: readonly Contact[] = [
  { id: '1', avatar: require('../assets/images/avatar.png'), handle: 'ProyaX' },
  { id: '2', avatar: require('../assets/images/boy.png'), handle: 'RahultDev' },
  { id: '3', avatar: require('../assets/images/manas.png'), handle: 'ManasCodeX' },
  { id: '4', avatar: require('../assets/images/madara.png'), handle: 'Arjunp' },
  { id: '5', avatar: require('../assets/images/solara.png'), handle: 'Snehax' },
  { id: '6', avatar: require('../assets/images/girl.png'), handle: 'rayueik' },
  { id: '7', avatar: require('../assets/images/apex-chain.png'), handle: 'mahivhy' },
  { id: '8', avatar: require('../assets/images/girl2.png'), handle: 'vivi_14x' },
  { id: '9', avatar: require('../assets/images/girl3.png'), handle: 'morniSay' },
];


const EMPTY_REMINDERS: readonly ReminderItem[] = [];

function computeProgress(daysRemaining: number): number {
  if (daysRemaining <= 0) return 0.02;
  if (daysRemaining === 1) return 0.05;
  return Math.min(daysRemaining / PROGRESS_WINDOW_DAYS, 1);
}

export interface PaymentReminderProps {
  readonly contacts?: readonly Contact[];
  readonly initialIndex?: number;
  
  readonly initialReminders?: readonly ReminderItem[];
  
  readonly onReminderCreate?: (reminder: ReminderItem) => void;
}

export default function PaymentReminder({
  contacts = DEFAULT_CONTACTS,
  initialIndex = 3,
  initialReminders = EMPTY_REMINDERS,
  onReminderCreate,
}: PaymentReminderProps) {
  const [pill, setPill] = useState<PillData | null>(() => initialReminders[0] ?? null);
  const [reminders, setReminders] = useState<ReminderItem[]>(() => [...initialReminders]);

  const handlePillCreate = useCallback(
    (pillData: PillData) => {
      const reminder: ReminderItem = {
        ...pillData,
        id: Date.now().toString(),
        progress: computeProgress(pillData.daysRemaining),
      };

      setPill(pillData);
      setReminders((prev) => [reminder, ...prev]);
      onReminderCreate?.(reminder);
    },
    [onReminderCreate]
  );

  return (
    <GestureHandlerRootView style={styles.root}>
      <ReminderMorphSheet pill={pill} reminders={reminders} />

      <View style={styles.screen}>
        <ReminderCreateSheet
          contacts={contacts}
          initialIndex={initialIndex}
          buttonLabel="Set Reminder"
          onPillCreate={handlePillCreate}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#222121',
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

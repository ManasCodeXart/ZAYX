import { MORPH_SPRING } from "../constants/constants";
import { notifications } from "../constants/mockNotifications";
import { getProfileById } from "../constants/mockProfiles";
import { verticalScale } from "../constants/scaling";
import type { Notification, Profile } from "../constants/types";
import { useMorphBox } from "../hooks/useMorphBox";
import { useMorphSizeMap } from "../hooks/useMorphSizeMap";
import { Bell, CheckCircle } from "phosphor-react-native";
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { MorphContentLayer } from "./MorphContentLayer";
import { NotifMorphExpanded } from "./NotifMorphExpanded";
import { NotifMorphReply } from "./NotifMorphReply";

const PANEL_KEY = "bell-panel";
const EXPANDED_KEY = "bell-expanded";
const REPLY_KEY = "bell-reply";
const BADGE = verticalScale(38);
const PANEL_WIDTH = verticalScale(260);
const PANEL_MIN_HEIGHT = verticalScale(170);
const PANEL_RADIUS = verticalScale(40);
const EXPANDED_RADIUS = verticalScale(38);
const EXPANDED_WIDTH = verticalScale(300);
const EXPANDED_MARGIN = verticalScale(48);
const EXPANDED_MORPH_DURATION = 420;
const EXPANDED_CONTENT_DURATION = 260;
const EXPANDED_MORPH_EASING = Easing.bezier(0.2, 0.9, 0.25, 1);
const ACCENT_PURPLE = "#7C6CF6";
const ICON_GREY = "#6E6E73";
const VISIBLE_NOTIFICATION_COUNT = 3;
const NOTIFICATION_GAP = verticalScale(10);
const NOTIFICATION_LIST_FALLBACK_HEIGHT = verticalScale(190);
const COLLAPSED_SIZE = { w: BADGE, h: BADGE };
const TOAST_GAP = verticalScale(8);
const TOAST_HOLD_DURATION = 2100;
const BOX_SHADOW = `0px ${verticalScale(4)}px ${verticalScale(12)}px rgba(0, 0, 0, 0.16)`;
const TOAST_SHADOW = `0px ${verticalScale(4)}px ${verticalScale(8)}px rgba(0, 0, 0, 0.35)`;

type Stage = 0 | 1 | 2 | 3;

type NotifMorphProps = {
  anchorRight?: number;
  anchorTop?: number;
  centered?: boolean;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSend?: (text: string, notification: Notification) => void;
  triggerIcon?: ReactNode;
};

type NotifMorphToastProps = {
  id: number;
  text: string;
  onHidden: (id: number) => void;
};

type NotifMorphPanelProps = {
  onPress: (notification: Notification) => void;
  width: number;
};

function formatRelativeTime(timestamp: string): string {
  const time = new Date(timestamp).getTime();
  if (Number.isNaN(time)) return "";
  const minutes = Math.max(1, Math.floor((Date.now() - time) / 60000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function getNotificationCopy(notification: Notification): string {
  switch (notification.type) {
    case "like":
      return "liked your post";
    case "follow":
      return "followed you";
    case "reply":
      return `replying to ${notification.replyingToHandle}`;
  }
}

function NotifMorphToast({ id, text, onHidden }: NotifMorphToastProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(TOAST_GAP);

  useEffect(() => {
    opacity.value = withSpring(1, MORPH_SPRING);
    translateY.value = withSpring(0, MORPH_SPRING);

    const holdTimer = setTimeout(() => {
      opacity.value = withTiming(
        0,
        { duration: EXPANDED_CONTENT_DURATION, easing: EXPANDED_MORPH_EASING },
        (finished) => {
          if (finished) runOnJS(onHidden)(id);
        },
      );
    }, TOAST_HOLD_DURATION);

    return () => clearTimeout(holdTimer);
  }, [id, onHidden, opacity, translateY]);

  const toastStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, opacity.value),
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.toast, toastStyle]}>
      <View style={styles.toastDot} />
      <Text style={styles.toastText}>{text}</Text>
    </Animated.View>
  );
}

const NotifMorphPanel = memo(({ onPress, width }: NotifMorphPanelProps) => {
  const rowHeightsRef = useRef<Record<string, number>>({});
  const [visibleListHeight, setVisibleListHeight] = useState<number>();

  const handleRowLayout = (id: string, height: number) => {
    if (rowHeightsRef.current[id] === height) return;
    rowHeightsRef.current[id] = height;

    const visible = notifications.slice(0, VISIBLE_NOTIFICATION_COUNT);
    const heights = visible.map(
      (notification) => rowHeightsRef.current[notification.id] ?? 0,
    );
    if (heights.some((rowHeight) => rowHeight <= 0)) return;

    const next =
      heights.reduce((total, rowHeight) => total + rowHeight, 0) +
      NOTIFICATION_GAP * Math.max(0, visible.length - 1);

    setVisibleListHeight((current) => (current === next ? current : next));
  };

  return (
    <View style={[styles.panel, { width }]}>
      <View
        style={{
          height: visibleListHeight ?? NOTIFICATION_LIST_FALLBACK_HEIGHT,
        }}
      >
        <ScrollView
          contentContainerStyle={styles.rows}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          style={styles.list}
        >
          {notifications.map((notification) => {
            const actor = getProfileById(notification.actorId);
            if (!actor) return null;
            const meta = `@${actor.handle} • ${formatRelativeTime(notification.timestamp)}`;
            return (
              <Pressable
                key={notification.id}
                accessibilityLabel={`${actor.name} ${getNotificationCopy(notification)}`}
                accessibilityRole="button"
                onLayout={(event) =>
                  handleRowLayout(
                    notification.id,
                    event.nativeEvent.layout.height,
                  )
                }
                onPress={() => onPress(notification)}
                style={({ pressed }) => [
                  styles.row,
                  notification.type === "follow" && styles.rowFollow,
                  pressed && styles.rowPressed,
                ]}
              >
                <Image source={actor.avatarSource} style={styles.rowAvatar} />
                <View style={styles.rowContent}>
                  <View style={styles.nameRow}>
                    <Text style={styles.rowName}>{actor.name}</Text>
                    {actor.verified && (
                      <CheckCircle
                        size={verticalScale(14)}
                        color={ACCENT_PURPLE}
                        weight="fill"
                      />
                    )}
                    {notification.type === "follow" ? (
                      <Text style={styles.followText}>followed you</Text>
                    ) : (
                      <Text style={styles.meta}>{meta}</Text>
                    )}
                  </View>

                  {notification.type === "like" && (
                    <>
                      <View style={styles.actionRow}>
                        <Text style={styles.actionText}>Liked your post</Text>
                        <View style={styles.actionDot} />
                      </View>
                      <Text numberOfLines={2} style={styles.snippet}>
                        {notification.postSnippet}
                      </Text>
                    </>
                  )}

                  {notification.type === "reply" && (
                    <>
                      <Text style={styles.replyTo}>
                        replying to{" "}
                        <Text style={styles.mention}>
                          {notification.replyingToHandle}
                        </Text>
                      </Text>
                      <Text style={styles.replyText}>
                        {notification.replyText}
                      </Text>
                    </>
                  )}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
});

NotifMorphPanel.displayName = "NotifMorphPanel";

function NotifMorph({
  anchorRight = 0,
  anchorTop = 0,
  centered = false,
  open,
  onOpen,
  onClose,
  onSend,
  triggerIcon,
}: NotifMorphProps) {
  const { measure, sizes } = useMorphSizeMap();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const screenHeightShared = useSharedValue(screenHeight);
  const screenWidthShared = useSharedValue(screenWidth);

  useEffect(() => {
    screenHeightShared.value = screenHeight;
    screenWidthShared.value = screenWidth;
  }, [screenHeight, screenWidth, screenHeightShared, screenWidthShared]);
  const [trackedOpen, setTrackedOpen] = useState(open);
  const [stage, setStage] = useState<Stage>(open ? 1 : 0);
  const [activeProfile, setActiveProfile] = useState<Profile | undefined>();
  const [activeNotification, setActiveNotification] = useState<
    Notification | undefined
  >();
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const [showShadow, setShowShadow] = useState(open);
  const pendingToastRef = useRef<string | null>(null);
  const toastIdRef = useRef(0);

  const hideToast = useCallback((id: number) => {
    setToast((current) => (current?.id === id ? null : current));
  }, []);

  const handleCollapseComplete = useCallback(() => {
    setShowShadow(false);
    const text = pendingToastRef.current;
    if (!text) return;
    pendingToastRef.current = null;
    setToast({ id: toastIdRef.current++, text });
  }, []);

  if (open !== trackedOpen) {
    setTrackedOpen(open);
    setStage(open ? 1 : 0);
    if (open) {
      setShowShadow(true);
    } else {
      setActiveProfile(undefined);
      setActiveNotification(undefined);
    }
  }

  const availableWidth = centered
    ? Math.max(0, screenWidth - EXPANDED_MARGIN * 2)
    : screenWidth - anchorRight - EXPANDED_MARGIN;
  const expandedWidth =
    availableWidth >= PANEL_WIDTH
      ? Math.min(EXPANDED_WIDTH, availableWidth)
      : Math.max(0, availableWidth);

  const collapsedTop = centered ? (screenHeight - BADGE) / 2 : anchorTop;

  const hasProfile = activeProfile != null;
  const effectiveStage: Stage =
    hasProfile && stage === 3
      ? 3
      : hasProfile && stage === 2
        ? 2
        : stage === 1
          ? 1
          : 0;

  const activeKey =
    effectiveStage === 3
      ? REPLY_KEY
      : effectiveStage === 2
        ? EXPANDED_KEY
        : effectiveStage === 1
          ? PANEL_KEY
          : null;

  const { boxH, boxStyle, boxW, openProgress } = useMorphBox({
    activeKey,
    collapsedSize: COLLAPSED_SIZE,
    mode: "replace",
    onCollapseComplete: handleCollapseComplete,
    sizes,
    duration: effectiveStage >= 2 ? EXPANDED_MORPH_DURATION : undefined,
    easing: effectiveStage >= 2 ? EXPANDED_MORPH_EASING : undefined,
  });

  const centeredStyle = useAnimatedStyle(() => {
    const width = Math.max(boxW.value, BADGE);
    const height = Math.max(boxH.value, BADGE);
    return {
      left: (screenWidthShared.value - width) / 2,
      top: (screenHeightShared.value - height) / 2,
    };
  });

  const expandProgress = useSharedValue(0);

  useEffect(() => {
    expandProgress.value = withTiming(
      effectiveStage >= 2 ? 1 : 0,
      effectiveStage >= 2
        ? { duration: EXPANDED_MORPH_DURATION, easing: EXPANDED_MORPH_EASING }
        : { duration: 320, easing: EXPANDED_MORPH_EASING },
    );
  }, [effectiveStage, expandProgress]);

  const radiusStyle = useAnimatedStyle(() => ({
    borderRadius:
      interpolate(openProgress.value, [0, 1], [BADGE / 2, PANEL_RADIUS]) +
      expandProgress.value * (EXPANDED_RADIUS - PANEL_RADIUS),
  }));

  const bellStyle = useAnimatedStyle(() => ({
    opacity: 1 - openProgress.value,
    transform: [{ scale: 1 - openProgress.value * 0.35 }],
  }));

  const resetBell = () => {
    setStage(0);
    setActiveProfile(undefined);
    setActiveNotification(undefined);
    onClose();
  };

  const handleSend = (text: string) => {
    if (!activeNotification) return;
    onSend?.(text, activeNotification);
    pendingToastRef.current =
      activeNotification.type === "reply" ? "Reply sent" : "Message sent";
    resetBell();
  };

  const handleNotificationPress = (notification: Notification) => {
    const profile = getProfileById(notification.actorId);
    if (!profile) return;
    setActiveProfile(profile);
    setActiveNotification(notification);
    setStage(2);
  };

  const handleReplyPress = () => {
    if (stage === 2) setStage(3);
  };

  return (
    <View pointerEvents="box-none" style={styles.host}>
      <Animated.View
        style={[
          styles.shadow,
          showShadow && styles.shadowElevated,
          centered
            ? centeredStyle
            : { right: anchorRight, top: anchorTop },
          boxStyle,
          radiusStyle,
        ]}
      >
        <Animated.View
          style={[styles.box, StyleSheet.absoluteFill, radiusStyle]}
        >
          <Animated.View
            pointerEvents={effectiveStage === 0 ? "auto" : "none"}
            style={[StyleSheet.absoluteFill, styles.bellWrap, bellStyle]}
          >
            <Pressable
              accessibilityLabel="Notifications"
              accessibilityRole="button"
              onPress={onOpen}
              style={styles.bellHit}
            >
              {triggerIcon ?? (
                <Bell
                  size={verticalScale(20)}
                  color={ICON_GREY}
                  weight="regular"
                />
              )}
              <View style={styles.redDot} />
            </Pressable>
          </Animated.View>
          <MorphContentLayer
            active={effectiveStage === 1}
            contentKey={PANEL_KEY}
            direction={0}
            onMeasure={measure}
          >
            <NotifMorphPanel
              onPress={handleNotificationPress}
              width={PANEL_WIDTH}
            />
          </MorphContentLayer>
          {activeProfile && (
            <MorphContentLayer
              active={effectiveStage === 2}
              contentKey={EXPANDED_KEY}
              direction={0}
              duration={EXPANDED_CONTENT_DURATION}
              easing={EXPANDED_MORPH_EASING}
              onMeasure={measure}
            >
              <NotifMorphExpanded
                active={effectiveStage === 2}
                key={activeProfile.id}
                onPress={resetBell}
                onReplyPress={handleReplyPress}
                profile={activeProfile}
                width={expandedWidth}
              />
            </MorphContentLayer>
          )}
          {activeProfile && activeNotification && (
            <MorphContentLayer
              active={effectiveStage === 3}
              contentKey={REPLY_KEY}
              direction={0}
              duration={EXPANDED_CONTENT_DURATION}
              easing={EXPANDED_MORPH_EASING}
              onMeasure={measure}
            >
              <NotifMorphReply
                active={effectiveStage === 3}
                key={`${activeNotification.id}-reply`}
                notification={activeNotification}
                onPress={resetBell}
                onSend={handleSend}
                profile={activeProfile}
                width={expandedWidth}
              />
            </MorphContentLayer>
          )}
        </Animated.View>
      </Animated.View>
      {toast && (
        <View
          pointerEvents="none"
          style={[
            styles.toastHost,
            centered ? styles.toastHostCentered : { right: anchorRight },
            { top: collapsedTop + BADGE + TOAST_GAP },
          ]}
        >
          <NotifMorphToast
            id={toast.id}
            key={toast.id}
            onHidden={hideToast}
            text={toast.text}
          />
        </View>
      )}
    </View>
  );
}

export default memo(NotifMorph);

const styles = StyleSheet.create({
  host: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 20,
  },
  shadow: {
    backgroundColor: "transparent",
    minHeight: BADGE,
    minWidth: BADGE,
    position: "absolute",
  },
  shadowElevated: {
    boxShadow: BOX_SHADOW,
  },
  box: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.35)",
    borderColor: "#E5E5E5",
    borderWidth: verticalScale(1),
    justifyContent: "center",
    overflow: "hidden",
  },
  bellHit: {
    alignItems: "center",
    height: BADGE,
    justifyContent: "center",
    position: "relative",
    width: BADGE,
  },
  bellWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  redDot: {
    backgroundColor: "#FF3B30",
    borderRadius: verticalScale(7) / 2,
    height: verticalScale(7),
    position: "absolute",
    right: verticalScale(8),
    top: verticalScale(8),
    width: verticalScale(7),
  },
  toastHost: {
    position: "absolute",
    zIndex: 21,
  },
  toastHostCentered: {
    alignItems: "center",
    left: 0,
    right: 0,
  },
  toast: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E5E5",
    borderRadius: verticalScale(18),
    borderWidth: verticalScale(1),
    boxShadow: TOAST_SHADOW,
    flexDirection: "row",
    gap: verticalScale(6),
    paddingHorizontal: verticalScale(12),
    paddingVertical: verticalScale(8),
  },
  toastDot: {
    backgroundColor: ACCENT_PURPLE,
    borderRadius: verticalScale(4) / 2,
    height: verticalScale(4),
    width: verticalScale(4),
  },
  toastText: {
    color: "#111111",
    fontFamily: "ManropeSemiBold",
    fontSize: verticalScale(12),
  },
  panel: {
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    borderRadius: verticalScale(34),
    gap: verticalScale(20),
    minHeight: PANEL_MIN_HEIGHT,
    padding: verticalScale(20),
  },
  list: {
    flex: 1,
  },
  rows: {
    gap: NOTIFICATION_GAP,
  },
  row: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: verticalScale(10),
  },
  rowFollow: {
    alignItems: "center",
  },
  rowPressed: {
    opacity: 0.65,
  },
  rowAvatar: {
    borderRadius: verticalScale(28),
    height: verticalScale(40),
    width: verticalScale(40),
  },
  rowContent: {
    flex: 1,
    gap: verticalScale(2),
  },
  nameRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: verticalScale(2),
  },
  rowName: {
    color: "#111111",
    fontFamily: "ManropeSemiBold",
    fontSize: verticalScale(12),
  },
  followText: {
    color: "#111111",
    fontFamily: "ManropeRegular",
    fontSize: verticalScale(14),
  },
  meta: {
    color: "rgba(0,0,0,0.5)",
    fontFamily: "ManropeRegular",
    fontSize: verticalScale(9),
  },
  actionRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: verticalScale(6),
  },
  actionText: {
    color: "#111111",
    fontFamily: "ManropeRegular",
    fontSize: verticalScale(15),
  },
  actionDot: {
    backgroundColor: ACCENT_PURPLE,
    borderRadius: verticalScale(2),
    height: verticalScale(4),
    width: verticalScale(4),
  },
  snippet: {
    color: "rgba(0,0,0,0.55)",
    fontFamily: "ManropeRegular",
    fontSize: verticalScale(12),
    lineHeight: verticalScale(16),
  },
  replyTo: {
    color: "rgba(0,0,0,0.5)",
    fontFamily: "ManropeRegular",
    fontSize: verticalScale(12),
  },
  mention: {
    color: ACCENT_PURPLE,
    fontFamily: "ManropeMedium",
    fontSize: verticalScale(10),
  },
  replyText: {
    color: "#111111",
    fontFamily: "ManropeSemiBold",
    fontSize: verticalScale(13),
    lineHeight: verticalScale(20),
  },
});


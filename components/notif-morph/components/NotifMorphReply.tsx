import { MORPH_SPRING } from "../constants/constants";
import { verticalScale } from "../constants/scaling";
import type { Notification, Profile } from "../constants/types";
import {
  BellSlash,
  DotsThree,
  PaperPlaneTilt,
  SealCheck,
} from "phosphor-react-native";
import { memo, useEffect, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { MorphStaggerItem } from "./MorphStaggerItem";

const ACCENT_PURPLE = "#7C6CF6";
const PANEL_BACKGROUND = "rgba(255, 255, 255, 0.88)";
const REPLY_MIN_HEIGHT = verticalScale(180);

type NotifMorphReplyProps = {
  active: boolean;
  notification: Notification;
  onPress: () => void;
  onSend?: (text: string) => void;
  profile: Profile;
  width: number;
};

const NotifMorphReply = memo(function NotifMorphReply({
  active,
  notification,
  onPress,
  onSend,
  profile,
  width,
}: NotifMorphReplyProps) {
  const [replyInput, setReplyInput] = useState("");
  const [showSend, setShowSend] = useState(false);
  const hasReply = replyInput.trim().length > 0;
  const sendProgress = useSharedValue(0);

  useEffect(() => {
    if (hasReply) {
      setShowSend(true);
      sendProgress.value = withSpring(1, MORPH_SPRING);
      return;
    }
    sendProgress.value = withSpring(0, MORPH_SPRING, (finished) => {
      if (finished) runOnJS(setShowSend)(false);
    });
  }, [hasReply, sendProgress]);

  const sendStyle = useAnimatedStyle(() => ({
    opacity: sendProgress.value,
    transform: [{ scale: 0.7 + 0.3 * sendProgress.value }],
  }));

  const isReply = notification.type === "reply";

  return (
    <View style={[styles.panel, { width }]}>
      <Pressable
        accessibilityLabel="Close reply"
        accessibilityRole="button"
        onPress={onPress}
        style={StyleSheet.absoluteFill}
      />

      <View pointerEvents="box-none" style={styles.content}>
        <MorphStaggerItem active={active} index={0}>
          <View style={styles.header}>
            <Image source={profile.avatarSource} style={styles.avatar} />
            <View style={styles.headerText}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{profile.name}</Text>
                {profile.verified && (
                  <SealCheck
                    size={verticalScale(20)}
                    color={ACCENT_PURPLE}
                    weight="fill"
                  />
                )}
              </View>
            </View>

            <View style={styles.iconButtons}>
              <Pressable
                accessibilityLabel="Mute notifications"
                accessibilityRole="button"
                onPress={(event) => event.stopPropagation()}
                style={styles.iconButton}
              >
                <BellSlash
                  size={verticalScale(17)}
                  color="#9A9A9A"
                  weight="regular"
                />
              </Pressable>
              <Pressable
                accessibilityLabel="More options"
                accessibilityRole="button"
                onPress={(event) => event.stopPropagation()}
                style={styles.iconButton}
              >
                <DotsThree
                  size={verticalScale(19)}
                  color="#9A9A9A"
                  weight="bold"
                />
              </Pressable>
            </View>
          </View>
        </MorphStaggerItem>

        <MorphStaggerItem active={active} index={1}>
          <Text style={styles.replyingTo}>
            {isReply ? "replying to " : "Message to "}
            <Text style={styles.mention}>
              {isReply ? `@${profile.handle}` : profile.name}
            </Text>
          </Text>
        </MorphStaggerItem>

        {isReply ? (
          <MorphStaggerItem active={active} index={2}>
            <Text numberOfLines={3} style={styles.quote}>
              {notification.replyText}
            </Text>
          </MorphStaggerItem>
        ) : null}

        <MorphStaggerItem active={active} index={3}>
          <View style={styles.inputPill}>
            <TextInput
              accessibilityLabel="Reply"
              onChangeText={setReplyInput}
              placeholder={isReply ? "post your reply" : "Message"}
              placeholderTextColor="#8A8A8A"
              style={styles.input}
              value={replyInput}
            />
            {showSend && (
              <Animated.View style={[styles.sendWrap, sendStyle]}>
                <Pressable
                  accessibilityLabel="Send reply"
                  accessibilityRole="button"
                  onPress={(event) => {
                    event.stopPropagation();
                    const text = replyInput.trim();
                    if (!text) return;
                    onSend?.(text);
                  }}
                  style={styles.sendButton}
                >
                  <PaperPlaneTilt
                    size={verticalScale(18)}
                    color="#FFFFFF"
                    weight="fill"
                  />
                </Pressable>
              </Animated.View>
            )}
          </View>
        </MorphStaggerItem>
      </View>
    </View>
  );
});

NotifMorphReply.displayName = "NotifMorphReply";

export { NotifMorphReply };

const styles = StyleSheet.create({
  panel: {
    backgroundColor: PANEL_BACKGROUND,
    borderRadius: verticalScale(34),
    minHeight: REPLY_MIN_HEIGHT,
    padding: verticalScale(15),
  },
  content: {
    gap: verticalScale(10),
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: verticalScale(10),
  },
  avatar: {
    borderRadius: verticalScale(28),
    height: verticalScale(56),
    width: verticalScale(56),
  },
  headerText: {
    flex: 1,
  },
  nameRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: verticalScale(6),
  },
  name: {
    color: "#000000",
    flexShrink: 1,
    fontFamily: "ManropeBold",
    fontSize: verticalScale(15),
    lineHeight: verticalScale(20),
  },
  replyingTo: {
    color: "#353535",
    fontFamily: "ManropeRegular",
    fontSize: verticalScale(13),
  },
  mention: {
    color: ACCENT_PURPLE,
    fontFamily: "ManropeMedium",
  },
  iconButtons: {
    flexDirection: "row",
    gap: verticalScale(4),
  },
  iconButton: {
    alignItems: "center",
    borderColor: "#d6d6d6",
    borderRadius: verticalScale(20),
    borderWidth: verticalScale(1),
    height: verticalScale(26),
    justifyContent: "center",
    width: verticalScale(26),
  },
  quote: {
    color: "#272727",
    fontFamily: "ManropeBold",
    fontSize: verticalScale(16),
    lineHeight: verticalScale(22),
  },
  inputPill: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#dfdfdf",
    borderRadius: verticalScale(24),
    borderWidth: verticalScale(1),
    flexDirection: "row",
    minHeight: verticalScale(48),
    paddingLeft: verticalScale(16),
    paddingRight: verticalScale(5),
  },
  input: {
    color: "#252525",
    flex: 1,
    fontFamily: "ManropeRegular",
    fontSize: verticalScale(14),
    paddingHorizontal: 0,
    paddingVertical: verticalScale(10),
  },
  sendWrap: {
    marginLeft: verticalScale(6),
  },
  sendButton: {
    alignItems: "center",
    backgroundColor: ACCENT_PURPLE,
    borderRadius: verticalScale(38) / 2,
    height: verticalScale(38),
    justifyContent: "center",
    width: verticalScale(38),
  },
});

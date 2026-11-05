import { getProfileById } from "../constants/mockProfiles";
import { verticalScale } from "../constants/scaling";
import type { Profile } from "../constants/types";
import {
  BellSlash,
  ChatCircle,
  DotsThree,
  SealCheck,
} from "phosphor-react-native";
import { memo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { MorphStaggerItem } from "./MorphStaggerItem";

const EXPANDED_MIN_HEIGHT = verticalScale(240);
const ACCENT_PURPLE = "#7C6CF6";
const PANEL_BACKGROUND = "rgba(255, 255, 255, 0.88)";
const MUTUAL_AVATAR_BORDER = "#FFFFFF";

const UNIT_ROLLOVER = 999.5;

type NotifMorphExpandedProps = {
  active: boolean;
  onPress: () => void;
  onReplyPress: () => void;
  profile: Profile;
  width: number;
};

function formatCount(value: number): string {
  if (value < 1_000) return `${value}`;

  const unit =
    value < UNIT_ROLLOVER * 1_000
      ? { divisor: 1_000, suffix: "k" }
      : value < UNIT_ROLLOVER * 1_000_000
        ? { divisor: 1_000_000, suffix: "M" }
        : { divisor: 1_000_000_000, suffix: "B" };

  const short = value / unit.divisor;
  const display =
    short >= 10 ? Math.round(short) : short.toFixed(1).replace(".0", "");
  return `${display}${unit.suffix}`;
}

const NotifMorphExpanded = memo(function NotifMorphExpanded({
  active,
  onPress,
  onReplyPress,
  profile,
  width,
}: NotifMorphExpandedProps) {
  const [isFollowing, setIsFollowing] = useState(profile.isFollowing);

  const mutualProfiles = profile.mutualFollowers.previewIds
    .map((id) => getProfileById(id))
    .filter((mutual): mutual is Profile => Boolean(mutual));

  const mutualNames = mutualProfiles
    .map((mutual) => mutual.name.split(" ")[0])
    .join(", ");

  const mutualRemainder = Math.max(
    0,
    profile.mutualFollowers.totalCount - mutualProfiles.length,
  );
  const mutualLabel =
    mutualRemainder > 0
      ? `followed by ${mutualNames} and ${mutualRemainder} ${
          mutualRemainder === 1 ? "other" : "others"
        }`
      : `followed by ${mutualNames}`;

  return (
    <View style={[styles.panel, { width }]}>
      <Pressable
        accessibilityLabel="Close notifications"
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
                <Text numberOfLines={1} style={styles.name}>
                  {profile.name}
                </Text>
                {profile.verified && (
                  <SealCheck
                    size={verticalScale(25)}
                    color={ACCENT_PURPLE}
                    weight="fill"
                  />
                )}
              </View>
              <Text numberOfLines={1} style={styles.handle}>
                @{profile.handle}
              </Text>
            </View>
          </View>
        </MorphStaggerItem>

        {profile.bio.length > 0 && (
          <MorphStaggerItem active={active} index={1}>
            <Text numberOfLines={2} style={styles.bio}>
              {profile.bio}
            </Text>
          </MorphStaggerItem>
        )}

        <MorphStaggerItem active={active} index={2}>
          <View style={styles.stats}>
            <Text style={styles.stat}>
              <Text style={styles.statValue}>
                {formatCount(profile.followers)}
              </Text>{" "}
              followers
            </Text>
            <Text style={styles.stat}>
              <Text style={styles.statValue}>
                {formatCount(profile.following)}
              </Text>{" "}
              following
            </Text>
          </View>
        </MorphStaggerItem>

        {mutualProfiles.length > 0 && (
          <MorphStaggerItem active={active} index={3}>
            <View style={styles.mutualRow}>
              <View style={styles.mutualAvatars}>
                {mutualProfiles.map((mutual, index) => (
                  <Image
                    key={mutual.id}
                    source={mutual.avatarSource}
                    style={[
                      styles.mutualAvatar,
                      index > 0 && styles.mutualAvatarOverlap,
                    ]}
                  />
                ))}
              </View>
              <Text numberOfLines={2} style={styles.mutualText}>
                {mutualLabel}
              </Text>
            </View>
          </MorphStaggerItem>
        )}

        <MorphStaggerItem active={active} index={4}>
          <View style={styles.actionRow}>
            <Pressable
              accessibilityLabel={isFollowing ? "Unfollow" : "Follow"}
              accessibilityRole="button"
              onPress={(event) => {
                event.stopPropagation();
                setIsFollowing((current) => !current);
              }}
              style={[
                styles.followButton,
                isFollowing && styles.followingButton,
              ]}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.followText,
                  isFollowing && styles.followingText,
                ]}
              >
                {isFollowing ? "Following" : "Follow"}
              </Text>
            </Pressable>

            <View style={styles.iconButtons}>
              <Pressable
                accessibilityLabel="More options"
                accessibilityRole="button"
                onPress={(event) => event.stopPropagation()}
                style={styles.iconButton}
              >
                <DotsThree
                  size={verticalScale(22)}
                  color="#6E6E73"
                  weight="bold"
                />
              </Pressable>
              <Pressable
                accessibilityLabel="Message"
                accessibilityRole="button"
                onPress={(event) => {
                  event.stopPropagation();
                  onReplyPress();
                }}
                style={styles.iconButton}
              >
                <ChatCircle
                  size={verticalScale(20)}
                  color="#6E6E73"
                  weight="regular"
                />
              </Pressable>
              <Pressable
                accessibilityLabel="Mute notifications"
                accessibilityRole="button"
                onPress={(event) => event.stopPropagation()}
                style={styles.iconButton}
              >
                <BellSlash
                  size={verticalScale(20)}
                  color="#6E6E73"
                  weight="regular"
                />
              </Pressable>
            </View>
          </View>
        </MorphStaggerItem>
      </View>
    </View>
  );
});

NotifMorphExpanded.displayName = "NotifMorphExpanded";

export { NotifMorphExpanded };

const styles = StyleSheet.create({
  panel: {
    backgroundColor: PANEL_BACKGROUND,
    borderRadius: verticalScale(34),
    minHeight: EXPANDED_MIN_HEIGHT,
    padding: verticalScale(15),
  },
  content: {
    gap: verticalScale(8),
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: verticalScale(16),
  },
  avatar: {
    borderRadius: verticalScale(46),
    height: verticalScale(62),
    width: verticalScale(62),
  },
  headerText: {
    flex: 1,
  },
  nameRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: verticalScale(8),
  },
  name: {
    color: "#111111",
    flexShrink: 1,
    fontFamily: "ManropeBold",
    fontSize: verticalScale(18),
    lineHeight: verticalScale(25),
  },
  handle: {
    color: "#6E6E73",
    fontFamily: "ManropeRegular",
    fontSize: verticalScale(16),
  },
  bio: {
    color: "#111111",
    fontFamily: "ManropeRegular",
    fontSize: verticalScale(14),
    lineHeight: verticalScale(18),
  },
  stats: {
    alignItems: "center",
    flexDirection: "row",
    gap: verticalScale(8),
  },
  stat: {
    color: "#6E6E73",
    fontFamily: "ManropeRegular",
    fontSize: verticalScale(14),
  },
  statValue: {
    color: "#111111",
    fontFamily: "ManropeSemiBold",
    fontSize: verticalScale(14),
  },
  mutualRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: verticalScale(12),
  },
  mutualAvatars: {
    flexDirection: "row",
    flexShrink: 0,
  },
  mutualAvatar: {
    borderColor: MUTUAL_AVATAR_BORDER,
    borderRadius: verticalScale(16),
    borderWidth: verticalScale(2),
    height: verticalScale(32),
    width: verticalScale(32),
  },
  mutualAvatarOverlap: {
    marginLeft: -verticalScale(10),
  },
  mutualText: {
    color: "rgba(0,0,0,0.6)",
    flex: 1,
    fontFamily: "ManropeRegular",
    fontSize: verticalScale(14),
    lineHeight: verticalScale(20),
  },
  actionRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: verticalScale(10),
    marginTop: verticalScale(4),
  },
  followButton: {
    alignItems: "center",
    backgroundColor: "#111111",
    borderRadius: verticalScale(25),
    flex: 1,
    justifyContent: "center",
    minHeight: verticalScale(50),
    paddingHorizontal: verticalScale(8),
  },
  followingButton: {
    backgroundColor: "transparent",
    borderColor: "#DADADA",
    borderWidth: verticalScale(1),
  },
  followText: {
    color: "#FFFFFF",
    fontFamily: "ManropeBold",
    fontSize: verticalScale(15),
  },
  followingText: {
    color: "#111111",
  },
  iconButtons: {
    flexDirection: "row",
    gap: verticalScale(4),
  },
  iconButton: {
    alignItems: "center",
    borderColor: "#E5E5E5",
    borderRadius: verticalScale(20),
    borderWidth: verticalScale(1),
    height: verticalScale(30),
    justifyContent: "center",
    width: verticalScale(30),
  },
});

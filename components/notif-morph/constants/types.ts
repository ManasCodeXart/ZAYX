import type { ImageSourcePropType } from "react-native";
import type { EasingFunctionFactory } from "react-native-reanimated";

export interface MorphSize {
  readonly w: number;
  readonly h: number;
}

export type MorphSizeMap = Record<string, MorphSize>;

export type MorphMode = "stack" | "replace";

export interface UseMorphBoxOptions {
  activeKey: string | null;
  sizes: MorphSizeMap;
  collapsedSize: MorphSize;
  mode?: MorphMode;
  minWidth?: number;
  duration?: number;
  easing?: EasingFunctionFactory;
  onCollapseComplete?: () => void;
}

export interface UseMorphContentOptions {
  active: boolean;
  direction?: -1 | 0 | 1;
  duration?: number;
  easing?: EasingFunctionFactory;
  slideDistance?: number;
}

export type Profile = {
  readonly id: string;
  readonly name: string;
  readonly handle: string;
  readonly avatarSource: ImageSourcePropType;
  readonly verified: boolean;
  readonly bio: string;
  readonly followers: number;
  readonly following: number;
  readonly isFollowing: boolean;
  readonly mutualFollowers: {
    readonly previewIds: readonly string[];
    readonly totalCount: number;
  };
};

export type NotificationType = "like" | "follow" | "reply";

interface NotificationBase {
  id: string;
  actorId: string;
  timestamp: string;
  read: boolean;
}

type NotificationVariant<T extends NotificationType> = NotificationBase & {
  type: T;
};

export type Notification =
  | (NotificationVariant<"like"> & { postSnippet: string })
  | NotificationVariant<"follow">
  | (NotificationVariant<"reply"> & {
      replyText: string;
      replyingToHandle: string;
    });

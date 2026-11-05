import { Image } from "expo-image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { CoinPicker } from "../components/CoinPicker";
import { COINS } from "../constants/coins";
import { verticalScale } from "../constants/scaling";
import type { ThemeName } from "../constants/theme";
import type {
  CardBounds,
  Coin,
  CryptoSwitchProps,
  PickerTarget,
} from "../constants/types";
import { useAmountCaret, useAmountTypography } from "../hooks/useAmountDisplay";
import { useAnimatedTheme } from "../hooks/useAnimatedTheme";
import { useCardSwap } from "../hooks/useCardSwap";
import { useQuote } from "../hooks/useQuote";
import { formatAmount, MAX_AMOUNT_INPUT_LENGTH, parseAmount, sanitizeAmountInput } from "../utils/amount";
import { getCoinIconUrl } from "../utils/coinIcon";
import { findCoinBySymbol } from "../utils/coins";

import { CoinPill } from "./CoinPill";
import { ThemedSwapIcon } from "./SwapIcon";
import { ThemeToggleIcon } from "./ThemeToggleIcon";

const DEFAULT_SEND_AMOUNT = "1";
const DEFAULT_SPREAD = 0.003;
const DEFAULT_SWAP_ICON_SIZE = verticalScale(16);
const DEFAULT_FROM_COIN_SYMBOL = "BTC";
const DEFAULT_TO_COIN_SYMBOL = "ETH";
const FALLBACK_CARD_HEIGHT = verticalScale(150);

const CARD_REAPPEAR_FADE_DURATION = 800;

const QUOTE_UPDATE_FADE_DURATION = 900;

const THEME_TRANSITION_DURATION = 280;
const DEFAULT_THEME_ICON_SIZE = verticalScale(18);

export function CryptoSwitch({
  coins = COINS,
  defaultFromCoin,
  defaultToCoin,
  defaultSendAmount = DEFAULT_SEND_AMOUNT,
  spread = DEFAULT_SPREAD,
  prices,
  swapIcon,
  style,
  theme,
  onAmountChange,
  onCoinChange,
  onSend,
  onThemeChange,
}: CryptoSwitchProps) {
  const [activeField, setActiveField] = useState<"send" | "receive">("send");
  const [activeAmount, setActiveAmount] = useState(defaultSendAmount);
  const [fromCoin, setFromCoin] = useState<Coin>(
    () =>
      defaultFromCoin ??
      findCoinBySymbol(coins, DEFAULT_FROM_COIN_SYMBOL) ??
      coins[0]
  );
  const [toCoin, setToCoin] = useState<Coin>(
    () =>
      defaultToCoin ??
      findCoinBySymbol(coins, DEFAULT_TO_COIN_SYMBOL) ??
      coins[0]
  );
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>("from");
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerBounds, setPickerBounds] = useState<CardBounds | null>(null);
  const [focusedField, setFocusedField] = useState<"send" | "receive" | null>(null);

  const [pickerHasOpened, setPickerHasOpened] = useState(false);

  const [internalDark, setInternalDark] = useState(false);
  const isDark = theme !== undefined ? theme === "dark" : internalDark;

  const themeProgress = useSharedValue(isDark ? 1 : 0);

  useEffect(() => {
    themeProgress.value = withTiming(isDark ? 1 : 0, {
      duration: THEME_TRANSITION_DURATION,
      easing: Easing.inOut(Easing.quad),
    });
  }, [isDark, themeProgress]);

  const animatedTheme = useAnimatedTheme(themeProgress);

  const handleThemeToggle = useCallback(() => {
    const next: ThemeName = isDark ? "light" : "dark";
    if (theme === undefined) {
      setInternalDark(next === "dark");
    }
    onThemeChange?.(next);
  }, [isDark, theme, onThemeChange]);

  const fromCardRef = useRef<View | null>(null);
  const toCardRef = useRef<View | null>(null);

  const {
    measureFirstCard,
    measureSecondCard,
    triggerSwap,
    isSwapping,
    firstCardStyle,
    secondCardStyle,
  } = useCardSwap();

  const {
    firstLoad,
    isQuotePending,
    effectiveRate,
    numericSendAmount,
    displaySendAmount,
    receiveAmount,
    isSendDimmed,
    isReceiveDimmed,
    sendVisibleAmount,
    receiveVisibleAmount,
    payValueUsd,
    receiveValueUsd,
    quoteTransitionKey,
  } = useQuote({
    fromCoin,
    toCoin,
    spread,
    prices,
    activeField,
    activeAmount,
  });

  const quoteEntering = FadeIn.duration(QUOTE_UPDATE_FADE_DURATION).easing(
    Easing.out(Easing.quad)
  );

  const cardEntering = pickerHasOpened
    ? undefined
    : FadeIn.duration(CARD_REAPPEAR_FADE_DURATION).easing(
        Easing.out(Easing.quad)
      );

  const sendTypography = useAmountTypography(sendVisibleAmount);
  const receiveTypography = useAmountTypography(receiveVisibleAmount);
  const sendCaretStyle = useAmountCaret(sendTypography.fontSize, focusedField === "send");
  const receiveCaretStyle = useAmountCaret(receiveTypography.fontSize, focusedField === "receive");

  const openPicker = useCallback((target: PickerTarget) => {
    Keyboard.dismiss();
    requestIdleCallback(() => {
      const openWithBounds = (bounds: CardBounds) => {
        setPickerBounds(bounds);
        setPickerTarget(target);
        setPickerVisible(true);
        setPickerHasOpened(true);
      };
      const fallbackBounds = (): CardBounds => ({
        topHeight: FALLBACK_CARD_HEIGHT,
        bottomHeight: FALLBACK_CARD_HEIGHT,
        unionHeight: FALLBACK_CARD_HEIGHT * 2,
      });
      if (!fromCardRef.current || !toCardRef.current) {
        openWithBounds(fallbackBounds());
        return;
      }
      fromCardRef.current.measureInWindow((fromX, fromY, fromW, fromH) => {
        if (!toCardRef.current) {
          openWithBounds(fallbackBounds());
          return;
        }
        toCardRef.current.measureInWindow((toX, toY, toW, toH) => {
          const topHeight = fromH > 0 ? fromH : FALLBACK_CARD_HEIGHT;
          const bottomHeight = toH > 0 ? toH : FALLBACK_CARD_HEIGHT;
          const unionTop = Math.min(fromY, toY);
          const unionBottom = Math.max(fromY + fromH, toY + toH);
          const unionHeight =
            unionBottom - unionTop > 0
              ? unionBottom - unionTop
              : topHeight + bottomHeight;
          openWithBounds({ topHeight, bottomHeight, unionHeight });
        });
      });
    });
  }, []);

  const closePicker = useCallback(() => setPickerVisible(false), []);

  const openFromPicker = useCallback(() => openPicker("from"), [openPicker]);
  const openToPicker = useCallback(() => openPicker("to"), [openPicker]);

  useEffect(() => {
    for (const coin of coins) {
      Image.prefetch(getCoinIconUrl(coin.symbol)).catch(() => {});
    }
  }, [coins]);

  const { width, height } = useWindowDimensions();

  const isKeyboardVisibleRef = useRef(Keyboard.isVisible());

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      isKeyboardVisibleRef.current = true;
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      isKeyboardVisibleRef.current = false;
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (pickerVisible && !isKeyboardVisibleRef.current) {
      setTimeout(() => setPickerVisible(false), 0);
    }

  }, [width, height]);

  const handleAmountChange = useCallback(
    (field: "send" | "receive", text: string) => {
      const sanitized = sanitizeAmountInput(text);
      setActiveField(field);
      setActiveAmount(sanitized);

      if (field === "send") {
        onAmountChange?.(sanitized);
      } else if (!firstLoad && effectiveRate) {
        const impliedSend = parseAmount(sanitized) / effectiveRate;
        onAmountChange?.(formatAmount(impliedSend));
      }
    },
    [onAmountChange, firstLoad, effectiveRate]
  );

  const handleAmountFocus = useCallback(
    (field: "send" | "receive") => {
      setFocusedField(field);
      setActiveField((prevActiveField) => {
        if (prevActiveField === field) return prevActiveField;

        const next =
          field === "send" ? displaySendAmount : (receiveAmount ?? "0.00");
        setActiveAmount(next === "0" || next === "0.00" ? "" : next);
        return field;
      });
    },
    [displaySendAmount, receiveAmount]
  );

  const handleAmountBlur = useCallback(() => {
    setFocusedField(null);
  }, []);

  const handleCoinSelect = useCallback(
    (selected: Coin) => {
      const nextFrom = pickerTarget === "from" ? selected : fromCoin;
      const nextTo = pickerTarget === "to" ? selected : toCoin;

      setFromCoin(nextFrom);
      setToCoin(nextTo);
      onCoinChange?.(nextFrom, nextTo);
    },
    [pickerTarget, fromCoin, toCoin, onCoinChange]
  );

  const handleSwap = useCallback(() => {
    const nextFrom = toCoin;
    const nextTo = fromCoin;

    setFromCoin(nextFrom);
    setToCoin(nextTo);
    onCoinChange?.(nextFrom, nextTo);

    setActiveField("send");
    setActiveAmount(displaySendAmount);

    triggerSwap();
  }, [fromCoin, toCoin, onCoinChange, triggerSwap, displaySendAmount]);

  const handleSend = useCallback(() => {
    onSend?.({ amount: numericSendAmount, from: fromCoin, to: toCoin });
  }, [onSend, numericSendAmount, fromCoin, toCoin]);

  return (
    <Animated.View style={[styles.root, animatedTheme.rootStyle, style]}>
      <View style={styles.themeToggleRow}>
        <TouchableOpacity onPress={handleThemeToggle} activeOpacity={0.7}>
          <Animated.View
            style={[styles.themeToggleButton, animatedTheme.swapButtonStyle]}
          >
            <ThemeToggleIcon
              isDark={isDark}
              size={DEFAULT_THEME_ICON_SIZE}
              color={isDark ? "#FFFFFF" : "#111111"}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
      <View style={styles.stackContainer}>
        {pickerVisible && pickerBounds ? (
          <CoinPicker
            target={pickerTarget}
            title={pickerTarget === "from" ? "You pay" : "You receive"}
            bounds={pickerBounds}
            selectedSymbol={pickerTarget === "from" ? fromCoin.symbol : toCoin.symbol}
            coins={coins}
            swapIcon={swapIcon}
            veil={{
              sendAmount: displaySendAmount,
              receiveAmount: receiveAmount ?? "0.00",
              payUsd: `$${payValueUsd.toFixed(2)}`,
              receiveUsd: `$${receiveValueUsd.toFixed(2)}`,
            }}
            themeProgress={themeProgress}
            onSelect={handleCoinSelect}
            onClose={closePicker}
          />
        ) : (
          <>
        <Animated.View
          entering={cardEntering}
          style={[styles.cardBox, firstCardStyle, animatedTheme.cardStyle]}
          onLayout={measureFirstCard}
          ref={fromCardRef}
        >
          <View style={styles.leftColumn}>
            <Animated.Text
              style={[styles.selectorLabel, animatedTheme.secondaryTextStyle]}
            >
              You pay
            </Animated.Text>
            <View style={styles.amountWrapper}>
              <View style={styles.amountInputContainer}>
                {/* Wrapper carries the quote fade (opacity animation);
                    inner Text carries placeholder opacity. Keeping both
                    opacities on one Animated.Text triggers Reanimated's
                    "opacity may be overwritten by a layout animation"
                    warning. */}
                <Animated.View
                  key={quoteTransitionKey}
                  entering={quoteEntering}
                  style={styles.amountTextWrapper}
                >
                  <Animated.Text
                    style={[
                      styles.amountInput,
                      sendTypography.amountStyle,
                      animatedTheme.primaryTextStyle,
                      // Static grey after animated color, plus opacity (not
                      // animated) so the placeholder is visible even if the
                      // UI-thread color wins.
                      isSendDimmed ? styles.amountPlaceholder : undefined,
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="clip"
                  >
                    {sendVisibleAmount}
                  </Animated.Text>
                </Animated.View>
                {focusedField === "send" ? (
                  <Animated.View
                    style={[
                      styles.amountCaret,
                      sendCaretStyle,
                      animatedTheme.caretColorStyle,
                    ]}
                  />
                ) : null}
                <TextInput
                  style={styles.amountInputHidden}
                  value={activeField === "send" ? activeAmount : displaySendAmount}
                  onChangeText={(text) => handleAmountChange("send", text)}
                  onFocus={() => handleAmountFocus("send")}
                  onBlur={handleAmountBlur}
                  keyboardType="decimal-pad"
                  maxLength={MAX_AMOUNT_INPUT_LENGTH}
                  selectionColor="#4A90FF"
                  caretHidden
                />
              </View>
            </View>
            <Animated.Text
              key={quoteTransitionKey}
              entering={quoteEntering}
              style={[
                styles.usdLine,
                animatedTheme.secondaryTextStyle,
                isQuotePending ? styles.usdPending : undefined,
              ]}
              numberOfLines={1}
              ellipsizeMode="clip"
            >
              ${payValueUsd.toFixed(2)}
            </Animated.Text>
          </View>

          <CoinPill
            coin={fromCoin}
            onPress={openFromPicker}
            themeProgress={themeProgress}
          />
        </Animated.View>

        <Animated.View
          entering={cardEntering}
          style={styles.swapGap}
        >
          <TouchableOpacity onPress={handleSwap} disabled={isSwapping} activeOpacity={0.7}>
            <Animated.View style={[styles.swapButton, animatedTheme.swapButtonStyle]}>
              {swapIcon ?? (
                <ThemedSwapIcon
                  progress={themeProgress}
                  size={DEFAULT_SWAP_ICON_SIZE}
                />
              )}
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          entering={cardEntering}
          style={[styles.cardBox, styles.receiveCard, secondCardStyle, animatedTheme.cardStyle]}
          onLayout={measureSecondCard}
          ref={toCardRef}
        >
          <View style={styles.leftColumn}>
            <Animated.Text
              style={[styles.selectorLabel, animatedTheme.secondaryTextStyle]}
            >
              You receive
            </Animated.Text>
            <View style={styles.amountWrapper}>
              <View style={styles.amountInputContainer}>
                {

}
                <Animated.View
                  key={quoteTransitionKey}
                  entering={quoteEntering}
                  style={styles.amountTextWrapper}
                >
                  <Animated.Text
                    style={[
                      styles.amountDisplay,
                      receiveTypography.amountStyle,
                      animatedTheme.primaryTextStyle,

                      isReceiveDimmed
                        ? styles.amountPlaceholder
                        : undefined,
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="clip"
                  >
                    {receiveVisibleAmount}
                  </Animated.Text>
                </Animated.View>
                {focusedField === "receive" ? (
                  <Animated.View
                    style={[
                      styles.amountCaret,
                      receiveCaretStyle,
                      animatedTheme.caretColorStyle,
                    ]}
                  />
                ) : null}
                <TextInput
                  style={styles.amountInputHidden}
                  value={activeField === "receive" ? activeAmount : (receiveAmount ?? "0.00")}
                  onChangeText={(text) => handleAmountChange("receive", text)}
                  onFocus={() => handleAmountFocus("receive")}
                  onBlur={handleAmountBlur}
                  keyboardType="decimal-pad"
                  maxLength={MAX_AMOUNT_INPUT_LENGTH}
                  selectionColor="#4A90FF"
                  editable={!isQuotePending || activeField === "receive"}
                  caretHidden
                />
              </View>
            </View>
            <Animated.Text
              key={quoteTransitionKey}
              entering={quoteEntering}
              style={[
                styles.usdLine,
                animatedTheme.secondaryTextStyle,
                isQuotePending ? styles.usdPending : undefined,
              ]}
              numberOfLines={1}
              ellipsizeMode="clip"
            >
              ${receiveValueUsd.toFixed(2)}
            </Animated.Text>
          </View>

          <CoinPill
            coin={toCoin}
            onPress={openToPicker}
            themeProgress={themeProgress}
          />
        </Animated.View>
          </>
        )}
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleSend}
      >
        <Animated.View style={[styles.sendButton, animatedTheme.sendButtonStyle]}>
          <Animated.Text style={[styles.sendText, animatedTheme.sendTextStyle]}>
            Send
          </Animated.Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export type { CryptoSwitchProps };

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: verticalScale(20),
    paddingTop: verticalScale(60),
  },

  themeToggleRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: verticalScale(8),
  },
  themeToggleButton: {
    width: verticalScale(38),
    height: verticalScale(38),
    borderRadius: verticalScale(19),
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
  },
  stackContainer: {},
  cardBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: verticalScale(36),
    paddingHorizontal: verticalScale(20),
    paddingVertical: verticalScale(18),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 2,
    marginBottom: verticalScale(8),
    boxShadow: "0 12px 16px rgba(0, 0, 0, 0.08)",
  },
  receiveCard: {
    zIndex: 1,
  },
  swapGap: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    marginVertical: -verticalScale(19),
  },
  amountWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    width: "100%",
    flexShrink: 1,
    minWidth: 0,
  },
  amountInput: {
    color: "#111111",
    fontSize: verticalScale(30),
    fontFamily: "SpaceGroteskMedium",
    padding: 0,
    flexShrink: 1,
    minWidth: 0,
  },
  amountInputContainer: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    position: "relative",
    flexDirection: "row",
    alignItems: "flex-end",
  },

  amountTextWrapper: {
    flexShrink: 1,
    minWidth: 0,
  },
  amountCaret: {
    width: 2,
    backgroundColor: "#111111",
    marginLeft: verticalScale(1),
    marginBottom: verticalScale(8),
  },
  amountInputHidden: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
  },
  amountDisplay: {
    color: "#111111",
    fontSize: verticalScale(30),
    fontFamily: "SpaceGroteskMedium",
    padding: 0,
    flexShrink: 1,
    minWidth: 0,
  },

  amountPlaceholder: {
    color: "#BDBDBD",
    opacity: 0.55,
  },
  usdPending: {
    color: "#D2D2D2",
  },
  usdLine: {
    color: "#888888",
    fontSize: verticalScale(19),
    fontFamily: "SpaceGroteskMedium",
    textAlign: "left",
    marginTop: verticalScale(-4),
  },
  leftColumn: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    justifyContent: "center",
    gap: verticalScale(6),
    paddingRight: verticalScale(12),
  },
  selectorLabel: {
    color: "#888888",
    fontSize: verticalScale(16),
    fontFamily: "SpaceGroteskSemiBold",
    textAlign: "left",
    alignSelf: "flex-start",
    marginBottom: verticalScale(12),
  },
  swapButton: {
    width: verticalScale(38),
    height: verticalScale(38),
    borderRadius: verticalScale(19),
    backgroundColor: "#FFFFFF",
    borderWidth: 6,
    borderColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
  },
  sendButton: {
    backgroundColor: "#111111",
    borderRadius: verticalScale(15),
    paddingVertical: verticalScale(12),
    alignItems: "center",
    marginTop: verticalScale(2),
  },
  sendText: {
    color: "#FFFFFF",
    fontSize: verticalScale(17),
    fontFamily: "SpaceGroteskSemiBold",
    letterSpacing: 0.3,
  },
});

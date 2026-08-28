import type { ReactNode, RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { CurrencyPicker } from "../components/CurrencyPicker";
import { CURRENCIES } from "../constants/currencies";
import { verticalScale } from "../constants/scaling";
import type {
  AnchorPosition,
  Currency,
  CurrencySwitcherProps,
  PickerTarget,
} from "../constants/types";
import { useCardSwap } from "../hooks/useCardSwap";
import { useExchangeRate } from "../hooks/useExchangeRate";
import { parseAmount, sanitizeAmountInput } from "../utils/amount";
import { findCurrencyByCode } from "../utils/currencies";
import { getFlagUrl } from "../utils/flag";

import { SwapIcon } from "./SwapIcon";

const DEFAULT_SEND_AMOUNT = "300";
const DEFAULT_FEE = 76.87;
const DEFAULT_ARRIVAL_ESTIMATE = "By Friday";
const DEFAULT_SWAP_ICON_SIZE = verticalScale(16);
const DEFAULT_FROM_CURRENCY_CODE = "USD";
const DEFAULT_TO_CURRENCY_CODE = "INR";


const BASE_AMOUNT_FONT_SIZE = verticalScale(40);
const SHRUNK_AMOUNT_FONT_SIZES = {

  sixDigits: verticalScale(36),
  sevenDigits: verticalScale(30),
  eightPlusDigits: verticalScale(25),
} as const;

function computeAmountFontSize(display: string | null): number {
  if (display === null) return BASE_AMOUNT_FONT_SIZE;

  const decimalIndex = display.indexOf(".");
  const integerDigits = decimalIndex === -1 ? display.length : decimalIndex;

  if (integerDigits <= 5) return BASE_AMOUNT_FONT_SIZE;
  if (integerDigits <= 6) return SHRUNK_AMOUNT_FONT_SIZES.sixDigits;
  if (integerDigits <= 7) return SHRUNK_AMOUNT_FONT_SIZES.sevenDigits;
  return SHRUNK_AMOUNT_FONT_SIZES.eightPlusDigits;
}

const FONT_SIZE_TIMING = {
  duration: 180,
  easing: Easing.out(Easing.quad),
} as const;


const SYMBOL_SIZE_RATIO = 26 / 36;
const SYMBOL_MARGIN_RATIO = 5 / 36;


function useAmountTypography(value: string | null) {
  const fontSize = useSharedValue(computeAmountFontSize(value));

  useEffect(() => {
    fontSize.value = withTiming(computeAmountFontSize(value), FONT_SIZE_TIMING);
  }, [fontSize, value]);

  const amountStyle = useAnimatedStyle(() => ({
    fontSize: fontSize.value,
  }));

  const symbolStyle = useAnimatedStyle(() => ({
    fontSize: fontSize.value * SYMBOL_SIZE_RATIO,
    marginBottom: fontSize.value * SYMBOL_MARGIN_RATIO,
  }));

  return { fontSize, amountStyle, symbolStyle };
}


function useAmountCaret(fontSize: SharedValue<number>, isFocused: boolean) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (isFocused) {
      opacity.value = withRepeat(withTiming(0, { duration: 500 }), -1, true);
    } else {
      opacity.value = withTiming(1);
    }
  }, [isFocused, opacity]);

  const caretStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    height: fontSize.value,
  }));

  return caretStyle;
}

interface CurrencySelectorProps {
  label: string;
  currency: Currency;
  pillRef: RefObject<View | null>;
  onPress: () => void;
}

function CurrencySelector({ label, currency, pillRef, onPress }: CurrencySelectorProps) {
  return (
    <View style={styles.selectorGroup}>
      <Text style={styles.selectorLabel}>{label}</Text>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View ref={pillRef} style={styles.currencyPill} collapsable={false}>
          <Image source={{ uri: getFlagUrl(currency.countryCode) }} style={styles.flag} />
          <Text style={styles.currencyCode}>{currency.code}</Text>
          <Text style={styles.chevron}>▾</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

interface InfoRowProps {
  label: string;
  children: ReactNode;
}

function InfoRow({ label, children }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      {children}
    </View>
  );
}

export function CurrencySwitcher({
  currencies = CURRENCIES,
  defaultFromCurrency,
  defaultToCurrency,
  defaultSendAmount = DEFAULT_SEND_AMOUNT,
  rate,
  isRateLoading,
  fee = DEFAULT_FEE,
  arrivalEstimate = DEFAULT_ARRIVAL_ESTIMATE,
  swapIcon,
  style,
  onAmountChange,
  onCurrencyChange,
  onSend,
}: CurrencySwitcherProps) {
  const [activeField, setActiveField] = useState<"send" | "receive">("send");
  const [activeAmount, setActiveAmount] = useState(defaultSendAmount);
  const [fromCurrency, setFromCurrency] = useState<Currency>(
    () =>
      defaultFromCurrency ??
      findCurrencyByCode(currencies, DEFAULT_FROM_CURRENCY_CODE) ??
      currencies[0]
  );
  const [toCurrency, setToCurrency] = useState<Currency>(
    () =>
      defaultToCurrency ??
      findCurrencyByCode(currencies, DEFAULT_TO_CURRENCY_CODE) ??
      currencies[0]
  );
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>("from");
  const [pickerVisible, setPickerVisible] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState<AnchorPosition | null>(null);
  const [focusedField, setFocusedField] = useState<"send" | "receive" | null>(null);

  const fromPillRef = useRef<View | null>(null);
  const toPillRef = useRef<View | null>(null);

  const {
    measureFirstCard,
    measureSecondCard,
    triggerSwap,
    isSwapping,
    firstCardStyle,
    secondCardStyle,
  } = useCardSwap();

  const numericActiveAmount = parseAmount(activeAmount);


  const hasExplicitRate = rate !== undefined;
  const { rate: fetchedRate, isLoading: fetchedLoading } = useExchangeRate(
    fromCurrency.code,
    toCurrency.code,
    { enabled: !hasExplicitRate }
  );

  const effectiveRate = hasExplicitRate ? rate : fetchedRate;
  const isRateFetching = hasExplicitRate ? isRateLoading : fetchedLoading;
  const firstLoad = effectiveRate === null;

  const numericSendAmount =
    activeField === "send"
      ? numericActiveAmount
      : firstLoad
        ? 0
        : numericActiveAmount / effectiveRate;

  const numericReceiveAmount =
    activeField === "receive"
      ? numericActiveAmount
      : firstLoad
        ? 0
        : numericActiveAmount * effectiveRate;

  const displaySendAmount = numericSendAmount.toFixed(2);
  const receiveAmount =
    activeField === "receive" || !firstLoad
      ? numericReceiveAmount.toFixed(2)
      : null;

  const sendTypography = useAmountTypography(displaySendAmount);
  const receiveTypography = useAmountTypography(receiveAmount);
  const sendCaretStyle = useAmountCaret(sendTypography.fontSize, focusedField === "send");
  const receiveCaretStyle = useAmountCaret(receiveTypography.fontSize, focusedField === "receive");

  const openPicker = useCallback(
    (target: PickerTarget, pillRef: RefObject<View | null>) => {
      Keyboard.dismiss();
      requestIdleCallback(() => {
        pillRef.current?.measureInWindow((pageX, pageY, width, height) => {
          setAnchorPosition({ x: pageX, y: pageY, width, height });
          setPickerTarget(target);
          setPickerVisible(true);
        });
      });
    },
    []
  );

  const closePicker = useCallback(() => setPickerVisible(false), []);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  const handleAmountChange = useCallback(
    (field: "send" | "receive", text: string) => {
      const sanitized = sanitizeAmountInput(text);
      setActiveField(field);
      setActiveAmount(sanitized);


      if (field === "send") {
        onAmountChange?.(sanitized);
      } else if (!firstLoad) {
        const impliedSend = parseAmount(sanitized) / effectiveRate;
        onAmountChange?.(impliedSend.toFixed(2));
      }
    },
    [onAmountChange, firstLoad, effectiveRate]
  );

  const handleAmountFocus = useCallback(
    (field: "send" | "receive") => {
      setFocusedField(field);
      setActiveField((prevActiveField) => {
        if (prevActiveField === field) return prevActiveField;
        setActiveAmount(
          field === "send" ? displaySendAmount : (receiveAmount ?? "0.00")
        );
        return field;
      });
    },
    [displaySendAmount, receiveAmount]
  );

  const handleAmountBlur = useCallback(() => {
    setFocusedField(null);
  }, []);

  const handleCurrencySelect = useCallback(
    (selected: Currency) => {
      const nextFrom = pickerTarget === "from" ? selected : fromCurrency;
      const nextTo = pickerTarget === "to" ? selected : toCurrency;

      setFromCurrency(nextFrom);
      setToCurrency(nextTo);
      onCurrencyChange?.(nextFrom, nextTo);
    },
    [pickerTarget, fromCurrency, toCurrency, onCurrencyChange]
  );

  const handleSwap = useCallback(() => {
    const nextFrom = toCurrency;
    const nextTo = fromCurrency;

    setFromCurrency(nextFrom);
    setToCurrency(nextTo);
    onCurrencyChange?.(nextFrom, nextTo);

    setActiveField("send");
    setActiveAmount(displaySendAmount);

    triggerSwap();
  }, [fromCurrency, toCurrency, onCurrencyChange, triggerSwap, displaySendAmount]);

  const handleSend = useCallback(() => {
    onSend?.({ amount: numericSendAmount, from: fromCurrency, to: toCurrency });
  }, [onSend, numericSendAmount, fromCurrency, toCurrency]);

  return (
    <View style={[styles.root, style]}>
      <View style={styles.stackContainer}>
        <Animated.View
          style={[styles.cardBox, firstCardStyle]}
          onLayout={measureFirstCard}
        >
          <View style={styles.amountWrapper}>
            <Animated.Text style={[styles.currencySymbol, sendTypography.symbolStyle]}>
              {fromCurrency.symbol}
            </Animated.Text>
            <View style={styles.amountInputContainer}>
              <Animated.Text
                style={[styles.amountInput, sendTypography.amountStyle]}
                numberOfLines={1}
                ellipsizeMode="clip"
              >
                {displaySendAmount}
              </Animated.Text>
              {focusedField === "send" ? (
                <Animated.View style={[styles.amountCaret, sendCaretStyle]} />
              ) : null}
              <TextInput
                style={styles.amountInputHidden}
                value={activeField === "send" ? activeAmount : displaySendAmount}
                onChangeText={(text) => handleAmountChange("send", text)}
                onFocus={() => handleAmountFocus("send")}
                onBlur={handleAmountBlur}
                keyboardType="decimal-pad"
                maxLength={10}
                selectionColor="#4A90FF"
                caretHidden
              />
            </View>
          </View>

          <CurrencySelector
            label="You Sending"
            currency={fromCurrency}
            pillRef={fromPillRef}
            onPress={() => openPicker("from", fromPillRef)}
          />
        </Animated.View>

        <View style={styles.swapGap}>
          <TouchableOpacity onPress={handleSwap} disabled={isSwapping} activeOpacity={0.7}>
            <View style={styles.swapButton}>
              {swapIcon ?? <SwapIcon size={DEFAULT_SWAP_ICON_SIZE} color="#FFFFFF" />}
            </View>
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[styles.cardBox, styles.receiveCard, secondCardStyle]}
          onLayout={measureSecondCard}
        >
          <View style={styles.amountWrapper}>
            <Animated.Text style={[styles.currencySymbol, receiveTypography.symbolStyle]}>
              {toCurrency.symbol}
            </Animated.Text>
            <View style={styles.amountInputContainer}>
              <Animated.Text
                style={[
                  styles.amountDisplay,
                  receiveAmount === null ? styles.amountDisplayLoading : undefined,
                  receiveTypography.amountStyle,
                ]}
                numberOfLines={1}
                ellipsizeMode="clip"
              >
                {receiveAmount ?? "0.00"}
              </Animated.Text>
              {focusedField === "receive" ? (
                <Animated.View style={[styles.amountCaret, receiveCaretStyle]} />
              ) : null}
              <TextInput
                style={styles.amountInputHidden}
                value={activeField === "receive" ? activeAmount : (receiveAmount ?? "0.00")}
                onChangeText={(text) => handleAmountChange("receive", text)}
                onFocus={() => handleAmountFocus("receive")}
                onBlur={handleAmountBlur}
                keyboardType="decimal-pad"
                maxLength={10}
                selectionColor="#4A90FF"
                editable={!firstLoad || activeField === "receive"}
                caretHidden
              />
            </View>
          </View>

          <CurrencySelector
            label="They Receive"
            currency={toCurrency}
            pillRef={toPillRef}
            onPress={() => openPicker("to", toPillRef)}
          />
        </Animated.View>
      </View>

      <TouchableOpacity style={styles.sendButton} activeOpacity={0.85} onPress={handleSend}>
        <Text style={styles.sendText}>Send</Text>
      </TouchableOpacity>

      <View style={styles.infoSection}>
        <InfoRow label="Rate">
          <Text style={styles.infoValueGreen}>
            {firstLoad || isRateFetching
              ? "Fetching…"
              : `1 ${fromCurrency.code} = ${toCurrency.symbol}${effectiveRate.toFixed(4)}`}
          </Text>
        </InfoRow>
        <View style={styles.infoDivider} />
        <InfoRow label="Includes fees">
          <Text style={styles.infoValueRed}>
            {fromCurrency.symbol}
            {fee}
          </Text>
        </InfoRow>
        <View style={styles.infoDivider} />
        <InfoRow label="Should arrive">
          <Text style={styles.infoValueWhite}>{arrivalEstimate}</Text>
        </InfoRow>
      </View>

      <CurrencyPicker
        visible={pickerVisible}
        anchorPosition={anchorPosition}
        selectedCode={pickerTarget === "from" ? fromCurrency.code : toCurrency.code}
        currencies={currencies}
        onSelect={handleCurrencySelect}
        onClose={closePicker}
      />
    </View>
  );
}

export type { CurrencySwitcherProps };

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
    paddingHorizontal: verticalScale(20),
    paddingTop: verticalScale(60),
  },
 
  stackContainer: {},
  cardBox: {
    backgroundColor: "#131313",
    borderRadius: verticalScale(22),
    paddingHorizontal: verticalScale(20),
    paddingVertical: verticalScale(20),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 2,
    marginBottom: verticalScale(8),
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
    flex: 1,
  },
  currencySymbol: {
    color: "#FFF",
    fontSize: verticalScale(26),
    fontFamily: "SpaceGroteskSemiBold",
    marginBottom: verticalScale(5),
    marginRight: verticalScale(2),
  },
  amountInput: {
    color: "#FFF",
    fontSize: verticalScale(40),
    fontFamily: "SpaceGroteskSemiBold",
    padding: 0,
  },
  amountInputContainer: {
    flex: 1,
    position: "relative",
    flexDirection: "row",
    alignItems: "flex-end",
  },
  amountCaret: {
    width: 2,
    backgroundColor: "#FFF",
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
    color: "#FFF",
    fontSize: verticalScale(36),
    fontFamily: "SpaceGroteskSemiBold",
  },
  amountDisplayLoading: {
    color: "#666",
  },
  selectorGroup: {
    alignItems: "flex-end",
    gap: verticalScale(6),
    paddingLeft: verticalScale(12),
  },
  selectorLabel: {
    color: "#00FF88",
    fontSize: verticalScale(14),
    fontFamily: "SpaceGroteskSemiBold",

  },
  currencyPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161616",
    borderRadius: verticalScale(10),
    paddingHorizontal: verticalScale(10),
    paddingVertical: verticalScale(7),
    gap: verticalScale(6),
  },
  flag: {
    width: verticalScale(22),
    height: verticalScale(22),
    borderRadius: verticalScale(11),
  },
  currencyCode: {
    color: "#FFF",
    fontSize: verticalScale(14),
    fontFamily: "SpaceGroteskSemiBold",
  },
  chevron: {
    color: "#777",
    fontSize: verticalScale(11),
  },
  swapButton: {
    width: verticalScale(38),
    height: verticalScale(38),
    borderRadius: verticalScale(19),
    backgroundColor: "#0C0C0C",
    borderWidth: 6,
    borderColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButton: {
    backgroundColor: "#0079DC",
    borderRadius: verticalScale(15),
    paddingVertical: verticalScale(12),
    alignItems: "center",
    marginTop: verticalScale(2),
  },
  sendText: {
    color: "#ffffff",
    fontSize: verticalScale(17),
    fontFamily: "SpaceGroteskSemiBold",
    letterSpacing: 0.3,
  },
  infoSection: {
    marginTop: verticalScale(10),
    backgroundColor: "#0C0C0C",
    borderRadius: verticalScale(20),
    paddingHorizontal: verticalScale(18),
    paddingVertical: verticalScale(4),
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: verticalScale(10),
  },
  infoDivider: {
    height: 1,
    backgroundColor: "#22222233",
  },
  infoLabel: {
    color: "#666",
    fontSize: verticalScale(12),
    fontFamily: "SpaceGroteskMedium",
  },
  infoValueGreen: {
    color: "#00FF88",
    fontSize: verticalScale(12),
    fontFamily: "SpaceGroteskMedium",
  },
  infoValueRed: {
    color: "#FF6B6B",
    fontSize: verticalScale(12),
    fontFamily: "SpaceGroteskMedium",
  },
  infoValueWhite: {
    color: "#FFF",
    fontSize: verticalScale(12),
    fontFamily: "SpaceGroteskMedium",
  },
});
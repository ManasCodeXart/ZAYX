import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import Svg, { Circle, Line } from "react-native-svg";

import { verticalScale } from "../constants/scaling";
import type { Currency, CurrencyPickerProps } from "../constants/types";
import { useMorphTransition } from "../hooks/useMorphTransition";
import { CurrencyRow } from "./CurrencyRow";

const DROPDOWN_WIDTH = verticalScale(280);
const DROPDOWN_HEIGHT = verticalScale(280);
const ARROW_SIZE = verticalScale(9);
const ARROW_INSET = verticalScale(1);
const ARROW_TOP_OFFSET = verticalScale(1.5);
const ARROW_RIGHT_INSET = verticalScale(14);
const DROPDOWN_TOP_OFFSET = verticalScale(9);
const DROPDOWN_TOP_GAP = verticalScale(10);
const DROPDOWN_TOP_FALLBACK = 200;
const DROPDOWN_RIGHT_FALLBACK = verticalScale(20);

const keyExtractor = (item: Currency) => item.code;

interface SearchIconProps {
  size?: number;
  color?: string;
}

function SearchIcon({ size = 16, color = "#FFFFFF" }: SearchIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth={2} />
      <Line
        x1="21"
        y1="21"
        x2="16.65"
        y2="16.65"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function CurrencyPicker({
  visible,
  anchorPosition,
  selectedCode,
  currencies,
  onSelect,
  onClose,
}: CurrencyPickerProps) {
  const { width: screenWidth } = useWindowDimensions();
  const [search, setSearch] = useState("");
  const isSelectingRef = useRef(false);

  const resetSearch = useCallback(() => setSearch(""), []);

  const { isMounted, contentStyle, backdropStyle } = useMorphTransition(visible, {
    width: DROPDOWN_WIDTH,
    height: DROPDOWN_HEIGHT,
    onExited: resetSearch,
  });

  useEffect(() => {
    if (visible) isSelectingRef.current = false;
  }, [visible]);

  const filteredCurrencies = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return currencies;

    return currencies.filter(
      (currency) =>
        currency.code.toLowerCase().includes(query) ||
        currency.name.toLowerCase().includes(query)
    );
  }, [search, currencies]);

  const handleSelect = useCallback(
    (currency: Currency) => {
      if (isSelectingRef.current) return;
      isSelectingRef.current = true;
      onSelect(currency);
      onClose();
    },
    [onSelect, onClose]
  );

  const renderItem = useCallback(
    ({ item }: { item: Currency }) => (
      <CurrencyRow
        currency={item}
        isSelected={item.code === selectedCode}
        onPress={handleSelect}
      />
    ),
    [selectedCode, handleSelect]
  );

  const dropdownTop = anchorPosition
    ? anchorPosition.y + anchorPosition.height + DROPDOWN_TOP_GAP
    : DROPDOWN_TOP_FALLBACK;

  const dropdownRight = anchorPosition
    ? screenWidth - (anchorPosition.x + anchorPosition.width)
    : DROPDOWN_RIGHT_FALLBACK;

  return (
    <Modal
      visible={isMounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.wrapper,
          { top: dropdownTop - DROPDOWN_TOP_OFFSET, right: dropdownRight },
          contentStyle,
        ]}
      >
        <View style={[styles.arrowOuter, { right: ARROW_RIGHT_INSET + ARROW_INSET }]} />
        <View style={[styles.arrowInner, { right: ARROW_RIGHT_INSET }]} />

        <View style={styles.card}>
          <Text style={styles.title}>SELECT CURRENCY</Text>

          <View style={styles.searchRow}>
            <SearchIcon size={verticalScale(16)} color="#444" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search currency or country…"
              placeholderTextColor="#3A3A3A"
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={resetSearch} activeOpacity={0.7}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filteredCurrencies}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
          />
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(15, 15, 15, 0.5)",
  },
  wrapper: {
    position: "absolute",
    width: DROPDOWN_WIDTH,
  },
  arrowOuter: {
    position: "absolute",
    top: 0,
    width: 0,
    height: 0,
    borderLeftWidth: ARROW_SIZE,
    borderRightWidth: ARROW_SIZE,
    borderBottomWidth: ARROW_SIZE,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#2A2A2A",
  },
  arrowInner: {
    position: "absolute",
    top: ARROW_TOP_OFFSET,
    width: 0,
    height: 0,
    borderLeftWidth: ARROW_SIZE - 1,
    borderRightWidth: ARROW_SIZE - 1,
    borderBottomWidth: ARROW_SIZE - 1,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#141414",
  },
  card: {
    marginTop: ARROW_SIZE,
    width: DROPDOWN_WIDTH,
    height: DROPDOWN_HEIGHT,
    backgroundColor: "#141414ec",
    borderRadius: verticalScale(25),
    paddingHorizontal: verticalScale(12),
    paddingTop: verticalScale(14),
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.65,
    shadowRadius: 28,
    elevation: 18,
  },
  title: {
    color: "#444",
    fontSize: verticalScale(10),
    fontFamily: "SpaceGroteskBold",
    letterSpacing: 1.2,
    marginBottom: verticalScale(10),
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f0f0f",
    borderRadius: verticalScale(12),
    paddingHorizontal: verticalScale(12),
    paddingVertical: verticalScale(9),
    marginBottom: verticalScale(8),
    gap: verticalScale(8),
  },
  searchInput: {
    flex: 1,
    color: "#FFF",
    fontSize: verticalScale(13),
    padding: 0,
  },
  clearIcon: {
    color: "#444",
    fontSize: verticalScale(12),
    paddingHorizontal: verticalScale(2),
  },
  listContent: {
    paddingBottom: verticalScale(24),
  },
});
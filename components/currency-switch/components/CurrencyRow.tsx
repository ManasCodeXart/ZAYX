import { memo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { verticalScale } from "../constants/scaling";
import type { Currency } from "../constants/types";
import { getFlagUrl } from "../utils/flag";

interface CurrencyRowProps {
  currency: Currency;
  isSelected: boolean;
  onPress: (currency: Currency) => void;
}

function CurrencyRowComponent({ currency, isSelected, onPress }: CurrencyRowProps) {
  return (
    <TouchableOpacity
      style={[styles.row, isSelected && styles.rowSelected]}
      onPress={() => onPress(currency)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: getFlagUrl(currency.countryCode) }} style={styles.flag} />
      <View style={styles.rowText}>
        <Text style={styles.code}>{currency.code}</Text>
        <Text style={styles.name}>{currency.name}</Text>
      </View>
      {isSelected && (
        <View style={styles.checkDot}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export const CurrencyRow = memo(CurrencyRowComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(8),
    paddingHorizontal: verticalScale(8),
    borderRadius: verticalScale(12),
    marginBottom: verticalScale(1),
  },
  rowSelected: {
    backgroundColor: "#0A1A10",
    borderWidth: 1,
    borderColor: "#173325",
  },
  flag: {
    width: verticalScale(34),
    height: verticalScale(34),
    borderRadius: verticalScale(17),
    marginRight: verticalScale(12),
  },
  rowText: {
    flex: 1,
  },
  code: {
    color: "#FFF",
    fontSize: verticalScale(14),
    fontWeight: "700",
  },
  name: {
    color: "#484848",
    fontSize: verticalScale(11),
    marginTop: verticalScale(1),
  },
  checkDot: {
    width: verticalScale(20),
    height: verticalScale(20),
    borderRadius: verticalScale(10),
    backgroundColor: "#00FF88",
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: "#000",
    fontSize: verticalScale(10),
    fontWeight: "800",
  },
});
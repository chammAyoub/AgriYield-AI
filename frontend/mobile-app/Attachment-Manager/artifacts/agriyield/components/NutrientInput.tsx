import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import Colors from "@/constants/colors";

interface NutrientInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  suffix?: string;
  isRTL?: boolean;
  compact?: boolean;
}

export function NutrientInput({
  label,
  value,
  onChangeText,
  suffix = "j",
  isRTL = false,
  compact = false,
}: NutrientInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={[styles.compactLabel, { textAlign: isRTL ? "right" : "left" }]}>
          {label}
        </Text>
        <View style={[
          styles.pillInputWrap, 
          { flexDirection: isRTL ? "row-reverse" : "row" },
          isFocused && styles.pillInputWrapFocused
        ]}>
          <TextInput
            style={[styles.pillInput, { textAlign: isRTL ? "right" : "left" }]}
            value={value}
            onChangeText={onChangeText}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={Colors.textMuted}
            maxLength={3}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <Text style={styles.pillSuffix}>{suffix}</Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { flexDirection: isRTL ? "row-reverse" : "row" },
      ]}
    >
      <Text
        style={[
          styles.label,
          { textAlign: isRTL ? "right" : "left", flex: 1 },
        ]}
      >
        {label}
      </Text>
      <View style={[
        styles.pillInputWrap, 
        { flexDirection: isRTL ? "row-reverse" : "row" },
        isFocused && styles.pillInputWrapFocused
      ]}>
        <TextInput
          style={[styles.pillInput, { textAlign: isRTL ? "right" : "left" }]}
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={Colors.textMuted}
          maxLength={3}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <Text style={styles.pillSuffix}>{suffix}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 12,
  },
  compactContainer: {
    paddingVertical: 8,
    gap: 8,
  },
  label: {
    fontSize: 15,
    color: Colors.text,
    fontFamily: "Inter_500Medium",
  },
  compactLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  pillInputWrap: {
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 100,
    paddingHorizontal: 14,
    height: 36,
    minWidth: 90,
    borderWidth: 2,
    borderColor: "transparent",
    gap: 6,
  },
  pillInputWrapFocused: {
    borderColor: Colors.primary,
  },
  pillInput: {
    fontSize: 15,
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
    minWidth: 40,
    padding: 0,
    height: "100%",
  },
  pillSuffix: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
  },
});

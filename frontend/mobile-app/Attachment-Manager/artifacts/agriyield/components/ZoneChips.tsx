import React from "react";
import {
  ScrollView,
  Pressable,
  Text,
  StyleSheet,
  View,
} from "react-native";
import { MapPin } from "lucide-react-native";
import Colors from "@/constants/colors";

export interface Zone {
  key: string;
  label: string;
}

interface ZoneChipsProps {
  zones: Zone[];
  selectedZone: string;
  onSelect: (key: string) => void;
  isRTL?: boolean;
  showIcon?: boolean;
}

export function ZoneChips({
  zones,
  selectedZone,
  onSelect,
  isRTL = false,
  showIcon = false,
}: ZoneChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.container,
        { flexDirection: isRTL ? "row-reverse" : "row" },
      ]}
    >
      {zones.map((zone) => {
        const isActive = selectedZone === zone.key;
        return (
          <Pressable
            key={zone.key}
            onPress={() => onSelect(zone.key)}
            style={({ pressed }) => [
              styles.chip,
              isActive ? styles.chipActive : styles.chipInactive,
              { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
          >
            {isActive && showIcon && (
              <MapPin size={12} color={Colors.white} strokeWidth={2.5} />
            )}
            {!isActive && showIcon && zone.key !== "global" && (
              <MapPin size={12} color={Colors.primary} strokeWidth={2} />
            )}
            <Text
              style={[
                styles.chipText,
                isActive ? styles.chipTextActive : styles.chipTextInactive,
              ]}
            >
              {zone.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 100,
    borderWidth: 1.5,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  chipInactive: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  chipTextActive: {
    color: Colors.white,
  },
  chipTextInactive: {
    color: Colors.textSecondary,
  },
});

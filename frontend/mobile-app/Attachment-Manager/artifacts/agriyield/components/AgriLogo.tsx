import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import Colors from "@/constants/colors";

interface AgriLogoProps {
  size?: number;
  showText?: boolean;
}

export function AgriLogo({ size = 72, showText = true }: AgriLogoProps) {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconWrapper,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        <Svg width={size * 0.6} height={size * 0.6} viewBox="0 0 48 48">
          {/* Water drop */}
          <Path
            d="M24 6 C24 6 12 20 12 28 C12 34.627 17.373 40 24 40 C30.627 40 36 34.627 36 28 C36 20 24 6 24 6Z"
            fill={Colors.secondary}
            opacity="0.8"
          />
          {/* Leaf overlay */}
          <Path
            d="M24 14 C24 14 18 20 18 26 C18 29.314 20.686 32 24 32 C24 32 30 28 30 22 C30 17 24 14 24 14Z"
            fill={Colors.primary}
          />
          {/* Leaf vein */}
          <Path
            d="M24 16 L24 30"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <Path
            d="M24 21 L21 25"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <Path
            d="M24 24 L27 27"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </Svg>
      </View>
      {showText && (
        <View style={styles.textContainer}>
          <Text style={styles.appName}>AgriYield</Text>
          <Text style={styles.aiText}> AI</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 16,
  },
  iconWrapper: {
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.8,
  },
  aiText: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primary,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.8,
  },
});

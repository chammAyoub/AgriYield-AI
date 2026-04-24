import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";
import Colors from "@/constants/colors";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  value: number;
  unit: string;
  label: string;
  color?: string; // Kept for interface compatibility but gradient is used
}

export function CircularProgress({
  progress,
  size = 160,
  strokeWidth = 14,
  value,
  unit,
  label,
  color,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedProgress = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 100,
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const cx = size / 2;
  const cy = size / 2;

  return (
    <Animated.View style={[styles.container, scaleStyle]}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgLinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={Colors.primary} stopOpacity="1" />
            <Stop offset="0.5" stopColor={Colors.teal} stopOpacity="1" />
            <Stop offset="1" stopColor={Colors.secondary} stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>
        {/* Track */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={Colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="url(#grad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${cx}, ${cy}`}
        />
      </Svg>
      <View style={[styles.center, { width: size, height: size }]}>
        <Text style={styles.value}>{value.toLocaleString()}</Text>
        <Text style={styles.unit}>{unit}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  unit: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
  },
  label: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
});

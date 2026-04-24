import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react-native";
import Colors from "@/constants/colors";

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  delay?: number;
  trend?: number;
}

export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  iconColor = Colors.primary,
  iconBg = Colors.primaryLight,
  delay = 0,
  trend,
}: StatCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  React.useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) })
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.card, animStyle]}>
      <View style={[styles.iconWrap, { backgroundColor: iconBg, shadowColor: iconColor }]}>
        <Icon size={20} color={iconColor} strokeWidth={2} />
      </View>
      <Text style={styles.value}>
        {value}
        {unit ? <Text style={styles.unit}> {unit}</Text> : null}
      </Text>
      <Text style={styles.label}>{label}</Text>
      {trend !== undefined && (
        <View style={styles.trendRow}>
          {trend >= 0 ? (
            <TrendingUp size={14} color={Colors.success} strokeWidth={2} />
          ) : (
            <TrendingDown size={14} color={Colors.error} strokeWidth={2} />
          )}
          <Text
            style={[
              styles.trend,
              { color: trend >= 0 ? Colors.success : Colors.error },
            ]}
          >
            {Math.abs(trend)}%
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    flex: 1,
    gap: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 4,
  },
  value: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  label: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  trend: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});

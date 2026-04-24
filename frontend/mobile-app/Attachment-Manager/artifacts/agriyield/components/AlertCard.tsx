import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Droplet, AlertTriangle, Activity, type LucideIcon } from "lucide-react-native";
import Colors from "@/constants/colors";

export type AlertSeverity = "low" | "medium" | "high";
export type AlertType = "over_irrigation" | "leak" | "deficiency";

export interface AlertItem {
  id: string;
  type: AlertType;
  message: string;
  zone: string;
  severity: AlertSeverity;
  timeAgo: number;
}

interface AlertCardProps {
  alert: AlertItem;
  isRTL?: boolean;
}

const severityConfig: Record<
  AlertSeverity,
  { bg: string; color: string; iconColor: string; border: string }
> = {
  low: { bg: Colors.amberLight, color: Colors.amber, iconColor: Colors.amber, border: Colors.amberLight },
  medium: { bg: Colors.amberLight, color: Colors.amber, iconColor: Colors.amber, border: Colors.amberLight },
  high: { bg: Colors.redLight, color: Colors.red, iconColor: Colors.red, border: Colors.redLight },
};

const typeIcons: Record<AlertType, LucideIcon> = {
  over_irrigation: Droplet,
  leak: AlertTriangle,
  deficiency: Activity,
};

export function AlertCard({ alert, isRTL = false }: AlertCardProps) {
  const config = severityConfig[alert.severity];
  const AlertIcon = typeIcons[alert.type];
  const timeText =
    alert.timeAgo < 60
      ? `${alert.timeAgo}min`
      : `${Math.floor(alert.timeAgo / 60)}h`;

  return (
    <View style={[
      styles.container,
      {
        flexDirection: isRTL ? "row-reverse" : "row",
        borderColor: config.border,
      },
    ]}>
      <View style={[styles.iconContainer, { backgroundColor: config.bg }]}>
        <AlertIcon size={20} color={config.iconColor} strokeWidth={2} />
      </View>
      <View style={[styles.content, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
        <Text style={[styles.message, { textAlign: isRTL ? "right" : "left" }]}>
          {alert.message}
        </Text>
        <Text style={[styles.zone, { textAlign: isRTL ? "right" : "left" }]}>
          Zone {alert.zone}
        </Text>
      </View>
      <Text style={styles.time}>{timeText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 14,
    borderWidth: 1.5,
    marginBottom: 10,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 4,
  },
  message: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
  },
  zone: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  time: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: "Inter_500Medium",
  },
});

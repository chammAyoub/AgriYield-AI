import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Bell,
  Info,
  LogOut,
  type LucideIcon,
} from "lucide-react-native";
import { useApp } from "@/context/AppContext";
import Colors from "@/constants/colors";

import { LinearGradient } from "expo-linear-gradient";

interface SettingsRowProps {
  icon: LucideIcon;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  isRTL?: boolean;
  rightEl?: React.ReactNode;
}

function SettingsRow({
  icon: Icon,
  label,
  value,
  onPress,
  danger,
  isRTL,
  rightEl,
}: SettingsRowProps) {
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { opacity: pressed ? 0.7 : 1 },
        { flexDirection: isRTL ? "row-reverse" : "row" },
      ]}
    >
      <View
        style={[
          styles.rowIcon,
          { backgroundColor: danger ? Colors.redLight : Colors.surfaceSecondary },
        ]}
      >
        <Icon
          size={18}
          color={danger ? Colors.red : Colors.textSecondary}
          strokeWidth={2}
        />
      </View>
      <Text
        style={[
          styles.rowLabel,
          { color: danger ? Colors.red : Colors.text },
          { textAlign: isRTL ? "right" : "left" },
        ]}
      >
        {label}
      </Text>
      {rightEl ?? (
        <>
          {value && <Text style={styles.rowValue}>{value}</Text>}
          {onPress && !danger && (
            <ChevronIcon size={18} color={Colors.textMuted} strokeWidth={2} />
          )}
        </>
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { t, setIsLoggedIn, isRTL } = useApp();
  const insets = useSafeAreaInsets();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.replace("/login");
  };

  return (
    <LinearGradient colors={["#f0fdf4", "#ecfdf5"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: topInset + 16, paddingBottom: bottomInset + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={[styles.screenTitle, { textAlign: isRTL ? "right" : "left" }]}>
          {t("settingsTitle")}
        </Text>

        {/* Account Section */}
        <Text style={[styles.sectionLabel, { textAlign: isRTL ? "right" : "left" }]}>
          {t("account")}
        </Text>
        <View style={styles.card}>
          <SettingsRow
            icon={User}
            label={t("profile")}
            onPress={() => {}}
            isRTL={isRTL}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon={Bell}
            label={t("notifications")}
            onPress={() => {}}
            isRTL={isRTL}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon={Info}
            label={t("about")}
            value={`v${t("appVersion")}`}
            isRTL={isRTL}
          />
        </View>

        {/* Logout */}
        <View style={[styles.card, styles.logoutCard]}>
          <SettingsRow
            icon={LogOut}
            label={t("logout")}
            onPress={handleLogout}
            danger
            isRTL={isRTL}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 12,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.8,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSecondary,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginTop: 16,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  logoutCard: {
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: Colors.redLight,
  },
  row: {
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  rowValue: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: 76,
  },
});

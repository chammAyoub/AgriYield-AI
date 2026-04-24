import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
} from "react-native";
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Info,
  type LucideIcon,
} from "lucide-react-native";
import { useApp } from "@/context/AppContext";
import Colors from "@/constants/colors";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

export interface PredictionResult {
  riskLabel: string;
  confidence: number;
  recommendation: string;
  level: "none" | "low" | "medium" | "high";
}

interface PredictionModalProps {
  visible: boolean;
  result: PredictionResult | null;
  onClose: () => void;
  onNewAnalysis: () => void;
}

const levelConfig: Record<
  string,
  { color: string; bg: string; icon: LucideIcon }
> = {
  none: { color: Colors.primary, bg: Colors.primaryLight, icon: CheckCircle },
  low: { color: Colors.amber, bg: Colors.amberLight, icon: AlertCircle },
  medium: { color: Colors.amber, bg: Colors.amberLight, icon: AlertTriangle },
  high: { color: Colors.red, bg: Colors.redLight, icon: XCircle },
};

export function PredictionModal({
  visible,
  result,
  onClose,
  onNewAnalysis,
}: PredictionModalProps) {
  const { t, isRTL } = useApp();
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.7);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.08,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
          { iterations: -1 }
        ).start();
      });
    } else {
      pulseAnim.stopAnimation();
    }
  }, [visible]);

  if (!result) return null;

  const config = levelConfig[result.level] ?? levelConfig.low;
  const LevelIcon = config.icon;

  const ModalContent = (
    <View style={styles.overlayInner}>
      <Animated.View
        style={[
          styles.sheet,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Icon */}
        <View style={styles.iconSection}>
          <Animated.View
            style={[
              styles.iconCircle,
              {
                backgroundColor: config.bg,
                transform: [{ scale: pulseAnim }],
                shadowColor: config.color,
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              },
            ]}
          >
            <LevelIcon size={44} color={config.color} strokeWidth={1.5} />
          </Animated.View>
        </View>

        <Text style={styles.title}>{t("predictionTitle")}</Text>

        {/* Risk Label */}
        <View style={[
          styles.riskBadge,
          {
            backgroundColor: config.bg,
            shadowColor: config.color,
            shadowOpacity: 0.4,
            shadowRadius: 10,
            elevation: 4,
          },
        ]}>
          <Text style={[styles.riskText, { color: config.color }]}>
            {result.riskLabel}
          </Text>
        </View>

        {/* Confidence */}
        <View style={styles.confidenceSection}>
          <Text style={styles.confidenceLabel}>{t("confidence")}</Text>
          <View style={styles.confidenceBar}>
            <LinearGradient
              colors={[config.color, config.color + "aa"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.confidenceFill,
                { width: `${result.confidence}%` as any },
              ]}
            />
          </View>
          <Text style={[styles.confidenceValue, { color: config.color }]}>
            {result.confidence}%
          </Text>
        </View>

        {/* Recommendation */}
        <View style={styles.recommendationBox}>
          <Info size={16} color={Colors.textSecondary} strokeWidth={2} style={{ marginTop: 2 }} />
          <Text
            style={[
              styles.recommendationText,
              { textAlign: isRTL ? "right" : "left" },
            ]}
          >
            {result.recommendation}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={onNewAnalysis}
            style={({ pressed }) => [
              styles.btnSecondary,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={styles.btnSecondaryText}>{t("newAnalysis")}</Text>
          </Pressable>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.btnPrimaryContainer,
              { opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.teal]}
              style={styles.btnPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.btnPrimaryText}>{t("close")}</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {Platform.OS === "web" ? (
        <View style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
          {ModalContent}
        </View>
      ) : (
        <BlurView intensity={80} tint="dark" style={styles.overlay}>
          {ModalContent}
        </BlurView>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  overlayInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderRadius: 28,
    padding: 28,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    gap: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 12,
  },
  iconSection: {
    marginTop: 4,
    marginBottom: 8,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.4,
  },
  riskBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
  },
  riskText: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.2,
  },
  confidenceSection: {
    width: "100%",
    gap: 10,
    alignItems: "center",
  },
  confidenceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  confidenceBar: {
    width: "100%",
    height: 10,
    backgroundColor: Colors.border,
    borderRadius: 5,
    overflow: "hidden",
  },
  confidenceFill: {
    height: "100%",
    borderRadius: 5,
  },
  confidenceValue: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  recommendationBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 16,
    width: "100%",
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontFamily: "Inter_500Medium",
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 8,
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  btnSecondaryText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  btnPrimaryContainer: {
    flex: 1,
  },
  btnPrimary: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
});

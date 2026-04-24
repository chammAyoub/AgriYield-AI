import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Sun,
  Clock,
  MapPin,
  type LucideIcon,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "@/context/AppContext";
import { ZoneChips, type Zone } from "@/components/ZoneChips";
import Colors from "@/constants/colors";

interface HistoryEntry {
  id: string;
  date: string;
  riskLabel: string;
  confidence: number;
  level: "none" | "low" | "medium" | "high";
  growthStage: string;
  zone: string;
}

const MOCK_HISTORY: HistoryEntry[] = [
  {
    id: "1",
    date: "01 Avr. 2026",
    riskLabel: "Risque de Carence en Calcium",
    confidence: 92,
    level: "high",
    growthStage: "Floraison",
    zone: "A1",
  },
  {
    id: "2",
    date: "28 Mar. 2026",
    riskLabel: "Risque de Carence en Fer",
    confidence: 78,
    level: "medium",
    growthStage: "Croissance",
    zone: "B2",
  },
  {
    id: "3",
    date: "24 Mar. 2026",
    riskLabel: "Aucun risque détecté",
    confidence: 95,
    level: "none",
    growthStage: "Fructification",
    zone: "C3",
  },
  {
    id: "4",
    date: "20 Mar. 2026",
    riskLabel: "Risque de Carence en Zinc",
    confidence: 65,
    level: "low",
    growthStage: "Croissance",
    zone: "A1",
  },
  {
    id: "5",
    date: "15 Mar. 2026",
    riskLabel: "Risque de Carence en Magnésium",
    confidence: 83,
    level: "medium",
    growthStage: "Floraison",
    zone: "B2",
  },
  {
    id: "6",
    date: "10 Mar. 2026",
    riskLabel: "Aucun risque détecté",
    confidence: 97,
    level: "none",
    growthStage: "Croissance",
    zone: "C3",
  },
];

const levelConfig: Record<
  string,
  { color: string; bg: string; icon: LucideIcon; label: string }
> = {
  none:   { color: Colors.primary,   bg: Colors.primaryLight,   icon: CheckCircle,   label: "Sain" },
  low:    { color: Colors.amber,     bg: Colors.amberLight,     icon: AlertCircle,   label: "Faible" },
  medium: { color: Colors.amber,     bg: Colors.amberLight,     icon: AlertTriangle, label: "Modéré" },
  high:   { color: Colors.red,       bg: Colors.redLight,       icon: XCircle,       label: "Élevé" },
};

function HistoryCard({ entry, isRTL }: { entry: HistoryEntry; isRTL: boolean }) {
  const config = levelConfig[entry.level] ?? levelConfig.low;
  const LevelIcon = config.icon;

  return (
    <View style={styles.card}>
      <View style={[styles.accentBar, { backgroundColor: config.color }]} />

      <View style={[styles.cardInner, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <View style={[styles.iconCircle, { backgroundColor: config.bg }]}>
          <LevelIcon size={22} color={config.color} strokeWidth={2} />
        </View>

        <View style={[styles.cardContent, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
          <Text
            style={[styles.riskLabel, { textAlign: isRTL ? "right" : "left" }]}
            numberOfLines={2}
          >
            {entry.riskLabel}
          </Text>

          <View style={[styles.metaRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            {/* Zone pill */}
            <View style={[styles.zonePill, { backgroundColor: Colors.secondaryLight }]}>
              <MapPin size={10} color={Colors.secondary} strokeWidth={2} />
              <Text style={[styles.zonePillText, { color: Colors.secondary }]}>
                {entry.zone}
              </Text>
            </View>

            {/* Growth stage pill */}
            <View style={styles.stagePill}>
              <Sun size={10} color={Colors.textSecondary} strokeWidth={2} />
              <Text style={styles.stageText}>{entry.growthStage}</Text>
            </View>

            <Text style={styles.dateText}>{entry.date}</Text>
          </View>
        </View>

        <View style={[styles.confidenceBadge, { backgroundColor: config.bg }]}>
          <Text style={[styles.confidenceValue, { color: config.color }]}>
            {entry.confidence}%
          </Text>
          <Text style={[styles.confidenceLabel, { color: config.color }]}>
            confiance
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const { t, isRTL } = useApp();
  const insets = useSafeAreaInsets();

  const [selectedZone, setSelectedZone] = useState("global");

  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const ZONES: Zone[] = [
    { key: "global", label: t("allZones") },
    { key: "A1",    label: `${t("zonePrefix")} A1` },
    { key: "B2",    label: `${t("zonePrefix")} B2` },
    { key: "C3",    label: `${t("zonePrefix")} C3` },
  ];

  const filtered =
    selectedZone === "global"
      ? MOCK_HISTORY
      : MOCK_HISTORY.filter((e) => e.zone === selectedZone);

  const highRiskCount  = filtered.filter((e) => e.level === "high").length;
  const safeCount      = filtered.filter((e) => e.level === "none").length;
  const avgConfidence  =
    filtered.length > 0
      ? Math.round(filtered.reduce((sum, e) => sum + e.confidence, 0) / filtered.length)
      : 0;

  return (
    <LinearGradient colors={["#f0fdf4", "#ecfdf5"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Zone Filter Chips */}
        <View style={styles.zoneChipsWrapper}>
          <ZoneChips
            zones={ZONES}
            selectedZone={selectedZone}
            onSelect={setSelectedZone}
            isRTL={isRTL}
            showIcon={true}
          />
        </View>

        {/* Summary strip */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { borderColor: Colors.redLight }]}>
            <Text style={[styles.summaryValue, { color: Colors.red }]}>{highRiskCount}</Text>
            <Text style={styles.summaryLabel}>Risques élevés</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: Colors.primaryLight }]}>
            <Text style={[styles.summaryValue, { color: Colors.primary }]}>{safeCount}</Text>
            <Text style={styles.summaryLabel}>Résultats sains</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: Colors.secondaryLight }]}>
            <Text style={[styles.summaryValue, { color: Colors.secondary }]}>
              {avgConfidence}%
            </Text>
            <Text style={styles.summaryLabel}>Confiance moy.</Text>
          </View>
        </View>

        {/* Section title */}
        <Text style={[styles.sectionTitle, { textAlign: isRTL ? "right" : "left" }]}>
          {t("historyTitle")}
        </Text>

        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Clock size={36} color={Colors.textMuted} strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>{t("historyEmpty")}</Text>
            <Text style={styles.emptySub}>{t("historyEmptySub")}</Text>
          </View>
        ) : (
          filtered.map((entry) => (
            <HistoryCard key={entry.id} entry={entry} isRTL={isRTL} />
          ))
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingTop: 8,
    gap: 10,
  },
  zoneChipsWrapper: {
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 4,
    borderWidth: 1.5,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  summaryLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
    marginTop: 4,
    marginBottom: 2,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    flexDirection: "row",
    marginHorizontal: 16,
  },
  accentBar: {
    width: 4,
    alignSelf: "stretch",
  },
  cardInner: {
    flex: 1,
    padding: 14,
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
    gap: 6,
  },
  riskLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 20,
  },
  metaRow: {
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  zonePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 100,
  },
  zonePillText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.1,
  },
  stagePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  stageText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  dateText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
  },
  confidenceBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: "center",
    minWidth: 56,
  },
  confidenceValue: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  confidenceLabel: {
    fontSize: 9,
    fontFamily: "Inter_500Medium",
    opacity: 0.8,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
    paddingHorizontal: 16,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  emptySub: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 32,
    lineHeight: 20,
  },
});

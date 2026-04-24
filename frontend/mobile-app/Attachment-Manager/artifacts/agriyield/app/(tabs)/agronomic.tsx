import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Switch,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronUp, ChevronDown, Check, Cpu } from "lucide-react-native";
import Slider from "@react-native-community/slider";
import { useApp } from "@/context/AppContext";
import { NutrientInput } from "@/components/NutrientInput";
import { PredictionModal, type PredictionResult } from "@/components/PredictionModal";
import { ZoneChips, type Zone } from "@/components/ZoneChips";
import Colors from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";

type GrowthStage = "flowering" | "growth" | "fruiting";

const AGRO_ZONES: Zone[] = [
  { key: "A1", label: "Zone A1" },
  { key: "B2", label: "Zone B2" },
  { key: "C3", label: "Zone C3" },
];

export default function AgronomicScreen() {
  const { t, isRTL } = useApp();
  const insets = useSafeAreaInsets();

  const [selectedZone, setSelectedZone] = useState<string>("A1");
  const [growthStage, setGrowthStage] = useState<GrowthStage | null>(null);
  const [soilPH, setSoilPH] = useState("6.5");
  const [excessK, setExcessK] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [showStageDropdown, setShowStageDropdown] = useState(false);

  const [nutrients, setNutrients] = useState({
    zinc: "0",
    calcium: "3",
    iron: "0",
    magnesium: "1",
    nitrogen: "0",
    potassium: "5",
    boron: "2",
    manganese: "0",
  });

  const growthStages: { key: GrowthStage; label: string }[] = [
    { key: "flowering", label: t("flowering") },
    { key: "growth", label: t("growth") },
    { key: "fruiting", label: t("fruiting") },
  ];

  const handleGenerate = async () => {
    if (!growthStage) {
      alert("Veuillez sélectionner un stade de croissance");
      return;
    }

    setLoading(true);

    const stageMap: Record<string, string> = {
      "flowering": "floraison",
      "growth": "croissance",
      "fruiting": "fructification"
    };

    const payload = {
      agriculteur_id: 1, 
      zone_id: `Zone ${selectedZone}`, 
      stade_croissance: stageMap[growthStage] || "floraison",
      ph_sol: parseFloat(soilPH) || 6.5,
      jours_sans_zinc: parseInt(nutrients.zinc) || 0,
      jours_sans_calcium: parseInt(nutrients.calcium) || 0,
      jours_sans_fer: parseInt(nutrients.iron) || 0,
      jours_sans_magnesium: parseInt(nutrients.magnesium) || 0,
      jours_sans_azote: parseInt(nutrients.nitrogen) || 0,
      jours_sans_potassium: parseInt(nutrients.potassium) || 0,
      jours_sans_bore: parseInt(nutrients.boron) || 0,
      jours_sans_manganese: parseInt(nutrients.manganese) || 0,
      exces_potassium: excessK
    };

    try {
      const response = await fetch("http://192.168.45.244:8000/api/ia/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Erreur serveur");
      }

      const data = await response.json();

      const roundedConfidence = Math.round(data.confiance_pct);


      let riskLevel = "none"; 
      
      const labelMin = data.risque_label.toLowerCase();
      
  
      if (labelMin !== "normal" && labelMin !== "0" && labelMin !== "plante saine") {
         riskLevel = roundedConfidence >= 70 ? "high" : "medium";
      }

      setResult({
        riskLabel: data.risque_label,
        confidence: roundedConfidence,
        recommendation: data.recommandation || "Consulter un agronome pour vérifier cette carence.",
        level: riskLevel as "high" | "medium" | "none",
      });

      setModalVisible(true);

    } catch (error) {
      console.error("Erreur API:", error);
      alert("Erreur de connexion ! Vérifiez que FastAPI est allumé et que le PC/Téléphone sont sur le même Wi-Fi.");
    } finally {
      setLoading(false);
    }
  };

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <>
      <LinearGradient colors={["#f0fdf4", "#ecfdf5"]} style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: topInset + 16, paddingBottom: bottomInset + 120 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={{ alignItems: isRTL ? "flex-end" : "flex-start", marginBottom: 12 }}>
            <Text style={[styles.screenTitle, { textAlign: isRTL ? "right" : "left" }]}>
              {t("agronomicTitle")}
            </Text>
            <Text style={[styles.screenSubtitle, { textAlign: isRTL ? "right" : "left" }]}>
              {t("agronomicSubtitle")}
            </Text>
          </View>

          {/* Zone Selector */}
          <View style={styles.zoneCard}>
            <Text style={[styles.cardTitle, { textAlign: isRTL ? "right" : "left", marginBottom: 0 }]}>
              {t("selectZone")}
            </Text>
            <View style={styles.zoneChipsWrapper}>
              <ZoneChips
                zones={AGRO_ZONES}
                selectedZone={selectedZone}
                onSelect={setSelectedZone}
                isRTL={isRTL}
                showIcon={true}
              />
            </View>
          </View>

          {/* Growth Stage */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { textAlign: isRTL ? "right" : "left" }]}>
              {t("growthStage")}
            </Text>
            <Pressable
              onPress={() => setShowStageDropdown(!showStageDropdown)}
              style={({ pressed }) => [
                styles.dropdown,
                { opacity: pressed ? 0.8 : 1 },
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
            >
              <Text
                style={[
                  styles.dropdownText,
                  { color: growthStage ? Colors.text : Colors.textMuted },
                ]}
              >
                {growthStage
                  ? growthStages.find((s) => s.key === growthStage)?.label
                  : t("selectGrowthStage")}
              </Text>
              {showStageDropdown ? (
                <ChevronUp size={20} color={Colors.textSecondary} strokeWidth={2} />
              ) : (
                <ChevronDown size={20} color={Colors.textSecondary} strokeWidth={2} />
              )}
            </Pressable>

            {showStageDropdown && (
              <View style={styles.dropdownMenu}>
                {growthStages.map((stage) => (
                  <Pressable
                    key={stage.key}
                    onPress={() => {
                      setGrowthStage(stage.key);
                      setShowStageDropdown(false);
                    }}
                    style={({ pressed }) => [
                      styles.dropdownItem,
                      {
                        backgroundColor:
                          growthStage === stage.key
                            ? Colors.primaryLight
                            : pressed
                            ? Colors.surfaceSecondary
                            : Colors.surface,
                        flexDirection: isRTL ? "row-reverse" : "row",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        {
                          color: growthStage === stage.key ? Colors.primaryDark : Colors.text,
                          fontWeight: growthStage === stage.key ? "600" : "500",
                        },
                      ]}
                    >
                      {stage.label}
                    </Text>
                    {growthStage === stage.key && (
                      <Check size={18} color={Colors.primary} strokeWidth={2.5} />
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Soil pH */}
          <View style={styles.card}>
            <View style={[styles.phHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Text style={[styles.cardTitle, { flex: 1, textAlign: isRTL ? "right" : "left" }]}>
                {t("soilPH")}
              </Text>
              <View style={styles.phBadge}>
                <Text style={styles.phBadgeText}>{soilPH}</Text>
              </View>
            </View>

            <View style={styles.phSliderRow}>
              <Text style={styles.phMin}>4</Text>
              <Slider
                style={styles.phSlider}
                minimumValue={4}
                maximumValue={14}
                step={0.1}
                value={parseFloat(soilPH) || 6.5}
                onValueChange={(v) => setSoilPH(v.toFixed(1))}
                minimumTrackTintColor={Colors.primary}
                maximumTrackTintColor={Colors.borderLight}
                thumbTintColor={Colors.primary}
              />
              <Text style={styles.phMax}>14</Text>
            </View>
          </View>

          {/* Nutrients */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { textAlign: isRTL ? "right" : "left" }]}>
              {t("daysWithout")}
            </Text>
            <View style={styles.nutrientsGrid}>
              {(
                [
                  ["zinc", t("zinc")],
                  ["calcium", t("calcium")],
                  ["iron", t("iron")],
                  ["magnesium", t("magnesium")],
                  ["nitrogen", t("nitrogen")],
                  ["potassium", t("potassium")],
                  ["boron", t("boron")],
                  ["manganese", t("manganese")],
                ] as [keyof typeof nutrients, string][]
              ).map(([key, label]) => (
                <View key={key} style={styles.nutrientGridItem}>
                  <NutrientInput
                    label={label}
                    value={nutrients[key]}
                    onChangeText={(v) =>
                      setNutrients((prev) => ({ ...prev, [key]: v }))
                    }
                    suffix={t("days").slice(0, 1)}
                    isRTL={isRTL}
                    compact={true}
                  />
                </View>
              ))}
            </View>
          </View>

          {/* Excess Potassium */}
          <View style={styles.card}>
            <View
              style={[
                styles.toggleRow,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.cardTitle,
                    { marginBottom: 0, textAlign: isRTL ? "right" : "left" },
                  ]}
                >
                  {t("excessPotassium")}
                </Text>
              </View>
              <View style={styles.switchWithLabels}>
                <Text
                  style={[
                    styles.switchLabel,
                    { color: !excessK ? Colors.primary : Colors.textMuted },
                  ]}
                >
                  {t("no")}
                </Text>
                <Switch
                  value={excessK}
                  onValueChange={setExcessK}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor={Colors.white}
                />
                <Text
                  style={[
                    styles.switchLabel,
                    { color: excessK ? Colors.primary : Colors.textMuted },
                  ]}
                >
                  {t("yes")}
                </Text>
              </View>
            </View>
          </View>

          {/* Generate Button */}
          <Pressable
            onPress={handleGenerate}
            disabled={loading}
            style={({ pressed }) => [
              styles.generateBtnContainer,
              {
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: loading ? 0.85 : 1,
              },
            ]}
          >
            <LinearGradient
              colors={["#10b981", "#0d9488", "#0284c7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.generateBtn}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color={Colors.white} size="small" />
                  <Text style={styles.generateBtnText}>{t("generating")}</Text>
                </View>
              ) : (
                <View style={styles.loadingRow}>
                  <Cpu size={24} color={Colors.white} strokeWidth={2} />
                  <Text style={styles.generateBtnText}>{t("generatePrediction")}</Text>
                </View>
              )}
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </LinearGradient>

      <PredictionModal
        visible={modalVisible}
        result={result}
        onClose={() => setModalVisible(false)}
        onNewAnalysis={() => {
          setModalVisible(false);
          setResult(null);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.8,
  },
  screenSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
    marginTop: 4,
    lineHeight: 22,
  },
  zoneCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 20,
    paddingBottom: 12,
    gap: 14,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
  },
  zoneChipsWrapper: {
    marginHorizontal: -20,
    marginBottom: -4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 20,
    gap: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  dropdown: {
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    height: 52,
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  dropdownMenu: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    overflow: "hidden",
    marginTop: 4,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownItemText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  phHeader: {
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  phBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
  phBadgeText: {
    color: Colors.primary,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  phSliderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 10,
    marginBottom: 10,
  },
  phMin: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Inter_600SemiBold",
    width: 20,
    textAlign: "center",
  },
  phMax: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Inter_600SemiBold",
    width: 24,
    textAlign: "center",
  },
  phSlider: {
    flex: 1,
    height: 40,
  },
  nutrientsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  nutrientGridItem: {
    width: "50%",
    paddingHorizontal: 4,
  },
  toggleRow: {
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  switchWithLabels: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  switchLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  generateBtnContainer: {
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  generateBtn: {
    borderRadius: 18,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  generateBtnText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
});
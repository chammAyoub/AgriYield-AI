import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Platform,
  Pressable,
  Animated as RNAnimated,
  Modal,
  Vibration
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Droplet,
  TrendingDown,
  MapPin,
  Bell,
  Clock,
  ChevronRight,
  ChevronLeft,
} from "lucide-react-native";
import { router } from "expo-router";
import { useApp } from "@/context/AppContext";
import { CircularProgress } from "@/components/CircularProgress";
import { AlertCard, type AlertItem } from "@/components/AlertCard";
import { StatCard } from "@/components/StatCard";
import { ZoneChips } from "@/components/ZoneChips";
import Colors from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";

type ZoneKey = "global" | "A1" | "B2" | "C3";

const ZONE_DATA: Record<ZoneKey, { target: number; savings: number; activeZones: number }> = {
  global: { target: 4000, savings: 760, activeZones: 6 },
  A1:     { target: 1400, savings: 320, activeZones: 2 },
  B2:     { target: 1800, savings: 260, activeZones: 2 },
  C3:     { target:  800, savings: 180, activeZones: 2 },
};

export default function DashboardScreen() {
  const { t, isRTL } = useApp();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedZone, setSelectedZone] = useState<ZoneKey>("global");

  const zoneData = ZONE_DATA[selectedZone];
  const target = zoneData.target;

  // ✅ STATES (Zdt lik urgencyType hna)
  const [consumption, setConsumption] = useState(0);
  const [realAlerts, setRealAlerts] = useState<AlertItem[]>([]); 
  const [showUrgency, setShowUrgency] = useState(false);
  const [urgencyType, setUrgencyType] = useState<"fuite" | "sur-irrigation" | null>(null);

  // ✅ REFS
  const alerteDeclenchee = useRef(false);
  const dotScale = useRef(new RNAnimated.Value(1)).current;

  const ZONES = [
    { key: "global", label: t("allZones") },
    { key: "A1", label: `${t("zonePrefix")} A1` },
    { key: "B2", label: `${t("zonePrefix")} B2` },
    { key: "C3", label: `${t("zonePrefix")} C3` },
  ];

  // ✅ FETCH API MRIGEL M3A L'BACKEND
  const fetchConsommation = async () => {
    try {
      const zoneParam = selectedZone === "global" ? "global" : `Zone%20${selectedZone}`;
      const res = await fetch(`http://192.168.45.244:8000/api/dashboard/${zoneParam}`);
      if (res.ok) {
        const data = await res.json();
        setConsumption(data.consumption);
        setRealAlerts(data.alerts || []);
        
        // 🚨 L'BACKEND HOWA LI KI-GOUL LINA WACH CONFIRMÉE B 3 LECTURES AWLA LA
        if (data.etat === "CRITIQUE_FUITE" && !alerteDeclenchee.current) {
           setUrgencyType("fuite");
           alerteDeclenchee.current = true;
           setShowUrgency(true);
           Vibration.vibrate([500, 1000, 500, 1000], true); // Vibreur Continu
        } 
        else if (data.etat === "CRITIQUE_SUR_IRRIGATION" && !alerteDeclenchee.current) {
           setUrgencyType("sur-irrigation");
           alerteDeclenchee.current = true;
           setShowUrgency(true);
           Vibration.vibrate([500, 1000, 500, 1000], true); // Vibreur Continu
        }
      }
    } catch (error) {
      console.log("Erreur Fetch:", error);
    }
  };

  const handleReglerProbleme = () => {
    setShowUrgency(false);
    setUrgencyType(null);
    alerteDeclenchee.current = false;
    Vibration.cancel(); // ✅ SKKT L'VIBREUR MLI L'FELLAH Y-CLIKI
  };

  // 🔄 REFRESH AUTO CHAQUE 3 SECONDES
  useEffect(() => {
    fetchConsommation(); 
    const interval = setInterval(fetchConsommation, 3000); 
    return () => clearInterval(interval);
  }, [selectedZone]);

  useEffect(() => {
    RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(dotScale, { toValue: 1.3, duration: 600, useNativeDriver: true }),
        RNAnimated.timing(dotScale, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConsommation();
    setRefreshing(false);
  };

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <LinearGradient colors={["#f0fdf4", "#ecfdf5"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: topInset + 16, paddingBottom: bottomInset + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />
        }
      >
        {/* Header */}
        <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <View style={{ alignItems: isRTL ? "flex-end" : "flex-start" }}>
            <Text style={[styles.welcome, { textAlign: isRTL ? "right" : "left" }]}>{t("welcomeBack")}</Text>
            <Text style={[styles.farmerName, { textAlign: isRTL ? "right" : "left" }]}>{t("farmerName")}</Text>
          </View>
          <View style={styles.statusBadge}>
            <RNAnimated.View style={[styles.statusDot, { transform: [{ scale: dotScale }] }]} />
            <Text style={styles.statusText}>{t("active")}</Text>
          </View>
        </View>

        {/* Zone Chips */}
        <View style={styles.zoneChipsWrapper}>
          <ZoneChips zones={ZONES} selectedZone={selectedZone} onSelect={(k) => setSelectedZone(k as ZoneKey)} isRTL={isRTL} showIcon={true} />
        </View>

        {/* Water Consumption Card */}
        <View style={styles.waterCard}>
          <LinearGradient colors={["rgba(16,185,129,0.08)", "transparent"]} style={styles.waterCardHeaderStrip} />
          <View style={[styles.waterHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <View style={styles.waterIcon}>
              <Droplet size={20} color={Colors.secondary} strokeWidth={2} />
            </View>
            <Text style={styles.waterTitle}>{t("todayConsumption")}</Text>
          </View>

          <View style={styles.progressSection}>
            <CircularProgress
              progress={target > 0 ? consumption / target : 0}
              value={consumption}
              unit={t("liters")}
              label={`/ ${target.toLocaleString()} L`}
            />

            <View style={styles.waterStats}>
              <View style={styles.waterStatItem}>
                <Text style={styles.waterStatLabel}>{t("target")}</Text>
                <Text style={styles.waterStatValue}>{target.toLocaleString()} L</Text>
              </View>
              <View style={styles.waterStatDivider} />
              <View style={styles.waterStatItem}>
                <Text style={styles.waterStatLabel}>{t("efficiency")}</Text>
                <Text style={[styles.waterStatValue, { color: Colors.primary }]}>
                  {Math.max(0, Math.round((1 - consumption / target) * 100))}%
                </Text>
              </View>
              <View style={styles.waterStatDivider} />
              <View style={styles.waterStatItem}>
                <Text style={styles.waterStatLabel}>{t("irrigationStatus")}</Text>
                <View style={styles.irrigRow}>
                  <View style={[styles.irrigDot, { backgroundColor: Colors.primary }]} />
                  <Text style={[styles.waterStatValue, { fontSize: 13 }]}>{t("irrigationActive")}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <Text style={[styles.sectionTitle, { textAlign: isRTL ? "right" : "left" }]}>{t("stats")}</Text>
        <View style={styles.statsRow}>
          <StatCard label={t("savings")} value={String(zoneData.savings)} unit="L" icon={TrendingDown} iconColor={Colors.primary} iconBg={Colors.primaryLight} delay={0} trend={-12} />
          <StatCard label={t("zones")} value={String(zoneData.activeZones)} icon={MapPin} iconColor={Colors.secondary} iconBg={Colors.secondaryLight} delay={100} />
          <StatCard label={t("alerts")} value={String(realAlerts.length)} icon={Bell} iconColor={Colors.amber} iconBg={Colors.amberLight} delay={200} />
        </View>

        {/* Alerts */}
        <View style={[styles.alertsHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>{t("alerts")}</Text>
          <View style={[styles.alertBadge, { backgroundColor: realAlerts.some((a) => a.severity === "high") ? Colors.redLight : Colors.amberLight }]}>
            <Text style={[styles.alertBadgeText, { color: realAlerts.some((a) => a.severity === "high") ? Colors.red : Colors.amber }]}>
              {realAlerts.length}
            </Text>
          </View>
        </View>

        {realAlerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} isRTL={isRTL} />
        ))}

        {/* History Button */}
        <Pressable onPress={() => router.push("/history")} style={({ pressed }) => [styles.historyBtn, { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <LinearGradient colors={["#10b981", "#0d9488"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.historyBtnGradient}>
            <Clock size={18} color={Colors.white} strokeWidth={2} />
            <Text style={styles.historyBtnText}>{t("viewHistory")}</Text>
            <ChevronIcon size={18} color={Colors.white} strokeWidth={2} />
          </LinearGradient>
        </Pressable>
      </ScrollView>

      {/* 🚨 DYNAMIC POP-UP: KI-TBEDDEL B DESIGN 3LA 7SSAB L'MOCHKIL */}
      <Modal visible={showUrgency} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* L'Icona kat-tbeddel */}
            <View style={[styles.iconDanger, { backgroundColor: urgencyType === "fuite" ? "#fee2e2" : "#e0f2fe" }]}>
              <Text style={{ fontSize: 40 }}>{urgencyType === "fuite" ? "🚨" : "🌊"}</Text>
            </View>
            
            {/* L'3nwan kay-tbeddel */}
            <Text style={[styles.modalTitle, { color: urgencyType === "fuite" ? "#dc2626" : "#0284c7" }]}>
              {urgencyType === "fuite" ? "DANGER FUITE !" : "SUR-IRRIGATION !"}
            </Text>
            
            {/* L'Message kay-tbeddel */}
            <Text style={styles.modalText}>
              {urgencyType === "fuite" 
                ? `Une chute de pression (0 L) a été détectée dans la ${selectedZone === "global" ? "zone" : `Zone ${selectedZone}`}. Risque de fuite grave.`
                : `L'irrigation a dépassé la limite normale 3 fois de suite dans la ${selectedZone === "global" ? "zone" : `Zone ${selectedZone}`}.`
              }
            </Text>
            
            {/* L'Btouna kat-tbeddel f Loun */}
            <Pressable 
              style={[styles.btnRegler, { backgroundColor: urgencyType === "fuite" ? "#ef4444" : "#0ea5e9" }]} 
              onPress={handleReglerProbleme}
            >
              <Text style={styles.btnReglerText}>Intervenir et Arrêter l'Alarme</Text>
            </Pressable>

          </View>
        </View>
      </Modal>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 8 },
  header: { alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  welcome: { fontSize: 15, color: Colors.textSecondary, fontFamily: "Inter_500Medium" },
  farmerName: { fontSize: 26, fontWeight: "700", color: Colors.text, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: Colors.primaryLight, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  statusText: { fontSize: 13, color: Colors.primaryDark, fontFamily: "Inter_600SemiBold" },
  waterCard: { backgroundColor: Colors.surface, borderRadius: 24, padding: 24, gap: 20, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 6, marginBottom: 12, position: "relative", overflow: "hidden" },
  waterCardHeaderStrip: { position: "absolute", top: 0, left: 0, right: 0, height: 40 },
  waterHeader: { alignItems: "center", gap: 12 },
  waterIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.secondaryLight, alignItems: "center", justifyContent: "center" },
  waterTitle: { fontSize: 17, fontWeight: "700", color: Colors.text, fontFamily: "Inter_700Bold" },
  progressSection: { alignItems: "center", gap: 24 },
  waterStats: { flexDirection: "row", justifyContent: "space-between", width: "100%", backgroundColor: "#f8fafc", paddingVertical: 16, paddingHorizontal: 12, borderRadius: 16 },
  waterStatItem: { alignItems: "center", flex: 1, gap: 6 },
  waterStatLabel: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Inter_500Medium", textAlign: "center" },
  waterStatValue: { fontSize: 15, fontWeight: "700", color: Colors.text, fontFamily: "Inter_700Bold", textAlign: "center" },
  waterStatDivider: { width: 1, backgroundColor: Colors.border, alignSelf: "stretch" },
  irrigRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  irrigDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: Colors.text, fontFamily: "Inter_700Bold", marginBottom: 8, marginTop: 8, letterSpacing: -0.3 },
  zoneChipsWrapper: { marginHorizontal: -20, marginBottom: 4 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  alertsHeader: { alignItems: "center", justifyContent: "space-between", marginTop: 12, marginBottom: 12 },
  alertBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  alertBadgeText: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  historyBtn: { borderRadius: 16, marginTop: 8, marginBottom: 4, overflow: "hidden", shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 5 },
  historyBtnGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, paddingHorizontal: 24 },
  historyBtnText: { flex: 1, textAlign: "center", color: Colors.white, fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold", letterSpacing: 0.2 },
  
  /* 🚨 STYLES DYAL POP-UP */
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "85%", backgroundColor: "white", borderRadius: 24, padding: 24, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 10 },
  iconDanger: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  modalText: { fontSize: 15, color: "#4b5563", textAlign: "center", marginBottom: 24, lineHeight: 22 },
  btnRegler: { width: "100%", padding: 16, borderRadius: 12, alignItems: "center" },
  btnReglerText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
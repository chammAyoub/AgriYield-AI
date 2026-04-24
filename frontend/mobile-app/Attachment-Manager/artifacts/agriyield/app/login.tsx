import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react-native";
import { useApp } from "@/context/AppContext";
import { AgriLogo } from "@/components/AgriLogo";
import Colors from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

export default function LoginScreen() {
  const { t, setIsLoggedIn } = useApp();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("demo@agriyield.ai");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(-30)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(logoTranslateY, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(formOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(formTranslateY, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setIsLoggedIn(true);
    router.replace("/(tabs)");
  };

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const emailFocused = focusedField === "email";
  const passFocused = focusedField === "password";

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient colors={["#f0fdf4", "#ecfdf5", "#d1fae5"]} style={styles.flex}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: topInset + 40, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <Animated.View
            style={[
              styles.logoSectionContainer,
              { opacity: logoOpacity, transform: [{ translateY: logoTranslateY }] },
            ]}
          >
            {Platform.OS === "web" ? (
              <View style={styles.logoSectionBlurWeb}>
                <AgriLogo size={88} showText={true} />
                <Text style={styles.tagline}>{t("tagline")}</Text>
              </View>
            ) : (
              <BlurView intensity={60} tint="light" style={styles.logoSectionBlur}>
                <AgriLogo size={88} showText={true} />
                <Text style={styles.tagline}>{t("tagline")}</Text>
              </BlurView>
            )}
          </Animated.View>

          {/* Form */}
          <Animated.View
            style={[
              styles.form,
              { opacity: formOpacity, transform: [{ translateY: formTranslateY }] },
            ]}
          >
            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t("email")}</Text>
              <View style={[styles.inputRow, emailFocused && styles.inputRowFocused]}>
                <Mail
                  size={18}
                  color={emailFocused ? Colors.primary : Colors.textSecondary}
                  strokeWidth={2}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder={t("emailPlaceholder")}
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t("password")}</Text>
              <View style={[styles.inputRow, passFocused && styles.inputRowFocused]}>
                <Lock
                  size={18}
                  color={passFocused ? Colors.primary : Colors.textSecondary}
                  strokeWidth={2}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder={t("passwordPlaceholder")}
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPass}
                  autoComplete="password"
                />
                <Pressable onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  {showPass ? (
                    <EyeOff size={18} color={Colors.textSecondary} strokeWidth={2} />
                  ) : (
                    <Eye size={18} color={Colors.textSecondary} strokeWidth={2} />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Login Button */}
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => [
                styles.loginBtnContainer,
                { transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}
            >
              <LinearGradient
                colors={["#10b981", "#0d9488"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.loginBtn}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <>
                    <LogIn size={20} color={Colors.white} strokeWidth={2} />
                    <Text style={styles.loginBtnText}>{t("loginButton")}</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>

            <Text style={styles.hint}>
              {Platform.OS === "web"
                ? "Demo: saisir n'importe quel email / mot de passe"
                : "Scannez le QR code pour tester sur votre appareil"}
            </Text>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 48,
  },
  logoSectionContainer: {
    width: "100%",
    alignItems: "center",
  },
  logoSectionBlur: {
    padding: 32,
    borderRadius: 40,
    alignItems: "center",
    gap: 16,
    overflow: "hidden",
  },
  logoSectionBlurWeb: {
    padding: 32,
    borderRadius: 40,
    alignItems: "center",
    gap: 16,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  tagline: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    marginTop: 4,
  },
  form: {
    width: "100%",
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 28,
    gap: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  fieldGroup: { gap: 10 },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
    marginLeft: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "transparent",
    paddingHorizontal: 16,
    height: 52,
  },
  inputRowFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    fontFamily: "Inter_500Medium",
    padding: 0,
    height: "100%",
  },
  eyeBtn: { padding: 4 },
  loginBtnContainer: {
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  loginBtn: {
    borderRadius: 16,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  loginBtnText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
  hint: {
    fontSize: 13,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 8,
  },
});

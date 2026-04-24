export type TranslationKey = keyof typeof fr;

export const fr = {
  appName: "AgriYield AI",
  tagline: "Irrigation intelligente & diagnostic agronomique",

  // Auth
  login: "Connexion",
  email: "Adresse e-mail",
  password: "Mot de passe",
  loginButton: "Se connecter",
  loginLoading: "Connexion en cours...",
  emailPlaceholder: "agriculteur@exemple.com",
  passwordPlaceholder: "••••••••",

  // Navigation
  dashboard: "Tableau de bord",
  agronomic: "Suivi agronomique",
  prediction: "Prédiction",
  settings: "Paramètres",

  // Zones
  allZones: "Vue Globale",
  selectZone: "Sélectionner une zone",
  zonePrefix: "Zone",

  // Dashboard
  welcomeBack: "Bienvenue,",
  farmerName: "Agriculteur",
  todayConsumption: "Consommation du jour",
  liters: "Litres",
  target: "Objectif",
  alerts: "Alertes récentes",
  noAlerts: "Aucune alerte pour le moment",
  viewAll: "Voir tout",
  stats: "Statistiques",
  efficiency: "Efficacité",
  savings: "Économies",
  zones: "Zones",
  active: "Actif",
  irrigationStatus: "Statut d'irrigation",
  irrigationActive: "Irrigation active",
  irrigationIdle: "Système en veille",
  lastUpdate: "Dernière mise à jour",

  // Alert Types
  alertOverIrrigation: "Sur-irrigation détectée",
  alertLeak: "Fuite détectée",
  alertDeficiency: "Carence détectée",
  alertLow: "Faible",
  alertMedium: "Moyen",
  alertHigh: "Élevé",
  zone: "Zone",
  minutesAgo: "min",
  hoursAgo: "h",

  // Agronomic Form
  agronomicTitle: "Suivi Agronomique",
  agronomicSubtitle: "Renseignez les données de votre parcelle pour obtenir une prédiction",
  growthStage: "Stade de croissance",
  selectGrowthStage: "Sélectionner le stade",
  soilPH: "pH du sol",
  daysWithout: "Jours sans apport en",
  excessPotassium: "Excès de Potassium",
  yes: "Oui",
  no: "Non",
  generatePrediction: "Générer la prédiction",
  generating: "Analyse en cours...",

  // Growth Stages
  flowering: "Floraison",
  growth: "Croissance",
  fruiting: "Fructification",

  // Nutrients
  zinc: "Zinc",
  calcium: "Calcium",
  iron: "Fer",
  magnesium: "Magnésium",
  nitrogen: "Azote",
  potassium: "Potassium",
  boron: "Bore",
  manganese: "Manganèse",
  phosphorus: "Phosphore",

  // Prediction Result
  predictionTitle: "Résultat de la prédiction",
  riskLabel: "Risque de carence",
  confidence: "Indice de confiance",
  recommendation: "Recommandation",
  newAnalysis: "Nouvelle analyse",
  close: "Fermer",
  noRisk: "Aucun risque détecté",
  lowRisk: "Risque faible",
  mediumRisk: "Risque modéré",
  highRisk: "Risque élevé",

  // Settings
  settingsTitle: "Paramètres",
  language: "Langue",
  french: "Français",
  arabic: "العربية",
  account: "Compte",
  profile: "Mon profil",
  notifications: "Notifications",
  about: "À propos",
  logout: "Se déconnecter",
  version: "Version",
  appVersion: "1.0.0",

  // History
  historyTitle: "Historique des prédictions",
  historyEmpty: "Aucune prédiction enregistrée",
  historyEmptySub: "Générez votre première prédiction depuis le Suivi Agronomique",
  viewHistory: "Voir l'Historique",
  predictionOn: "Prédiction du",
  highConfidence: "Haute confiance",

  // Common
  save: "Enregistrer",
  cancel: "Annuler",
  confirm: "Confirmer",
  error: "Erreur",
  success: "Succès",
  loading: "Chargement...",
  days: "jours",
};

export type Language = "fr";

export const translations: Record<Language, typeof fr> = { fr };

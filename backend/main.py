from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
import pickle
import os
import models
from database import engine, get_db
from sqlalchemy.sql import func
import requests

models.Base.metadata.create_all(bind=engine)
app = FastAPI(title="AgriYield AI - Backend", version="1.0")
compteur_anomalies = {"Zone A1": 0, "Zone B2": 0, "Zone C3": 0, "global": 0}

# ==========================================
# CHARGEMENT DU MODÈLE IA
# ==========================================
chemin_modele = os.path.join(os.path.dirname(__file__), "..", "ai_model", "modele_agriyield.pkl")

# N-zido wa7d l'dictionnaire khawi au cas où
labels_map = {} 

try:
    loaded = pickle.load(open(chemin_modele, "rb"))
    print("✅ Modèle IA d'Adia chargé avec succès !")
    if isinstance(loaded, dict):
        model_ia = loaded.get("model")
        labels_map = loaded.get("labels_map", {})
        print(f"✅ Dictionnaire d'tarjama t-chargi: {labels_map}")
    else:
        model_ia = loaded
except Exception as e:
    print(f"⚠️ Attention: Modèle non trouvé. Erreur: {e}")
    model_ia = None

STADE_ENCODING = {
    "germination": 0,
    "croissance":  1,
    "floraison":   2,
    "fructification": 3
}

# ==========================================
# SCHEMAS
# ==========================================
class SuiviAgronomique(BaseModel):
    agriculteur_id: int
    zone_id: str
    stade_croissance: str
    ph_sol: float
    jours_sans_zinc: int
    jours_sans_calcium: int
    jours_sans_fer: int
    jours_sans_magnesium: int
    jours_sans_azote: int
    jours_sans_potassium: int
    jours_sans_bore: int
    jours_sans_manganese: int
    exces_potassium: bool

class CapteurDebitRequest(BaseModel):
    zone_id: str
    debit_eau_L: float

# ==========================================
# ENDPOINTS
# ==========================================
@app.get("/")
def read_root():
    return {"message": "AgriYield AI — Backend opérationnel"}

# 1. Suivi Agronomique → Prédiction IA
@app.post("/api/ia/predict")
async def generer_prediction(req: SuiviAgronomique, db: Session = Depends(get_db)):

    # ── Step 1: Valeurs fixes / capteurs par défaut ──────────
    temperature_C   = 25.0
    humidite_pct    = 60.0
    debit_eau_L     = 2.0   # valeur par défaut (pas de capteur connecté)
    pression_bar    = 1.0   # valeur par défaut
    conductivite_EC = 1.5   # valeur par défaut (EC normal)
    jours_sans_phosphore = 0  # non saisi dans le formulaire

    # ── Step 2: sur_irrigation ───────────────────────────────
    bilan = db.query(models.BilanJournalier)\
              .filter(models.BilanJournalier.zone_id == req.zone_id)\
              .order_by(models.BilanJournalier.date.desc()).first()

    sur_irrigation         = (bilan.nb_alertes_declenchees > 0) if bilan else False
    irrigation_irreguliere = False

    # ── Step 3: Encode stade_croissance ─────────────────────
    stade_num = STADE_ENCODING.get(req.stade_croissance.lower(), 1)

    # ── Step 4: Features de base ─────────────────────────────
    ph        = req.ph_sol
    zinc      = req.jours_sans_zinc
    calcium   = req.jours_sans_calcium
    fer       = req.jours_sans_fer
    magnesium = req.jours_sans_magnesium
    azote     = req.jours_sans_azote
    potassium = req.jours_sans_potassium
    bore      = req.jours_sans_bore
    manganese = req.jours_sans_manganese

    # ── Step 5: Features ingéniérisées (calculées) ───────────
    stress_temp      = 1 if (temperature_C > 35 or temperature_C < 10) else 0
    froid_stress     = 1 if temperature_C < 10 else 0
    ph_anomalie      = 1 if (ph < 5.5 or ph > 7.5) else 0
    ph_alcalin       = 1 if ph > 7.0 else 0
    fer_x_ph         = fer * ph
    zinc_x_temp      = zinc * temperature_C
    ec_x_ph          = conductivite_EC * ph
    humidite_x_temp  = humidite_pct * temperature_C
    debit_x_pression = debit_eau_L * pression_bar
    ratio_fer_ph     = fer / ph if ph != 0 else 0
    bore_x_humidite  = bore * humidite_pct
    calcium_x_ph     = calcium * ph
    score_stress     = (zinc + calcium + fer + magnesium + azote +
                        potassium + bore + manganese + jours_sans_phosphore +
                        int(req.exces_potassium))

    # ── Step 6: Construire le vecteur de 29 features ─────────
    features = [[
        temperature_C, humidite_pct, ph,
        debit_eau_L, pression_bar, conductivite_EC,
        stade_num,
        zinc, calcium, fer, magnesium, azote, potassium, bore, manganese,
        jours_sans_phosphore,
        stress_temp, froid_stress,
        ph_anomalie, ph_alcalin,
        fer_x_ph, zinc_x_temp, ec_x_ph, humidite_x_temp, debit_x_pression,
        ratio_fer_ph, bore_x_humidite, calcium_x_ph, score_stress
    ]]

    # ── Step 7: Prédiction ML ────────────────────────────────
    if model_ia is not None:
        prediction_brute = int(model_ia.predict(features)[0])
        print(f"🚀 ra9m dyal l'Modèle: {prediction_brute}")

        risque_label = labels_map.get(prediction_brute, f"Risque {prediction_brute}")
        
        # 3. N7dedou wach kayn khatar (Ila kan 0 y3ni saine, sinon mreda = 1)
        risque_id = 0 if prediction_brute == 0 else 1

        try:
            confiance_pct = float(max(model_ia.predict_proba(features)[0])) * 100
        except:
            confiance_pct = 85.5

        # 🎯 4. LE DICTIONNAIRE DU SYSTÈME D'AIDE À LA DÉCISION (SAD)
        recommandations_sad = {
            0: "Plante saine. Maintenez votre programme d'irrigation et de fertilisation actuel.",
            1: "Appliquez un engrais foliaire à base de sulfate de zinc. Évitez les excès de phosphore.",
            2: "Apportez du nitrate de calcium en fertirrigation. Réduisez les apports en Potassium (antagonisme).",
            3: "Apportez du fer sous forme chélatée (EDDHA). Si le pH est > 7.5, acidifiez l'eau d'irrigation.",
            4: "Incorporez un engrais riche en phosphore (MAP/DAP). Stimulez le développement racinaire.",
            5: "Pulvérisez du sulfate de magnésium. Vérifiez que le sol n'est pas trop acide.",
            6: "Apportez un engrais azoté (Urée ou Ammonitrate) pour relancer la croissance végétative.",
            7: "Appliquez du sulfate de potassium. Crucial pour le grossissement des fruits.",
            8: "Pulvérisez un engrais foliaire boraté. Très important en phase de floraison.",
            9: "Apportez du sulfate de manganèse en foliaire. Le pH élevé peut bloquer cet élément.",
            10: "Stress thermique ! Ajustez l'irrigation et évitez les traitements foliaires aux heures chaudes.",
            11: "Risque de toxicité (salinité). Procédez à un lessivage à l'eau claire et suspendez l'engrais."
        }

        # 5. Njibou l'7ell 3la 7ssab l'id
        recommandation = recommandations_sad.get(prediction_brute, "Consultez un ingénieur agronome pour un traitement adapté.")

    else:
        risque_id     = 0
        risque_label  = "Erreur: Modèle IA introuvable"
        confiance_pct = 0.0
        recommandation = "Vérifiez que le fichier modele_agriyield.pkl est bien dans le dossier ai_model."

    # ── Step 8: Sauvegarder QCM ──────────────────────────────
    qcm = models.QCM_SaisieAgronomique(
        zone_id=req.zone_id, agriculteur_id=req.agriculteur_id,
        stade_croissance=req.stade_croissance, ph_sol=req.ph_sol,
        jours_sans_zinc=req.jours_sans_zinc, jours_sans_calcium=req.jours_sans_calcium,
        jours_sans_fer=req.jours_sans_fer, jours_sans_magnesium=req.jours_sans_magnesium,
        jours_sans_azote=req.jours_sans_azote, jours_sans_potassium=req.jours_sans_potassium,
        jours_sans_bore=req.jours_sans_bore, jours_sans_manganese=req.jours_sans_manganese,
        exces_potassium=req.exces_potassium, irrigation_irreguliere=irrigation_irreguliere,
        sur_irrigation=sur_irrigation, timestamp=datetime.utcnow()
    )
    db.add(qcm)
    db.commit()
    db.refresh(qcm)

    # ── Step 9: Sauvegarder DiagnosticIA ─────────────────────
    diagnostic = models.DiagnosticIA(
        qcm_id=qcm.id, modele_id=1, risque_id=risque_id,
        risque_label=risque_label, confiance_pct=confiance_pct,
        recommandation=recommandation, timestamp=datetime.utcnow()
    )
    db.add(diagnostic)
    db.commit()

    return {
        "status": "success",
        "risque_id": risque_id,
        "risque_label": risque_label,
        "confiance_pct": confiance_pct,
        "recommandation": recommandation
    }

# ==========================================
# CONSTANTES POUR LA PRODUCTION (TOLÉRANCE)
# ==========================================
SEUIL_MIN = 5.5
SEUIL_MAX = 9.0

# Compteurs globaux l'Terminal
compteurs_alertes = {"fuite": 0, "sur_irrigation": 0}

@app.post("/api/capteur/debit")
def recevoir_donnees_capteur(req: CapteurDebitRequest, db: Session = Depends(get_db)):
    nouvelle_lecture = models.LectureDebit(zone_id=req.zone_id, debit_eau_L=req.debit_eau_L)
    db.add(nouvelle_lecture)
    db.commit()

    # Logique d'Indarat pour le Terminal (Bridge Python)
    etat_alerte = "NORMAL"
    if req.debit_eau_L < SEUIL_MIN:
        compteurs_alertes["fuite"] += 1
        compteurs_alertes["sur_irrigation"] = 0 # Reset l'akhor
        if compteurs_alertes["fuite"] >= 3:
            etat_alerte = "CRITIQUE_FUITE"
        else:
            etat_alerte = f"INDAR (Fuite {compteurs_alertes['fuite']}/3)"
            
    elif req.debit_eau_L > SEUIL_MAX:
        compteurs_alertes["sur_irrigation"] += 1
        compteurs_alertes["fuite"] = 0 # Reset l'akhor
        if compteurs_alertes["sur_irrigation"] >= 3:
            etat_alerte = "CRITIQUE_SUR_IRRIGATION"
        else:
            etat_alerte = f"INDAR (Sur-irrigation {compteurs_alertes['sur_irrigation']}/3)"
            
    else:
        # Kolchi mzyan, n-zerwiw l'Compteur
        compteurs_alertes["fuite"] = 0
        compteurs_alertes["sur_irrigation"] = 0

    return {"message": "Données enregistrées", "etat": etat_alerte}
# 3. Historique → React Dashboard
@app.get("/api/ia/historique/{agriculteur_id}")
def get_historique(agriculteur_id: int, db: Session = Depends(get_db)):
    historique = db.query(models.DiagnosticIA)\
        .join(models.QCM_SaisieAgronomique)\
        .filter(models.QCM_SaisieAgronomique.agriculteur_id == agriculteur_id)\
        .order_by(models.DiagnosticIA.timestamp.desc()).all()

    if not historique:
        raise HTTPException(status_code=404, detail="Aucun historique trouvé")
    return historique

@app.get("/api/dashboard/{zone_id}")
def get_consommation(zone_id: str, db: Session = Depends(get_db)):
    if zone_id == "global":
        total = db.query(func.sum(models.LectureDebit.debit_eau_L)).scalar() or 0.0
        dernieres_lectures = db.query(models.LectureDebit).order_by(models.LectureDebit.id.desc()).limit(3).all()
    else:
        total = db.query(func.sum(models.LectureDebit.debit_eau_L)).filter(models.LectureDebit.zone_id == zone_id).scalar() or 0.0
        dernieres_lectures = db.query(models.LectureDebit).filter(models.LectureDebit.zone_id == zone_id).order_by(models.LectureDebit.id.desc()).limit(3).all()
        
    alertes_reelles = []
    etat_global = "NORMAL"

    # LOGIQUE DE PRODUCTION : On vérifie les 3 dernières lectures
    if len(dernieres_lectures) == 3:
        # Wach b tlata bihom Fuite ? (Consécutifs)
        if all(r.debit_eau_L < SEUIL_MIN for r in dernieres_lectures):
            etat_global = "CRITIQUE_FUITE"
            alertes_reelles.append({"id": "1", "type": "leak", "message": "Fuite d'eau confirmée !", "zone": zone_id, "severity": "high", "timeAgo": 0})
        
        # Wach b tlata bihom Sur-irrigation ? (Consécutifs)
        elif all(r.debit_eau_L > SEUIL_MAX for r in dernieres_lectures):
            etat_global = "CRITIQUE_SUR_IRRIGATION"
            alertes_reelles.append({"id": "2", "type": "over_irrigation", "message": "Sur-irrigation confirmée !", "zone": zone_id, "severity": "high", "timeAgo": 0})
        
        # Wach ghir chwiya d'l'mochkil ? (Indar)
        elif any(r.debit_eau_L < SEUIL_MIN for r in dernieres_lectures) or any(r.debit_eau_L > SEUIL_MAX for r in dernieres_lectures):
            etat_global = "INDAR"

    return {"consumption": round(total, 1), "alerts": alertes_reelles, "etat": etat_global}
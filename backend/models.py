from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Agriculteur(Base):
    __tablename__ = "agriculteurs"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    mot_de_passe = Column(String(255))

class BilanJournalier(Base):
    """
    Katsauvegardi l'historique d l'irrigation par zone w par nhar 
    (Bach n3erfou wach kayn sur-irrigation ola la 9bel mansiftoha l'IA)
    """
    __tablename__ = "bilans_journaliers"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(String(50), index=True)
    date = Column(DateTime, default=datetime.utcnow)
    nb_alertes_declenchees = Column(Integer, default=0)

class QCM_SaisieAgronomique(Base):
    """
    input: Katjme3 ga3 les 15 features li kaytsnna l'modèle ia
    """
    __tablename__ = "qcm_saisies"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(String(50), index=True)
    agriculteur_id = Column(Integer, ForeignKey("agriculteurs.id"))
    
    stade_croissance = Column(String(50))
    ph_sol = Column(Float)
    jours_sans_zinc = Column(Integer, default=0)
    jours_sans_calcium = Column(Integer, default=0)
    jours_sans_fer = Column(Integer, default=0)
    jours_sans_magnesium = Column(Integer, default=0)
    jours_sans_azote = Column(Integer, default=0)
    jours_sans_potassium = Column(Integer, default=0)
    jours_sans_bore = Column(Integer, default=0)
    jours_sans_manganese = Column(Integer, default=0)
    exces_potassium = Column(Boolean, default=False)
    
    # Features générées auto
    irrigation_irreguliere = Column(Boolean, default=False)
    sur_irrigation = Column(Boolean, default=False)
    
    timestamp = Column(DateTime, default=datetime.utcnow)

    diagnostic = relationship("DiagnosticIA", back_populates="qcm", uselist=False)

class DiagnosticIA(Base):
    __tablename__ = "diagnostics_ia"

    id = Column(Integer, primary_key=True, index=True)
    qcm_id = Column(Integer, ForeignKey("qcm_saisies.id"))
    modele_id = Column(Integer, default=1)
    
    risque_id = Column(Integer)
    risque_label = Column(String(100)) # Ex: "Carence en Calcium"
    confiance_pct = Column(Float)      # Ex: 92.5
    recommandation = Column(String(255))
    
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relation inverse
    qcm = relationship("QCM_SaisieAgronomique", back_populates="diagnostic")

class LectureDebit(Base):
    __tablename__ = "lectures_debit"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(String(50), index=True)
    debit_eau_L = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
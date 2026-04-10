#include <LiquidCrystal.h>

// Branchements : RS=12, E=11, D4=6, D5=3, D6=4, D7=5
LiquidCrystal lcd(12, 11, 6, 3, 4, 5);

const int pinCapteur = 2; // Pin interrupt 0 sur l'Arduino Uno
volatile int pulsations = 0;

unsigned long tempsPrecedent = 0;
float debitLmin = 0.0;

// Utilisation d'un ID pour identifier la zone dans le JSON
const String zoneID = "Zone_A"; 

void gestionInterruption() {
  pulsations++;
}

void setup() {
  Serial.begin(9600);
  lcd.begin(16, 2);
  
  pinMode(pinCapteur, INPUT_PULLUP);
  // Utilisation de FALLING pour détecter le front descendant
  attachInterrupt(digitalPinToInterrupt(pinCapteur), gestionInterruption, FALLING);
  
  lcd.print("Systeme Pret");
  delay(1000);
}

void loop() {
  unsigned long tempsActuel = millis();
  
  // Calcul chaque seconde
  if (tempsActuel - tempsPrecedent >= 1000) {
    
    // Désactiver les interruptions le temps du calcul pour éviter les erreurs de lecture
    noInterrupts();
    int pulseCount = pulsations;
    pulsations = 0;
    interrupts();

    // Formule YF-S201: (Fréquence / 7.5)
    // On force le calcul en float pour garder les décimales
    debitLmin = (float)pulseCount / 7.5;
    
    // --- Affichage LCD ---
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Debit Reel:");
    lcd.setCursor(0, 1);
    lcd.print(debitLmin);
    lcd.print(" L/min");

    // --- Envoi Série au format JSON ---
    // Format attendu: {"zone_id":"Zone_A", "debit_litres": X.XX}
    Serial.print("{\"zone_id\":\"");
    Serial.print(zoneID);
    Serial.print("\", \"debit_litres\": ");
    Serial.print(debitLmin);
    Serial.println("}");

    tempsPrecedent = tempsActuel;
  }
}
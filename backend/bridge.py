import serial
import requests
import json
import time

# 🔌 L'Port li ghay-qra mno Python (Bima ana Proteus f COM4, Python ghay-qra mn COM5)
PORT = 'COM5' 
VITESSE = 9600

# 🌐 L'URL dyal FastAPI (Localhost 7it khddamin f nfs l'PC)
URL_FASTAPI = "http://127.0.0.1:8000/api/capteur/debit"

print(f"🔌 Kantsnnaw l'Données mn Proteus f l'port {PORT}...")

try:
    arduino = serial.Serial(PORT, VITESSE, timeout=1)
    
    while True:
        if arduino.in_waiting > 0:
            ligne = arduino.readline().decode('utf-8').strip()
            print(f"📡 Ja mn Proteus: {ligne}")
            
            try:
                data = json.loads(ligne)
                res = requests.post(URL_FASTAPI, json=data)
                print(f"✅ Siftnah l FastAPI ! Jawab: {res.json().get('etat')}")
            except Exception as e:
                print(f"⚠️ Erreur JSON awla Network: {e}")
                
except Exception as e:
    print(f"❌ Mochkil f l'Port {PORT}. T2kked wach Virtual Serial Port khddam: {e}")
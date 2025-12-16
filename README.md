# Grammel

**Grammel** ist ein Wordle-ähnliches Ratespiel für Phonetiker:innen.

Statt Buchstaben werden **IPA-Phonemsequenzen** geraten. Nach jedem Versuch erhält man segmentweise Rückmeldung (korrekt / falsche Position / nicht enthalten). In einer erweiterten Variante steht zusätzlich **akustische Evidenz** zur Verfügung: ein aus echten Sprachaufnahmen berechnetes **Spektrogramm mit Formanten**.

Dieses Repository enthält die **Datenpipeline und Frontend-Assets**, mit denen das Spiel aufgebaut wird.

> [!NOTE]
> This project uses IPA transcriptions from Wiktionary (CC BY-SA 4.0) and audio recordings from Wikimedia Commons.
> Derived data and visualizations are provided under CC BY-SA 4.0.
> Original contributors are credited via Wiktionary and Wikimedia Commons.

## Überblick

Die Pipeline besteht aus folgenden Schritten:

1. **Extraktion lexikalischer Daten** aus dem deutschen Wiktionary (über Kaikki)
    
2. **Filterung** auf Einträge mit fünf IPA-Segmenten und Audio
    
3. **Normalisierung und Segmentierung** der IPA-Transkriptionen
    
4. **Herunterladen der Audiodaten** (Wikimedia Commons, robot-policy-konform)
    
5. **Erzeugung von Spektrogramm- und Formanten-Plots**
    
6. Bereitstellung als **statische Webanwendung**
    

Im Frontend werden ausschließlich vorab erzeugte JSON- und PNG-Dateien verwendet; es findet **keine Signalverarbeitung im Browser** statt.

## Datenquellen

- **Lexikalische Daten**  
    [https://kaikki.org](https://kaikki.org)
- (Dump des deutschen Wiktionary)
- **Audioaufnahmen**  
    Wikimedia Commons (OGG / MP3)
    

Alle Anfragen an Wikimedia erfolgen mit einem aussagekräftigen `User-Agent` und mit Rate-Limiting gemäß der Robot-Policy.

## Voraussetzungen

### Mit Nix (empfohlen)

Alle Abhängigkeiten sind in `shell.nix` definiert:

`nix-shell`

Enthalten sind u. a.:

- Python 3.12
    
- numpy, scipy
    
- librosa, soundfile
    
- pydub
    
- praat-parselmouth
    
- matplotlib
    
- pandas, jupyterlab
    

FFmpeg muss systemweit oder über Nix verfügbar sein.

## Build-Pipeline

### 1️⃣ Wiktionary-Extrakt herunterladen

`make de-extract.jsonl.gz make de-extract.jsonl`

### 2️⃣ `words.json` erzeugen

`make words.json`

Dies lädt den deutschen Wiktionary-Dump von Kaikki herunter und entpackt ihn.

Dabei wird:

- nur die ersten `LIMIT` Einträge verarbeitet (Standard: 10 000)
    
- `filter.jq` angewendet, um:
    
    - IPA zu extrahieren
        
    - Symbole zu normalisieren
        
    - in Phonemsegmente zu zerlegen
        
    - nur Einträge mit **genau fünf Segmenten** zu behalten
        
    - nur Einträge mit verfügbarer Audioaufnahme zu behalten
        

Das Limit kann angepasst werden:

`make words.json LIMIT=50000`

### 3️⃣ Spektrogramm- und Formanten-Plots erzeugen

`make`

Dieser Schritt führt `spectrograms.py` aus:

- Audio wird heruntergeladen
    
- Berechnet werden:
    
    - Spektrogramm
        
    - Formantverläufe (Praat)
        
- Beides wird in einer PNG-Grafik kombiniert
    
- Ausgabe nach `plots/`
    

Eine Marker-Datei (`plots/.generated`) verhindert versehentliches Neuberechnen.

## Frontend starten

Das Projekt kann als statische Website ausgeliefert werden:

`make serve`

Anschließend im Browser öffnen:

`http://localhost:8000`

Das Frontend lädt:

- `words.json`
    
- die zugehörigen Plot-Bilder aus `plots/`
    

Ein Server-Backend ist nicht erforderlich.

## Aufbau der Plots

Jede Grafik enthält:

- **oben**: Spektrogramm (Zeit × Frequenz)
    
- **unten**: Formantspuren (F1–F3)
    
- gemeinsame Zeitachse
    

Damit lassen sich u. a. erschließen:

- Vokalqualität
    
- Artikulationsart und -ort von Konsonanten
    
- Segmentgrenzen
    

---

## Hinweise zur IPA-Verarbeitung

- Betonung, Länge und Silbengrenzen werden entfernt
    
- Ausgewählte Affrikaten und silbische Konsonanten werden normalisiert
    
- Gängige deutsche Diphthonge bleiben **ein Segment**
    
- Das Spiel arbeitet auf **segmentaler IPA-Ebene**, nicht phonemisch
    

Die Normalisierungsregeln sind in `filter.jq` definiert.


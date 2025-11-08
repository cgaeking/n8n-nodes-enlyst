# 🚀 n8n-nodes-enlyst

**Offizielle n8n-Integration für Enlyst** - die KI-basierte Lead-Anreicherungsplattform.

[![npm version](https://badge.fury.io/js/n8n-nodes-enlyst.svg)](https://badge.fury.io/js/n8n-nodes-enlyst)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Enlyst](https://enlyst.app) ist eine KI-basierte Lead-Anreicherungsplattform, die aus einfachen Unternehmenslisten vollständige Lead-Profile mit Geschäftsführer-Daten, E-Mail-Adressen und personalisierten Ansprachen erstellt.

[n8n](https://n8n.io/) ist eine [fair-code lizenzierte](https://docs.n8n.io/sustainable-use-license/) Workflow-Automatisierungsplattform.

## 📦 Enthaltene Nodes

### **1. Enlyst Node** - API-Operationen
- ✅ **Projekte verwalten** (Erstellen, Abrufen, Aktualisieren, Löschen)
- ✅ **Lead-Daten abrufen** mit Pagination und Multi-Status-Filterung
- ✅ **Leads finden** via Google Maps Suche mit Geocoding
- ✅ **Leads hinzufügen** aus externen Quellen mit Custom Data
- ✅ **Massen-Enrichment** starten (alle, gefiltert, einzelne Rows)
- ✅ **CSV-Upload** für neue Lead-Listen
- ✅ **CSV-Download** mit Status-Filterung

### **2. Enlyst Trigger** - Webhook Automation
- 🪝 **Enrichment Completion** - Wird ausgelöst wenn Massen-Enrichment fertig ist
- 🔒 **API-Key Authentication** für sicheren Webhook-Empfang
- 🎯 **Projekt-Filter** für spezifische Projekte
- 📊 **Enrichment-Statistiken** als Workflow-Daten

## Installation

### Option 1: Community Nodes (Empfohlen)
1. Gehen Sie zu **Settings > Community Nodes** in n8n
2. Klicken Sie auf **Install a community node**
3. Geben Sie ein: `n8n-nodes-enlyst`
4. Klicken Sie auf **Install**

### Option 2: NPM Installation
```bash
npm install n8n-nodes-enlyst
```

## Operations

### Enlyst Node
#### Projekt-Operationen
- **Create Project** - Neues Projekt erstellen
- **Get All Projects** - Alle Projekte abrufen  
- **Get Project by ID** - Spezifisches Projekt abrufen
- **Update Project** - Projekt aktualisieren
- **Delete Project** - Projekt löschen

#### Lead-Operationen
- **Get Project Data** - Lead-Daten mit Pagination und Multi-Status-Filter abrufen
- **Find Leads** - Leads via Google Maps suchen (mit optionaler Projektzuweisung)
- **Add Leads** - Leads aus externen Quellen importieren
- **Enrich Leads** - Massen-Enrichment starten
- **Upload CSV** - CSV-Datei in Projekt hochladen
- **Download CSV** - Projekt-Daten als CSV exportieren

### Enlyst Trigger
- **Enrichment Completed** - Webhook-Trigger für abgeschlossene Enrichments

## Credentials

Sie benötigen Enlyst API-Credentials:

1. **Base URL**: Ihre Enlyst-Instanz URL (Standard: `https://enlyst.app/api`)
2. **API Key**: Ihr Enlyst API-Schlüssel

### API-Schlüssel erhalten:
1. Melden Sie sich bei [Enlyst](https://enlyst.app) an
2. Gehen Sie zu **Einstellungen > API-Schlüssel**  
3. Erstellen Sie einen neuen API-Schlüssel
4. Kopieren Sie den Schlüssel (wird nur einmal angezeigt!)

## Compatibility

Getestet mit n8n Version 1.0+ und Node.js 18+

## Usage

### Webhook-Setup (Enlyst Trigger)
1. Fügen Sie **Enlyst Trigger** zu Ihrem Workflow hinzu
2. Kopieren Sie die Webhook-URL aus n8n
3. Gehen Sie zu Ihrem Enlyst-Projekt > **Einstellungen** > **Allgemeine Webhooks**
4. Aktivieren Sie **"Batch-Enrichment beendet"** und tragen Sie die Webhook-URL ein

### Beispiel-Workflows
- **Lead-Suche & Enrichment**: Find Leads (Google Maps) → Add to Project → Enrich → Notification
- **Automatisches Lead-Enrichment**: Upload CSV → Enrich → Download → Notification
- **CRM-Integration**: Webhook Trigger → Download CSV → HTTP Request (CRM API)
- **Slack-Benachrichtigung**: Webhook Trigger → Slack Message
- **Multi-Source Lead Import**: HTTP Request → Add Leads (mit Custom Data) → Enrich

## Resources

* [n8n Community Nodes Dokumentation](https://docs.n8n.io/integrations/#community-nodes)
* [Enlyst API Dokumentation](https://enlyst.app/api-docs)
* [Enlyst User Docs](https://docs.enlyst.app)
* [GitHub Repository](https://github.com/cgaeking/enlyst)

## Version history

### v0.5.0 (Latest)
**Breaking Changes:**
- 🚨 **Referral Operations entfernt** - Referral-System jetzt über Enlyst UI

**Neue Features:**
- ✅ **Find Leads Operation** - Google Maps Suche für neue Leads
  - Suche nach Standort (Name oder Koordinaten)
  - Automatisches Geocoding via OpenStreetMap
  - Optionale Projektzuweisung
  - Externe Daten werden vollständig gespeichert
- ✅ **Add Leads Operation** - Import von Leads aus externen Quellen
- ✅ **Multi-Status Filter** - Mehrere Status gleichzeitig filtern
- ✅ **Externe Daten Support** - Alle Daten von Google Maps werden als `googleMaps_*` gespeichert

**Verbesserungen:**
- 📊 Externe Daten in expandierbaren Zeilen (Frontend)
- 📁 CSV-Export enthält alle externen Felder
- 🔄 Bessere Handhabung von verschachtelten Objekten (JSON-String Konvertierung)

### v0.4.14
- ✅ **Multi-Select Status Filter** für bessere Datenfilterung
- ✅ Verbesserte Pagination und Query-Parameter

### v0.2.0
- ✅ **Enlyst Trigger Node** hinzugefügt für Webhook-Automation
- ✅ **Enrichment Completion** Events unterstützt
- ✅ **API-Key Authentication** für Webhooks
- ✅ **Projekt-Filter** für spezifische Trigger

### v0.1.0
- ✅ **Enlyst Node** mit vollständiger API-Integration
- ✅ **Projekt- und Lead-Operationen**
- ✅ **CSV-Upload/Download**
- ✅ **Massen-Enrichment** Funktionen

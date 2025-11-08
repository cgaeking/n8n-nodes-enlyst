# 🚀 n8n-nodes-enlyst

**Offizielle n8n-Integration für Enlyst** - die KI-basierte Lead-Anreicherungsplattform.

[![npm version](https://badge.fury.io/js/n8n-nodes-enlyst.svg)](https://badge.fury.io/js/n8n-nodes-enlyst)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Enlyst](https://enlyst.app) ist eine KI-basierte Lead-Anreicherungsplattform, die aus einfachen Unternehmenslisten vollständige Lead-Profile mit Geschäftsführer-Daten, E-Mail-Adressen und personalisierten Ansprachen erstellt.

[n8n](https://n8n.io/) ist eine [fair-code lizenzierte](https://docs.n8n.io/sustainable-use-license/) Workflow-Automatisierungsplattform.

## 📦 Enthaltene Nodes

### **1. Enlyst Node** - API-Operationen

- **Projekte verwalten** (Erstellen, Abrufen, Aktualisieren, Löschen)
- **Lead-Daten abrufen** mit Pagination und Multi-Status-Filterung
- **Leads finden** via Google Maps Suche mit Geocoding
- **Leads hinzufügen** aus externen Quellen mit Custom Data
- **Massen-Enrichment** starten (alle, gefiltert, einzelne Rows)
- **CSV-Upload** für neue Lead-Listen
- **CSV-Download** mit Status-Filterung

### **2. Enlyst Trigger** - Webhook Automation

- **Enrichment Completion** - Wird ausgelöst wenn Massen-Enrichment fertig ist
- **API-Key Authentication** für sicheren Webhook-Empfang
- **Projekt-Filter** für spezifische Projekte
- **Enrichment-Statistiken** als Workflow-Daten

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

## 📋 Available Operations

### 🗂️ Project Actions

#### **Create or Update Project**

Erstellt ein neues Projekt oder aktualisiert ein bestehendes Projekt anhand des Namens.

**Wichtig:** Diese Funktion enthält auch die Webhook-Setup-Funktionalität von "Prepare Project". Sie können beim Erstellen oder Aktualisieren direkt Webhooks konfigurieren.

**Verwendung:**

- Neues Projekt mit Name, Beschreibung und Sprache anlegen
- Bestehendes Projekt finden (anhand Name) und aktualisieren
- Pitchlane-Integration aktivieren/deaktivieren
- Custom Prompts für KI-Enrichment definieren
- Zielsprache für Anreicherung festlegen (Deutsch, English, Español, Français, Italiano, Nederlands, Polski, Português)

**Eingaben:**

- `name` (erforderlich): Projektname
- `description`: Projektbeschreibung
- `pitchlaneIntegration`: Pitchlane-Video-Integration aktivieren
- `customPrompt1/2`: Benutzerdefinierte KI-Prompts
- `targetLanguage`: Zielsprache für Enrichment (Standard: Deutsch)

---

#### **Delete Project**

Löscht ein bestehendes Projekt vollständig.

**Verwendung:**

- Projekt dauerhaft entfernen
- Alle zugehörigen Leads werden ebenfalls gelöscht

**Eingaben:**

- `projectId` (erforderlich): ID des zu löschenden Projekts

---

#### **Get Project by ID**

Ruft ein spezifisches Projekt anhand seiner ID ab.

**Verwendung:**

- Projektdetails abrufen
- Projekt-Konfiguration prüfen
- Basis-URL für andere Operationen erhalten

**Eingaben:**

- `projectId` (erforderlich): ID des Projekts

**Ausgabe:** Vollständige Projektinformationen inkl. Name, Beschreibung, Einstellungen, Erstellungsdatum

---

#### **Get Project by Name**

Ruft ein Projekt anhand des Namens ab (erste Übereinstimmung bei mehreren Projekten).

**Verwendung:**

- Projekt-ID anhand des Namens ermitteln
- Nützlich wenn nur der Name bekannt ist

**Eingaben:**

- `projectName` (erforderlich): Name des Projekts

**Ausgabe:** Projektdetails des ersten gefundenen Projekts mit diesem Namen

---

#### **Get Many Projects**

Listet alle verfügbaren Projekte auf.

**Verwendung:**

- Übersicht über alle Projekte erhalten
- Projekt-IDs für weitere Operationen sammeln
- Projekt-Auswahl in Workflows

**Ausgabe:** Array aller Projekte mit vollständigen Details

---

#### **Prepare Project**

Richtet Webhooks für ein bestehendes Projekt ein. Dies ist **Voraussetzung** für die Verwendung von "Wait for Completion" bei "Enrich Leads".

**Verwendung:**

- Webhook-URL für Enrichment-Benachrichtigungen setzen
- Automatische Benachrichtigung aktivieren wenn Batch-Enrichment abgeschlossen ist
- Notwendig für asynchrone Workflows mit Enrichment-Trigger

**Eingaben:**

- `projectId` (erforderlich): ID des vorzubereitenden Projekts

**Automatische Aktionen:**

- Aktiviert "General Webhooks" für das Projekt
- Setzt `enrichmentWebhookUrl` auf die n8n-Webhook-URL: `{baseUrl}/webhooks/n8n/{projectId}`
- Ermöglicht die Verwendung des **Enlyst Trigger** für dieses Projekt

**Hinweis:** Dies ist eine vereinfachte Alternative zur manuellen Webhook-Konfiguration über "Create or Update Project".

---

### 👥 Lead Actions

#### **Get Leads**

Ruft Lead-Daten eines Projekts mit Pagination und erweiterten Filtermöglichkeiten ab.

**Verwendung:**

- Lead-Daten aus einem Projekt abrufen
- Nur Leads mit bestimmten Status exportieren
- Große Datenmengen mit Pagination verarbeiten

**Eingaben:**

- `projectId` (erforderlich): ID des Projekts
- `page`: Seitennummer (0 = alle Leads)
- `limit`: Max. Anzahl Ergebnisse pro Seite (Standard: 50)
- `status`: Multi-Select-Filter nach Status (Completed, Empty/Null Status, Failed, Pending, Processing, Stopped)

**Ausgabe:** Array mit Lead-Objekten inkl. aller Enrichment-Daten (Name, E-Mail, Ansprache, Custom Data, Google Maps Daten etc.)

---

#### **Enrich Leads**

Startet die KI-basierte Anreicherung von Leads (einzeln oder als Batch).

**Verwendung:**

- Einzelne Leads anreichern
- Alle Leads eines Projekts anreichern
- Gefilterte Leads anreichern (nach Status)
- Spezifische Zeilen anreichern

**Eingaben:**

- `projectId` (erforderlich): ID des Projekts
- `enrichmentType`:
  - `all`: Alle Leads anreichern
  - `filtered`: Nur Leads mit bestimmten Status
  - `singleRow`: Einzelne Zeile (Row ID)
- `status` (bei filtered): Multi-Select-Filter nach Status
- `rowId` (bei singleRow): ID der anzureichernden Zeile
- `waitForCompletion`: Auf Abschluss warten (nur bei Batch-Enrichment)
  - **Voraussetzung:** Projekt muss mit "Prepare Project" vorbereitet sein!

**Enrichment-Prozess:**

1. Lead wird von KI analysiert
2. Geschäftsführer-Informationen werden gesucht
3. E-Mail-Adresse wird ermittelt (via AnyMailFinder)
4. Personalisierte Ansprache wird generiert
5. Status wird auf "Completed" gesetzt

**Hinweis:** Bei `waitForCompletion: true` wartet der Node bis alle Leads fertig sind. Der **Enlyst Trigger** kann alternativ verwendet werden für asynchrone Workflows.

---

#### **Find Leads**

Sucht Leads via Google Maps und fügt sie optional direkt einem Projekt hinzu.

**Verwendung:**

- Leads in bestimmter Region finden
- Google Maps Suche mit Keyword und Ort
- Externe Daten (Adresse, Telefon, Bewertungen) automatisch übernehmen
- Optional: Direkt in Projekt importieren

**Eingaben:**

- `searchKeyword`: Suchbegriff (z.B. "Restaurant", "Zahnarzt", "Handwerksbetrieb")
- `location`: Standort (Stadtname, Adresse oder GPS-Koordinaten)
- `language`: Sprache für Suchergebnisse (Standard: Deutsch)
- `projectId` (optional): Projekt-ID für direkten Import
- `country`: Land-Code für Geocoding (Standard: Deutschland)

**Ausgabe:** Array mit gefundenen Leads inkl. vollständiger Google Maps Daten:

- `googleMaps_place_id`: Eindeutige Place ID
- `googleMaps_name`: Unternehmensname
- `googleMaps_address`: Vollständige Adresse
- `googleMaps_phone`: Telefonnummer
- `googleMaps_website`: Website-URL
- `googleMaps_rating`: Bewertung (1-5 Sterne)
- `googleMaps_reviews`: Anzahl Bewertungen
- `googleMaps_types`: Kategorien (z.B. "restaurant", "cafe")
- `googleMaps_lat/lng`: GPS-Koordinaten

---

#### **Add Leads**

Importiert Leads aus externen Quellen in ein Projekt.

**Verwendung:**

- Leads von anderen APIs übernehmen
- Bestehende Lead-Daten importieren
- Custom Data von externen Systemen mitbringen
- Integration mit CRM-Systemen

**Eingaben:**

- `projectId` (erforderlich): Ziel-Projekt ID
- `leads`: Array von Lead-Objekten

**Lead-Objekt-Struktur:**

```javascript
{
  companyName: "Musterfirma GmbH",  // erforderlich
  website: "https://example.com",    // optional
  externalData: {                    // optional - beliebige Felder
    source: "CRM-System",
    contactPerson: "Max Mustermann",
    customField1: "Wert"
  }
}
```

**Ausgabe:** Bestätigung mit Anzahl importierter Leads

**Hinweis:** Alle Felder in `externalData` werden als `googleMaps_*` Felder gespeichert und in CSV-Exporten inkludiert.

---

### 🔔 Triggers

#### **On Enrichment Finished**

Webhook-Trigger der ausgelöst wird sobald ein Batch-Enrichment abgeschlossen ist.

**Verwendung:**

- Automatische Benachrichtigungen nach Enrichment
- Weiterverarbeitung der angereicherten Daten
- Integration mit CRM, E-Mail, Slack etc.
- Asynchrone Workflows ohne Warten

**Voraussetzungen:**

1. Projekt muss mit **"Prepare Project"** vorbereitet sein
2. Webhook-URL aus n8n Trigger in Enlyst-Projekt hinterlegt

**Setup:**

1. Füge "Enlyst Trigger" zu deinem Workflow hinzu
2. Kopiere die Webhook-URL
3. In Enlyst: Projekt > Einstellungen > Allgemeine Webhooks
4. Aktiviere "Batch-Enrichment beendet" und trage URL ein

**Trigger-Daten:**

- `projectId`: ID des Projekts
- `projectName`: Name des Projekts
- `totalLeads`: Gesamtanzahl Leads
- `enrichedLeads`: Erfolgreich angereicherte Leads
- `completedAt`: Zeitstempel des Abschlusses

**Beispiel-Workflows:**

- **CRM-Sync:** Trigger → Download CSV → HTTP Request (CRM API)
- **Slack-Notification:** Trigger → Format Message → Slack
- **E-Mail-Report:** Trigger → Get Leads → Format HTML → Send Email

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

- **Lead-Suche & CRM-Integration**: Create or Update Project → Find Leads → Enrich Leads → Add Leads to CRM
- **Projekt vorbereiten & Enrichment**: Get Project by Name → Prepare Project → Add Leads → Enrich Leads
- **Google Sheets Integration**: Create or Update Project → Add Leads → Enrich Leads → Add Leads to Google Sheet
- **Slack-Benachrichtigung**: On Enrichment Completed → Slack Message

## Resources

- [n8n Community Nodes Dokumentation](https://docs.n8n.io/integrations/#community-nodes)
- [Enlyst Website](https://enlyst.app)
- [GitHub Repository](https://github.com/cgaeking/n8n-nodes-enlyst)

## Version history

### v0.5.6 (Latest)

> 8 November 2025

**Documentation:**

- Fixed: Example workflows now match actual node operations with realistic use cases

### v0.5.5

> 8 November 2025

**Documentation:**

- Removed: Non-functional docs.enlyst.app link from Resources section

### v0.5.4

> 8 November 2025

**Documentation:**

- Improved: Complete node documentation with detailed descriptions for all operations
- Improved: Renamed "Prepare project with webhook" to "Prepare project" for clarity
- Added: Comprehensive usage examples and parameter explanations
- Added: Clear prerequisites and workflow guidance

### v0.5.3

> 8 November 2025

**Bug Fixes:**

- Fixed: Added documentationUrl property to fix 404 errors when clicking docs link in n8n UI
- Fixed: Links now properly direct to GitHub README instead of placeholder URL

### v0.5.2

> 8 November 2025

**New Features:**

- Added: Prepare Project operation - Setup webhook for existing project without modifying other settings
- Enhanced: API now supports partial updates (optional name parameter)

### v0.5.1

> 8 November 2025

**Bug Fixes:**

- Fixed: setTimeout restriction - replaced with compliant async pattern
- Fixed: Status options now alphabetically sorted
- Fixed: Language options now alphabetically sorted
- Fixed: Removed superfluous required: false properties

### v0.5.0

> 8 November 2025

**Breaking Changes:**

- Removed: Referral resource and Get Stats operation (referral statistics feature removed)

**New Features:**

- Added: Find Leads operation - Search for leads via Google Maps
  - Search by location name OR GPS coordinates
  - Automatic geocoding via OpenStreetMap Nominatim API
  - Optional project assignment (can be used standalone)
  - All external data (address, phone, ratings, etc.) fully preserved
- Added: Add Leads operation - Import leads from external sources
- Added: Multi-Status Filter - Filter by multiple statuses simultaneously
- Added: External Data Support - All Google Maps data stored as `googleMaps_*` fields

**Improvements:**

- External data displayed in expandable table rows (Frontend)
- CSV export automatically includes all external fields
- Better handling of nested objects (JSON string conversion)

### v0.4.14

> 7 November 2025

- Added: Multi-select status filter for project data retrieval
- Improved: Better filtering options for project data queries

### v0.2.0

- Added: Enlyst Trigger Node for webhook automation
- Added: Enrichment Completion event support
- Added: API-Key authentication for webhooks
- Added: Project filter for specific triggers

### v0.1.0

- Added: Enlyst Node with full API integration
- Added: Project and Lead operations
- Added: CSV upload/download functionality
- Added: Batch enrichment features

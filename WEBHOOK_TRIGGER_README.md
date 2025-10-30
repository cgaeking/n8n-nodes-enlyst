# 🪝 Enlyst Webhook Trigger für n8n

Der **Enlyst Trigger** ist ein spezieller Webhook-Trigger für n8n, der automatisch ausgelöst wird, wenn ein Massen-Enrichment in Enlyst abgeschlossen ist.

## 🎯 **Funktionen**

### **Automatische Trigger**
- ✅ **Enrichment Completion** - Wird ausgelöst, wenn alle Leads in einem Projekt angereichert wurden
- ✅ **Projekt-Filter** - Kann auf spezifische Projekte beschränkt werden
- ✅ **Authentifizierung** - Optionale API-Key-Verifizierung für Sicherheit

### **Webhook-Payload**
```json
{
  "event": "enrichment.completed",
  "timestamp": "2024-10-30T15:30:00.000Z",
  "data": {
    "projectId": "proj_123abc",
    "projectName": "Mein Projekt",
    "stats": {
      "total": 100,
      "completed": 85,
      "failed": 10,
      "stopped": 5,
      "queued": 0,
      "processing": 0
    },
    "completedAt": "2024-10-30T15:30:00.000Z"
  }
}
```

## 🚀 **Setup in n8n**

### **1. Trigger-Node hinzufügen**
1. Erstellen Sie einen neuen Workflow in n8n
2. Fügen Sie den **"Enlyst Trigger"** Node hinzu
3. Konfigurieren Sie die gewünschten Einstellungen

### **2. Konfiguration**
- **Authentication**: 
  - `None` - Keine Authentifizierung (für Tests)
  - `API Key` - Verwendet Enlyst API-Credentials zur Verifizierung
- **Events**: `Enrichment Completed` (derzeit einziges verfügbares Event)
- **Project Filter**: Leer lassen für alle Projekte, oder spezifische Projekt-ID eingeben

### **3. Webhook-URL erhalten**
1. Klicken Sie auf "Test Step" im Trigger-Node
2. Kopieren Sie die generierte Webhook-URL
3. Die URL hat das Format: `https://your-n8n.com/webhook/enlyst`

## ⚙️ **Enlyst-Konfiguration**

### **1. Projekt-Einstellungen**
1. Gehen Sie zu Ihrem Enlyst-Projekt
2. Öffnen Sie die **Projekt-Einstellungen**
3. Navigieren Sie zu **"Allgemeine Webhooks"**
4. Aktivieren Sie **"Batch-Enrichment beendet"**
5. Tragen Sie Ihre n8n-Webhook-URL ein

### **2. Webhook-URL Format**
```
https://your-n8n-instance.com/webhook/enlyst
```

## 🧪 **Testen**

### **Mit dem Test-Skript**
```bash
# Webhook-URL von n8n kopieren und einfügen
node test-webhook.js "https://your-n8n.com/webhook/enlyst"
```

### **Mit curl**
```bash
curl -X POST "https://your-n8n.com/webhook/enlyst" \
  -H "Content-Type: application/json" \
  -H "X-Enlyst-Event: enrichment.completed" \
  -d '{
    "event": "enrichment.completed",
    "timestamp": "2024-10-30T15:30:00.000Z",
    "data": {
      "projectId": "test_project",
      "projectName": "Test Project",
      "stats": {
        "total": 100,
        "completed": 85,
        "failed": 10,
        "stopped": 5,
        "queued": 0,
        "processing": 0
      },
      "completedAt": "2024-10-30T15:30:00.000Z"
    }
  }'
```

## 📊 **Workflow-Daten**

Der Trigger-Node stellt folgende Daten für nachfolgende Nodes bereit:

```javascript
{
  "event": "enrichment.completed",           // Event-Typ
  "timestamp": "2024-10-30T15:30:00.000Z",  // Webhook-Zeitstempel
  "projectId": "proj_123abc",                // Enlyst Projekt-ID
  "projectName": "Mein Projekt",             // Projekt-Name
  "stats": {                                 // Statistiken
    "total": 100,                            // Gesamtanzahl Leads
    "completed": 85,                         // Erfolgreich angereichert
    "failed": 10,                            // Fehlgeschlagen
    "stopped": 5,                            // Gestoppt
    "queued": 0,                             // In Warteschlange
    "processing": 0                          // In Bearbeitung
  },
  "completedAt": "2024-10-30T15:30:00.000Z", // Completion-Zeitstempel
  "headers": { ... },                        // HTTP-Headers
  "body": { ... }                            // Vollständige Webhook-Payload
}
```

## 🔄 **Workflow-Beispiele**

### **1. E-Mail-Benachrichtigung**
```
Enlyst Trigger → Send Email
```
Sendet eine E-Mail-Benachrichtigung, wenn das Enrichment abgeschlossen ist.

### **2. Slack-Nachricht**
```
Enlyst Trigger → Slack Node
```
Sendet eine Slack-Nachricht mit Enrichment-Statistiken.

### **3. CRM-Update**
```
Enlyst Trigger → HTTP Request → CRM API
```
Aktualisiert automatisch Ihr CRM-System mit den neuen Lead-Daten.

### **4. CSV-Download & Weiterverarbeitung**
```
Enlyst Trigger → Enlyst Node (Download CSV) → Google Sheets
```
Lädt automatisch die angereicherten Daten herunter und fügt sie zu Google Sheets hinzu.

## 🔒 **Sicherheit**

### **API-Key Authentifizierung**
1. Wählen Sie "API Key" als Authentication-Methode
2. Konfigurieren Sie Ihre Enlyst API-Credentials in n8n
3. Der Webhook validiert den `Authorization: Bearer <token>` Header

### **Event-Validierung**
- Nur subscribierte Events werden verarbeitet
- Ungültige Payloads werden abgelehnt
- Projekt-Filter können unerwünschte Trigger verhindern

## 🐛 **Debugging**

### **Webhook erhält keine Daten**
1. ✅ Webhook-URL korrekt in Enlyst konfiguriert?
2. ✅ n8n-Workflow aktiviert und Trigger bereit?
3. ✅ Firewall/Netzwerk-Einstellungen korrekt?

### **Authentifizierung fehlgeschlagen**
1. ✅ API-Key korrekt in n8n-Credentials konfiguriert?
2. ✅ Authorization-Header wird von Enlyst gesendet?

### **Workflow wird nicht ausgelöst**
1. ✅ Event-Typ in den Trigger-Einstellungen aktiviert?
2. ✅ Projekt-Filter korrekt konfiguriert?
3. ✅ Payload-Struktur entspricht dem erwarteten Format?

## 📝 **Entwicklung**

### **Trigger-Node erweitern**
```typescript
// nodes/Enlyst/EnlystTrigger.node.ts
// Weitere Events können hier hinzugefügt werden
options: [
  {
    name: 'Enrichment Completed',
    value: 'enrichment.completed',
  },
  {
    name: 'Enrichment Started',      // Neu
    value: 'enrichment.started',     // Neu
  },
]
```

### **Neue Webhook-Events**
Um neue Events zu unterstützen, erweitern Sie:
1. Event-Optionen im Trigger-Node
2. Payload-Validierung in der `webhook()` Funktion
3. Enlyst Backend für neue Webhook-Typen

---

**Der Enlyst Webhook Trigger automatisiert Ihre Lead-Anreicherung komplett! 🚀**
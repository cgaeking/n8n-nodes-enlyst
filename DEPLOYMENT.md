# Deployment Guide für n8n-nodes-enlyst

## Voraussetzungen

### NPM Account Setup
1. NPM Account erstellen auf [npmjs.com](https://www.npmjs.com/)
2. Zwei-Faktor-Authentifizierung (2FA) aktivieren
3. Access Token erstellen:
   ```bash
   npm login
   npm token create --type=automation
   ```

### GitHub Repository Setup
1. NPM_TOKEN als GitHub Secret hinzufügen:
   - Gehe zu Repository Settings → Secrets → Actions
   - Erstelle neues Secret: `NPM_TOKEN`
   - Füge das npm automation token ein

2. Repository Permissions prüfen:
   - Settings → Actions → General → Workflow permissions
   - "Read and write permissions" aktivieren

## Deploy-Methoden

### Methode 1: Automatischer Deploy (Empfohlen)

Das `deploy.sh` Script führt alle Schritte automatisch aus:

```bash
./deploy.sh
```

Das Script führt aus:
1. ✅ NPM Login Check
2. ✅ Git Working Directory Check
3. ✅ Branch Check (muss `main` sein)
4. ✅ Latest Changes Pull
5. ✅ Lint & Build Tests
6. ✅ Interaktive Version Bump Auswahl
7. ✅ Release mit `release-it`
8. ✅ Automatisches Publish zu NPM
9. ✅ GitHub Release erstellen

### Methode 2: Manuelle Steps

```bash
# 1. Sicherstellen dass alles committed ist
git status

# 2. Tests ausführen
npm run test

# 3. Build erstellen
npm run build

# 4. Dry-run testen
npm run release:dry

# 5. Release erstellen (patch/minor/major)
npm run release         # Interactive
npm run release:minor   # Minor version bump
npm run release:major   # Major version bump
```

### Methode 3: GitHub Actions (Automatisch bei Tag)

Bei jedem Git Tag wird automatisch deployed:

```bash
# Lokales Release erstellt automatisch Tag und triggert GitHub Actions
npm run release
```

Der GitHub Actions Workflow `.github/workflows/publish.yml` wird automatisch ausgeführt und published zu npm.

## Version Bump Guidelines

### Patch (0.0.X) - Bugfixes
- Fehlerbehebungen
- Dokumentations-Updates
- Performance-Verbesserungen ohne API-Änderungen

```bash
npm run release      # Wähle Option 1 (patch)
```

### Minor (0.X.0) - Features
- Neue Features
- Neue Node-Operationen
- Neue Parameter (abwärtskompatibel)

```bash
npm run release:minor
# oder
npm run release      # Wähle Option 2 (minor)
```

### Major (X.0.0) - Breaking Changes
- Breaking Changes in API
- Entfernung von Features
- Nicht-abwärtskompatible Änderungen

```bash
npm run release:major
# oder
npm run release      # Wähle Option 3 (major)
```

## Pre-Release Checklist

Vor jedem Deploy prüfen:

- [ ] Alle Tests laufen durch (`npm run test`)
- [ ] Build funktioniert (`npm run build`)
- [ ] CHANGELOG.md ist aktuell (wird automatisch generiert)
- [ ] README.md ist aktuell
- [ ] Alle Changes sind committed
- [ ] Auf `main` Branch
- [ ] Bei npm eingeloggt (`npm whoami`)

## Post-Release Checklist

Nach dem Deploy prüfen:

- [ ] Paket ist auf npm verfügbar: https://www.npmjs.com/package/n8n-nodes-enlyst
- [ ] GitHub Release wurde erstellt
- [ ] Version in package.json wurde erhöht
- [ ] Tag wurde auf GitHub gepusht
- [ ] CHANGELOG.md wurde aktualisiert

## Troubleshooting

### "Not logged in to npm"
```bash
npm login
npm whoami  # Verifizieren
```

### "Working directory not clean"
```bash
git status
git add .
git commit -m "Your changes"
```

### "Not on main branch"
```bash
git checkout main
git pull origin main
```

### "NPM Publish failed"
```bash
# Prüfe npm Access Token
npm token list

# Erstelle neues Token falls nötig
npm token create --type=automation
```

### "GitHub Actions failed"
1. Prüfe ob NPM_TOKEN Secret korrekt gesetzt ist
2. Prüfe GitHub Actions Logs
3. Stelle sicher dass 2FA auf npm aktiviert ist

## Testing vor Deploy

### Lokales Testing mit npm link

```bash
# Im n8n-nodes-enlyst Verzeichnis
npm link

# In deiner n8n Installation
cd ~/.n8n
npm link n8n-nodes-enlyst

# n8n neu starten
n8n start
```

### Testing mit .tgz Paket

```bash
# Paket erstellen
npm pack

# In n8n installieren
npm install ./n8n-nodes-enlyst-0.4.13.tgz
```

## Rollback

Falls ein Release fehlerhaft ist:

```bash
# NPM deprecate (nicht löschen!)
npm deprecate n8n-nodes-enlyst@VERSION "Use version X.X.X instead"

# Neues Patch Release mit Fix
npm run release
```

## Support & Resources

- ��� NPM Package: https://www.npmjs.com/package/n8n-nodes-enlyst
- ��� GitHub: https://github.com/cgaeking/n8n-nodes-enlyst
- ��� n8n Community Nodes: https://docs.n8n.io/integrations/community-nodes/
- ��� Support: info@enlyst.de

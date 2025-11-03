# Ì∫Ä Quick Start: Deploy zu npm

## Voraussetzungen (einmalig)

```bash
# 1. Bei npm einloggen
npm login

# 2. NPM Token f√ºr GitHub Actions erstellen
npm token create --type=automation
# Token kopieren und als NPM_TOKEN Secret in GitHub hinzuf√ºgen
```

## Deploy durchf√ºhren

### Option 1: Automatisches Deploy-Script (Empfohlen)

```bash
./deploy.sh
```

Das Script f√ºhrt alle Checks durch und fragt nach dem Release-Typ (patch/minor/major).

### Option 2: Manuelle Befehle

```bash
# Patch Release (Bugfix)
npm run release:patch

# Minor Release (Feature)
npm run release:minor

# Major Release (Breaking Change)
npm run release:major

# Dry-Run zum Testen
npm run release:dry
```

### Option 3: Interaktiver Modus

```bash
npm run release
```

Folge den Prompts von release-it.

## Was passiert beim Deploy?

1. ‚úÖ **Pre-Checks**: Lint + Build Tests
2. Ì≥ù **Version Bump**: Erh√∂ht Version in package.json
3. Ì≥¶ **Build**: Erstellt dist/ Verzeichnis
4. Ìø∑Ô∏è **Git Tag**: Erstellt Git Tag mit neuer Version
5. Ì≥§ **Git Push**: Pusht Code + Tag zu GitHub
6. Ì∫Ä **NPM Publish**: Ver√∂ffentlicht Paket auf npm
7. Ì≥ã **GitHub Release**: Erstellt Release auf GitHub
8. Ì≥ù **CHANGELOG**: Aktualisiert automatisch

## Nach dem Deploy

Das Paket ist verf√ºgbar unter:
- **NPM**: https://www.npmjs.com/package/n8n-nodes-enlyst
- **GitHub**: https://github.com/cgaeking/n8n-nodes-enlyst/releases

User k√∂nnen es installieren mit:
```bash
# In n8n √ºber Community Nodes
Settings ‚Üí Community Nodes ‚Üí Install: n8n-nodes-enlyst

# Oder via npm
npm install n8n-nodes-enlyst
```

## Troubleshooting

### "Working directory not clean"
```bash
git add .
git commit -m "Your changes"
```

### "Not logged in to npm"
```bash
npm login
npm whoami  # Verifizieren
```

### GitHub Actions schlagen fehl
1. Pr√ºfe NPM_TOKEN Secret in GitHub
2. Stelle sicher dass 2FA auf npm aktiviert ist
3. Pr√ºfe Workflow Logs auf GitHub

## Vollst√§ndige Dokumentation

Siehe [DEPLOYMENT.md](./DEPLOYMENT.md) f√ºr ausf√ºhrliche Informationen.

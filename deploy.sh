#!/bin/bash

# n8n-nodes-enlyst Deploy Script
# Automatisierter und sicherer Deploy-Prozess zu npm

set -e

echo "Ì∫Ä n8n-nodes-enlyst Deploy Process"
echo "=================================="
echo ""

# Farben f√ºr Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check if user is logged in to npm
echo "Ì≥ù Schritt 1: NPM Login Check..."
if ! npm whoami &> /dev/null; then
    echo -e "${RED}‚ùå Nicht bei npm eingeloggt!${NC}"
    echo "Bitte f√ºhre aus: npm login"
    exit 1
fi
NPM_USER=$(npm whoami)
echo -e "${GREEN}‚úÖ Eingeloggt als: $NPM_USER${NC}"
echo ""

# 2. Check working directory is clean
echo "Ì≥ù Schritt 2: Git Working Directory Check..."
if [[ -n $(git status -s) ]]; then
    echo -e "${RED}‚ùå Git Working Directory ist nicht sauber!${NC}"
    echo "Uncommitted changes:"
    git status -s
    exit 1
fi
echo -e "${GREEN}‚úÖ Git Working Directory ist sauber${NC}"
echo ""

# 3. Check branch is main
echo "Ì≥ù Schritt 3: Branch Check..."
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" ]]; then
    echo -e "${RED}‚ùå Nicht auf main Branch! Aktuell: $CURRENT_BRANCH${NC}"
    exit 1
fi
echo -e "${GREEN}‚úÖ Auf main Branch${NC}"
echo ""

# 4. Pull latest changes
echo "Ì≥ù Schritt 4: Git Pull..."
git pull origin main
echo -e "${GREEN}‚úÖ Latest changes pulled${NC}"
echo ""

# 5. Run tests (lint + build)
echo "Ì≥ù Schritt 5: Tests ausf√ºhren..."
npm run lint
echo -e "${GREEN}‚úÖ Lint passed${NC}"
npm run build
echo -e "${GREEN}‚úÖ Build passed${NC}"
echo ""

# 6. Get current version and ask for new version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "Ì≥¶ Aktuelle Version: $CURRENT_VERSION"
echo ""
echo "Welche Art von Release?"
echo "  1) patch (${CURRENT_VERSION} ‚Üí Bugfix)"
echo "  2) minor (${CURRENT_VERSION} ‚Üí Feature)"
echo "  3) major (${CURRENT_VERSION} ‚Üí Breaking Change)"
echo "  4) Abbrechen"
echo ""
read -p "W√§hle (1-4): " release_type

case $release_type in
    1) VERSION_TYPE="patch" ;;
    2) VERSION_TYPE="minor" ;;
    3) VERSION_TYPE="major" ;;
    4) echo "Abgebrochen."; exit 0 ;;
    *) echo -e "${RED}‚ùå Ung√ºltige Auswahl${NC}"; exit 1 ;;
esac

# 7. Run release-it
echo ""
echo "Ì≥ù Schritt 6: Release erstellen ($VERSION_TYPE)..."
npm run release -- $VERSION_TYPE

echo ""
echo -e "${GREEN}‚úÖ Deploy erfolgreich abgeschlossen!${NC}"
echo ""

# 8. Show new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo "Ì≥¶ Neue Version: $NEW_VERSION"
echo "Ì¥ó NPM: https://www.npmjs.com/package/n8n-nodes-enlyst"
echo "Ì¥ó GitHub: https://github.com/cgaeking/n8n-nodes-enlyst/releases/tag/$NEW_VERSION"
echo ""

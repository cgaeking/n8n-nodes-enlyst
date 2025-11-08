#!/bin/bash

# Remove npm-installed/linked version to avoid conflicts
echo "��� Cleaning up conflicting installations..."
npm unlink n8n-nodes-enlyst 2>/dev/null || true
cd ~/.n8n && rm -rf nodes/n8n-nodes-enlyst 2>/dev/null || true

# n8n with PostgreSQL Configuration
export DB_TYPE=postgresdb
export DB_POSTGRESDB_HOST=localhost
export DB_POSTGRESDB_PORT=5432
export DB_POSTGRESDB_DATABASE=immoview
export DB_POSTGRESDB_USER=immo
export DB_POSTGRESDB_PASSWORD=immobilien2025

# n8n Configuration
export N8N_PORT=5678
export N8N_PROTOCOL=http
export N8N_HOST=localhost
export WEBHOOK_URL=http://localhost:5678

# Community Nodes Configuration
export N8N_COMMUNITY_PACKAGES_ENABLED=true
export EXECUTIONS_PROCESS=main

echo ""
echo "🚀 Starting n8n with PostgreSQL..."
echo "   Database: postgresql://immo@localhost:5432/immoview"
echo "   URL: http://localhost:5678"
echo "   Community Nodes: ENABLED"
echo ""
echo "��� To install n8n-nodes-enlyst:"
echo "   1. Go to Settings → Community Nodes"
echo "   2. Click 'Install a community node'"
echo "   3. Enter: n8n-nodes-enlyst"
echo ""

cd ~/.n8n
pnpm dlx n8n

#!/bin/bash

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

echo "íº€ Starting n8n with PostgreSQL..."
echo "   Database: postgresql://immo@localhost:5432/immoview"
echo "   URL: http://localhost:5678"
echo ""

pnpm dlx n8n

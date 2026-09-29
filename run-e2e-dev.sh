#!/usr/bin/env bash
# Start the app against the Neon e2e-dev branch, never production.
#
# .env.local wins over .env in Next's precedence, so the branch URL is pinned
# there for the life of this process and removed again on exit. Without that,
# .env's production DATABASE_URL would win and the test would write to the
# live database.
set -euo pipefail
cd "$(dirname "$0")"
[ -f .env.dev ] || { echo "No .env.dev — the branch connection string lives there."; exit 1; }

cp .env.local .env.local.e2e-bak 2>/dev/null || : > .env.local.e2e-bak
restore() { mv .env.local.e2e-bak .env.local 2>/dev/null || :; echo; echo "restored .env.local"; }
trap restore EXIT INT TERM

{ cat .env.local.e2e-bak; echo; grep -E '^(DATABASE_URL|DIRECT_URL)=' .env.dev; } > .env.local

set -a; . ./.env.dev; set +a
export NEXT_PUBLIC_SITE_URL="http://localhost:3100"

echo "DB host: $(echo "$DATABASE_URL" | sed -E 's|.*@([^/]+)/.*|\1|')"
echo "Open:    http://localhost:3100"
echo
npm run dev -- -p 3100

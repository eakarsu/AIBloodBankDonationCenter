#!/usr/bin/env bash
set -euo pipefail
project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; cd "$project_dir"
if [ ! -f .env ]; then echo "Missing .env; copy .env.example and configure it." >&2; exit 1; fi
if [ ! -d backend/node_modules ] || [ ! -d frontend/node_modules ]; then echo "Dependencies are absent; run scripts/bootstrap.sh first." >&2; exit 1; fi
set -a; . ./.env; set +a
backend_port="${BACKEND_PORT:-3001}"; frontend_port="${FRONTEND_PORT:-3000}"
for port in "$backend_port" "$frontend_port"; do
  case "$port" in ''|*[!0-9]*) echo "Ports must be numeric." >&2; exit 1;; esac
  if [ "$port" -lt 1 ] || [ "$port" -gt 65535 ]; then echo "Port $port is outside the valid range." >&2; exit 1; fi
done
if [ "$backend_port" = "$frontend_port" ]; then echo "BACKEND_PORT and FRONTEND_PORT must differ." >&2; exit 1; fi
for port in "$backend_port" "$frontend_port"; do if command -v lsof >/dev/null && lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then echo "Port $port is already in use; refusing to stop another process." >&2; exit 1; fi; done
if [ "${MIGRATE_ON_START:-false}" = true ]; then scripts/migrate.sh; fi
(cd backend && npm start) & backend_pid=$!
(cd frontend && BACKEND_PORT="$backend_port" npm start -- --host 127.0.0.1 --port "$frontend_port" --strictPort) & frontend_pid=$!
cleanup(){ kill "$backend_pid" "$frontend_pid" 2>/dev/null || true; }
trap cleanup EXIT INT TERM
wait "$backend_pid" "$frontend_pid"

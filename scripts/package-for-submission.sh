#!/bin/bash
set -e
cd "$(dirname "$0")/.."
OUT="../airport-retail-media-submission.zip"
rm -f "$OUT"
zip -r "$OUT" . \
  -x "node_modules/*" \
  -x "*/node_modules/*" \
  -x ".git/*" \
  -x "*/.git/*" \
  -x "dist/*" \
  -x "*/dist/*" \
  -x "*.log" \
  -x ".env" \
  -x "backend/.env" \
  -x "pgdata/*"
echo "Created: $OUT"
ls -lh "$OUT"
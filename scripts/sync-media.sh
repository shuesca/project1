#!/usr/bin/env bash
# Clone or update a *media-only* Git repo and copy assets into apps/web/public/
# so paths like /JellyFish.mp4 keep working without storing huge files in this repo.
#
# Setup the media repo (separate GitHub project):
#   - Enable Git LFS and track *.mp4 if any file is > 100 MB (GitHub hard limit).
#   - Put files at repo root with the SAME names the site expects, e.g.:
#       JellyFish.mp4  Sphere.mp4  drone.mp4  (and any other large assets)
#
# Usage:
#   export MEDIA_REPO_URL='https://github.com/YOU/project1-media.git'
#   npm run sync:media
#
# Or add MEDIA_REPO_URL=... to apps/web/.env (this script reads that line).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PUBLIC="$ROOT/apps/web/public"
CACHE_ROOT="$ROOT/.cache"
CACHE="$CACHE_ROOT/project1-media"
ENV_FILE="$ROOT/apps/web/.env"

if [ -z "${MEDIA_REPO_URL:-}" ] && [ -f "$ENV_FILE" ]; then
  line="$(grep -E '^[[:space:]]*MEDIA_REPO_URL=' "$ENV_FILE" | tail -1 || true)"
  if [ -n "${line}" ]; then
    MEDIA_REPO_URL="${line#*=}"
    MEDIA_REPO_URL="${MEDIA_REPO_URL%\"}"
    MEDIA_REPO_URL="${MEDIA_REPO_URL#\"}"
    MEDIA_REPO_URL="${MEDIA_REPO_URL%\'}"
    MEDIA_REPO_URL="${MEDIA_REPO_URL#\'}"
  fi
fi

if [ -z "${MEDIA_REPO_URL:-}" ]; then
  echo "sync-media: set MEDIA_REPO_URL to your media-only git clone URL (HTTPS or SSH)." >&2
  echo "Example: MEDIA_REPO_URL=https://github.com/you/project1-media.git npm run sync:media" >&2
  echo "Or add MEDIA_REPO_URL=... to apps/web/.env" >&2
  exit 1
fi

mkdir -p "$PUBLIC" "$CACHE_ROOT"

if [ -d "$CACHE/.git" ]; then
  echo "sync-media: pulling updates → $CACHE"
  git -C "$CACHE" pull --ff-only
else
  echo "sync-media: cloning → $CACHE"
  rm -rf "$CACHE"
  git clone --depth 1 "$MEDIA_REPO_URL" "$CACHE"
fi
# Ensure Git LFS objects exist as real files (first clone can leave pointers only).
if command -v git-lfs >/dev/null 2>&1 || git lfs version >/dev/null 2>&1; then
  git -C "$CACHE" lfs pull 2>/dev/null || true
fi

SUBDIR="${MEDIA_SUBDIR:-}"
FROM="$CACHE"
if [ -n "$SUBDIR" ]; then
  FROM="$CACHE/$SUBDIR"
fi

if [ ! -d "$FROM" ]; then
  echo "sync-media: expected directory missing: $FROM" >&2
  exit 1
fi

shopt -s nullglob
copied=0
for pattern in '*.mp4' '*.webm' '*.mov'; do
  for f in "$FROM"/$pattern; do
    base="$(basename "$f")"
    cp -v "$f" "$PUBLIC/$base"
    copied=$((copied + 1))
  done
done
shopt -u nullglob

if [ "$copied" -eq 0 ]; then
  echo "sync-media: warning — no video files copied from $FROM" >&2
fi

echo "sync-media: done ($copied file(s) → $PUBLIC)"

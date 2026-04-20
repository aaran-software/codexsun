#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

log() {
  printf '%s\n' "$*"
}

die() {
  log "$*"
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"
}

load_env() {
  if [ -f "$REPO_ROOT/.env" ]; then
    set -a
    # shellcheck disable=SC1091
    . <(sed 's/\r$//' "$REPO_ROOT/.env")
    set +a
  fi
}

detect_compose() {
  if docker compose version >/dev/null 2>&1; then
    COMPOSE_CMD=(docker compose)
    return
  fi

  if command -v docker-compose >/dev/null 2>&1; then
    COMPOSE_CMD=(docker-compose)
    return
  fi

  die "Docker Compose is not available."
}

current_branch() {
  git -C "$REPO_ROOT" rev-parse --abbrev-ref HEAD
}

origin_url() {
  git -C "$REPO_ROOT" remote get-url origin 2>/dev/null || true
}

show_status() {
  local branch remote_url head upstream
  branch="${GIT_BRANCH:-$(current_branch)}"
  remote_url="${GIT_REPOSITORY_URL:-$(origin_url)}"
  head="$(git -C "$REPO_ROOT" rev-parse --short HEAD)"
  upstream="$(git -C "$REPO_ROOT" rev-parse --short "origin/$branch" 2>/dev/null || true)"

  log "Repository: $REPO_ROOT"
  log "Remote: ${remote_url:-<not configured>}"
  log "Branch: $branch"
  log "Local HEAD: $head"
  log "Origin HEAD: ${upstream:-<not fetched>}"
  log "Working tree:"
  git -C "$REPO_ROOT" status --short
}

run_update() {
  local force="false"

  while [ "$#" -gt 0 ]; do
    case "$1" in
      --force)
        force="true"
        ;;
      *)
        die "Unknown update option: $1"
        ;;
    esac
    shift
  done

  [ "$force" = "true" ] || die "Refusing destructive update without --force."

  local branch remote_url compose_file health_url image_tag target_env
  branch="${GIT_BRANCH:-$(current_branch)}"
  remote_url="${GIT_REPOSITORY_URL:-$(origin_url)}"
  compose_file="${CODEXSUN_COMPOSE_FILE:-$REPO_ROOT/.container/clients/codexsun/docker-compose.yml}"
  image_tag="${IMAGE_TAG:-codexsun:v2}"
  target_env="${TARGET_ENV:-local}"
  health_url="${HEALTH_URL:-http://127.0.0.1:${APP_HTTP_HOST_PORT:-4173}/api/health}"

  [ -n "$remote_url" ] || die "GIT_REPOSITORY_URL or git remote origin is required."
  [ -f "$compose_file" ] || die "Compose file not found: $compose_file"

  require_cmd git
  require_cmd docker
  require_cmd curl
  detect_compose

  if ! docker info >/dev/null 2>&1; then
    die "Docker is not running or not accessible."
  fi

  cd "$REPO_ROOT"

  log "Fetching $branch from $remote_url..."
  git remote set-url origin "$remote_url"
  git fetch --prune origin "$branch"

  log "Resetting local checkout to origin/$branch and omitting local tracked changes..."
  git reset --hard "origin/$branch"

  log "Removing untracked build artifacts while preserving ignored files such as .env..."
  git clean -fd

  export IMAGE_TAG="$image_tag"
  export TARGET_ENV="$target_env"

  log "Rebuilding image and recreating app container with $compose_file..."
  "${COMPOSE_CMD[@]}" -f "$compose_file" up -d --build

  log "Waiting for health: $health_url"
  for _ in $(seq 1 "${APP_HEALTH_WAIT_ATTEMPTS:-60}"); do
    if curl -fsS "$health_url" >/dev/null 2>&1; then
      log "Deployment update complete."
      return
    fi
    sleep "${APP_HEALTH_WAIT_DELAY_SECONDS:-1}"
  done

  "${COMPOSE_CMD[@]}" -f "$compose_file" logs --tail=120 || true
  die "Health check failed after update."
}

show_help() {
  cat <<EOF
Codexsun manual production update

Usage:
  ./.container/bash/update.sh status
  ./.container/bash/update.sh update --force

Environment loaded from .env when present:
  GIT_REPOSITORY_URL      Git remote URL. Defaults to origin.
  GIT_BRANCH              Branch to deploy. Defaults to current branch.
  CODEXSUN_COMPOSE_FILE   Compose file path. Defaults to codexsun client compose.
  IMAGE_TAG               Docker image tag. Defaults to codexsun:v2.
  APP_HTTP_HOST_PORT      Health-check port. Defaults to 4173.

The update command preserves ignored files, Docker volumes, external networks,
and database containers. It does not run docker compose down or image cleanup.
EOF
}

load_env

case "${1:-status}" in
  status)
    require_cmd git
    show_status
    ;;
  update)
    shift
    run_update "$@"
    ;;
  --help|-h|help)
    show_help
    ;;
  *)
    die "Unknown command: ${1:-}"
    ;;
esac

#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONTAINER_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CLIENTS_DIR="$CONTAINER_ROOT/clients"
CLIENT_LIST_FILE="$CONTAINER_ROOT/client-list.md"

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

normalize_env_prefix() {
  printf '%s' "$1" | tr '[:lower:]-.' '[:upper:]__'
}

parse_compose_container_name() {
  local compose_file="$1"
  awk '/^[[:space:]]*container_name:[[:space:]]*/ { print $2; exit }' "$compose_file"
}

discover_clients() {
  AVAILABLE_CLIENTS=()

  if [ -f "$CLIENT_LIST_FILE" ]; then
    local listed_client
    while IFS= read -r listed_client; do
      [ -n "$listed_client" ] || continue
      [ -d "$CLIENTS_DIR/$listed_client" ] || die "Client '$listed_client' is listed but missing under $CLIENTS_DIR"
      [ -f "$CLIENTS_DIR/$listed_client/docker-compose.yml" ] || die "Client '$listed_client' is missing docker-compose.yml"
      AVAILABLE_CLIENTS+=("$listed_client")
    done < <(
      awk -F'|' '
        /^\|/ {
          client_id=$2
          gsub(/^[[:space:]]+|[[:space:]]+$/, "", client_id)
          if (client_id != "" && client_id != "client_id" && client_id != "---") {
            print client_id
          }
        }
      ' "$CLIENT_LIST_FILE"
    )
  fi

  if [ "${#AVAILABLE_CLIENTS[@]}" -gt 0 ]; then
    return
  fi

  local client_dir
  for client_dir in "$CLIENTS_DIR"/*; do
    [ -d "$client_dir" ] || continue
    [ -f "$client_dir/docker-compose.yml" ] || continue
    AVAILABLE_CLIENTS+=("$(basename "$client_dir")")
  done

  [ "${#AVAILABLE_CLIENTS[@]}" -gt 0 ] || die "No client compose folders were found under $CLIENTS_DIR"
}

show_help() {
  cat <<EOF
Codexsun client deployment setup

Usage:
  ./.container/bash/setup.sh
  CLIENTS=codexsun ./.container/bash/setup.sh
  TARGET_ENV=cloud CLIENTS=codexsun ./.container/bash/setup.sh

Environment:
  TARGET_ENV=local|cloud      Default: local
  CLIENTS=all|client1,client2 Default: all discovered clients
  BUILD_IMAGE=true|false      Default: true
  IMAGE_TAG=codexsun:v2       Default image tag
  NETWORK_NAME=codexion       External Docker network name

Available clients:
$(printf '  - %s\n' "${AVAILABLE_CLIENTS[@]}")
EOF
}

parse_selected_clients() {
  SELECTED_CLIENTS=()

  local input="${CLIENTS:-all}"
  if [ "$#" -gt 0 ]; then
    input="$*"
  fi

  if [ "$input" = "all" ]; then
    SELECTED_CLIENTS=("${AVAILABLE_CLIENTS[@]}")
    return
  fi

  local candidate found known
  for candidate in $(printf '%s' "$input" | tr ',' ' '); do
    [ -n "$candidate" ] || continue
    found="false"

    for known in "${AVAILABLE_CLIENTS[@]}"; do
      if [ "$known" = "$candidate" ]; then
        found="true"
        break
      fi
    done

    [ "$found" = "true" ] || die "Unknown client: $candidate"
    SELECTED_CLIENTS+=("$candidate")
  done

  [ "${#SELECTED_CLIENTS[@]}" -gt 0 ] || die "No clients selected."
}

load_client_config() {
  local client_id="$1"
  local client_dir="$CLIENTS_DIR/$client_id"
  local compose_file="$client_dir/docker-compose.yml"
  local config_file="$client_dir/client.conf.sh"

  [ -f "$compose_file" ] || die "Missing compose file for client '$client_id': $compose_file"

  CLIENT_ID="$client_id"
  CLIENT_DISPLAY_NAME="$client_id"
  CLIENT_ENV_PREFIX="$(normalize_env_prefix "$client_id")"
  CLIENT_CONTAINER="$(parse_compose_container_name "$compose_file")"
  CLIENT_DOMAIN_LOCAL="127.0.0.1"
  CLIENT_DOMAIN_CLOUD="localhost"
  CLIENT_DB_HOST_LOCAL="$DB_HOST_DEFAULT"
  CLIENT_DB_HOST_CLOUD="$DB_HOST_DEFAULT"
  CLIENT_DB_PORT_LOCAL="$DB_PORT_DEFAULT"
  CLIENT_DB_PORT_CLOUD="$DB_PORT_DEFAULT"
  CLIENT_DB_USER_LOCAL="$DB_USER_DEFAULT"
  CLIENT_DB_USER_CLOUD="$DB_USER_DEFAULT"
  CLIENT_DB_PASSWORD_LOCAL="$DB_PASSWORD_DEFAULT"
  CLIENT_DB_PASSWORD_CLOUD="$DB_PASSWORD_DEFAULT"
  CLIENT_DB_NAME_LOCAL="${client_id}_db"
  CLIENT_DB_NAME_CLOUD="${client_id}_db"
  CLIENT_PUBLIC_PORT_LOCAL="4173"
  CLIENT_PUBLIC_PORT_CLOUD="443"
  CLIENT_APP_BIND_IP_LOCAL="0.0.0.0"
  CLIENT_APP_BIND_IP_CLOUD="127.0.0.1"
  CLIENT_APP_HTTP_HOST_PORT_LOCAL="4173"
  CLIENT_APP_HTTP_HOST_PORT_CLOUD="4173"

  if [ -f "$config_file" ]; then
    # shellcheck disable=SC1090
    . "$config_file"
  fi

  CURRENT_CLIENT_ID="$CLIENT_ID"
  CURRENT_CLIENT_NAME="$CLIENT_DISPLAY_NAME"
  CURRENT_CLIENT_ENV_PREFIX="$CLIENT_ENV_PREFIX"
  CURRENT_COMPOSE_FILE="$compose_file"
  CURRENT_CONTAINER="$CLIENT_CONTAINER"

  local target_suffix
  target_suffix="$(printf '%s' "$TARGET_ENV" | tr '[:lower:]' '[:upper:]')"

  local domain_default db_host_default db_port_default db_user_default db_password_default db_name_default
  local public_port_default app_bind_ip_default app_http_host_port_default override_var value
  domain_default="$(eval "printf '%s' \"\${CLIENT_DOMAIN_${target_suffix}:-}\"")"
  db_host_default="$(eval "printf '%s' \"\${CLIENT_DB_HOST_${target_suffix}:-$DB_HOST_DEFAULT}\"")"
  db_port_default="$(eval "printf '%s' \"\${CLIENT_DB_PORT_${target_suffix}:-$DB_PORT_DEFAULT}\"")"
  db_user_default="$(eval "printf '%s' \"\${CLIENT_DB_USER_${target_suffix}:-$DB_USER_DEFAULT}\"")"
  db_password_default="$(eval "printf '%s' \"\${CLIENT_DB_PASSWORD_${target_suffix}:-$DB_PASSWORD_DEFAULT}\"")"
  db_name_default="$(eval "printf '%s' \"\${CLIENT_DB_NAME_${target_suffix}:-${client_id}_db}\"")"
  public_port_default="$(eval "printf '%s' \"\${CLIENT_PUBLIC_PORT_${target_suffix}:-4173}\"")"
  app_bind_ip_default="$(eval "printf '%s' \"\${CLIENT_APP_BIND_IP_${target_suffix}:-0.0.0.0}\"")"
  app_http_host_port_default="$(eval "printf '%s' \"\${CLIENT_APP_HTTP_HOST_PORT_${target_suffix}:-4173}\"")"

  override_var="${CURRENT_CLIENT_ENV_PREFIX}_DOMAIN"
  CURRENT_DOMAIN="${!override_var:-$domain_default}"

  override_var="${CURRENT_CLIENT_ENV_PREFIX}_DB_HOST"
  CURRENT_DB_HOST="${!override_var:-$db_host_default}"

  override_var="${CURRENT_CLIENT_ENV_PREFIX}_DB_PORT"
  CURRENT_DB_PORT="${!override_var:-$db_port_default}"

  override_var="${CURRENT_CLIENT_ENV_PREFIX}_DB_USER"
  CURRENT_DB_USER="${!override_var:-$db_user_default}"

  override_var="${CURRENT_CLIENT_ENV_PREFIX}_DB_PASSWORD"
  CURRENT_DB_PASSWORD="${!override_var:-$db_password_default}"

  override_var="${CURRENT_CLIENT_ENV_PREFIX}_DB_NAME"
  CURRENT_DB_NAME="${!override_var:-$db_name_default}"

  override_var="${CURRENT_CLIENT_ENV_PREFIX}_PUBLIC_PORT"
  CURRENT_PUBLIC_PORT="${!override_var:-$public_port_default}"

  override_var="${CURRENT_CLIENT_ENV_PREFIX}_APP_BIND_IP"
  CURRENT_APP_BIND_IP="${!override_var:-$app_bind_ip_default}"

  override_var="${CURRENT_CLIENT_ENV_PREFIX}_APP_HTTP_HOST_PORT"
  CURRENT_APP_HTTP_HOST_PORT="${!override_var:-$app_http_host_port_default}"
}

compose() {
  "${COMPOSE_CMD[@]}" -f "$CURRENT_COMPOSE_FILE" "$@"
}

ensure_network() {
  if docker network inspect "$NETWORK_NAME" >/dev/null 2>&1; then
    return
  fi

  log "Creating Docker network: $NETWORK_NAME"
  docker network create "$NETWORK_NAME" >/dev/null
}

validate_client() {
  if [ "$TARGET_ENV" = "cloud" ]; then
    case "$CURRENT_DOMAIN" in
      ""|localhost|127.0.0.1|0.0.0.0|*.local|*.localhost)
        die "Cloud target for ${CURRENT_CLIENT_NAME} requires a real domain. Current value: ${CURRENT_DOMAIN:-<empty>}"
        ;;
    esac
  fi
}

wait_for_health() {
  local url="$1"
  local attempts="${APP_HEALTH_WAIT_ATTEMPTS:-60}"
  local delay="${APP_HEALTH_WAIT_DELAY_SECONDS:-1}"

  log "Waiting for health: $url"
  for _ in $(seq 1 "$attempts"); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep "$delay"
  done

  compose logs --tail=120 || true
  return 1
}

deploy_client() {
  local client_id="$1"
  load_client_config "$client_id"
  validate_client

  export APP_BIND_IP="$CURRENT_APP_BIND_IP"
  export APP_HTTP_HOST_PORT="$CURRENT_APP_HTTP_HOST_PORT"
  export CLIENT_BOOTSTRAP_DB_NAME="$CURRENT_DB_NAME"
  export CLIENT_DB_HOST="$CURRENT_DB_HOST"
  export CLIENT_DB_PORT="$CURRENT_DB_PORT"
  export CLIENT_DB_USER="$CURRENT_DB_USER"
  export CLIENT_DB_PASSWORD="$CURRENT_DB_PASSWORD"
  export CLIENT_DB_SSL="${CLIENT_DB_SSL:-false}"
  export CXSUN_WEB_ORIGIN="${CXSUN_WEB_ORIGIN:-http://127.0.0.1:${CURRENT_APP_HTTP_HOST_PORT}}"

  log "Deploying ${CURRENT_CLIENT_NAME} with image ${IMAGE_TAG}..."
  if [ "$BUILD_IMAGE" = "true" ]; then
    compose build
  fi

  compose up -d

  local health_url
  health_url="${HEALTH_URL:-http://127.0.0.1:${CURRENT_APP_HTTP_HOST_PORT}/api/health}"
  if ! wait_for_health "$health_url"; then
    die "Health check failed for ${CURRENT_CLIENT_NAME}. Inspect with: docker logs ${CURRENT_CONTAINER} --tail 200"
  fi

  log "${CURRENT_CLIENT_NAME} is running at http://127.0.0.1:${CURRENT_APP_HTTP_HOST_PORT}"
}

load_env
discover_clients

if [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
  show_help
  exit 0
fi

parse_selected_clients "$@"

TARGET_ENV="${TARGET_ENV:-local}"
case "$TARGET_ENV" in
  local|cloud) ;;
  *) die "TARGET_ENV must be 'local' or 'cloud'." ;;
esac

IMAGE_TAG="${IMAGE_TAG:-codexsun:v2}"
NETWORK_NAME="${NETWORK_NAME:-codexion}"
BUILD_IMAGE="${BUILD_IMAGE:-true}"
DB_HOST_DEFAULT="${DB_HOST_DEFAULT:-mariadb}"
DB_PORT_DEFAULT="${DB_PORT_DEFAULT:-3306}"
DB_USER_DEFAULT="${DB_USER_DEFAULT:-root}"
DB_PASSWORD_DEFAULT="${DB_PASSWORD_DEFAULT:-}"

require_cmd docker
require_cmd curl

if ! docker info >/dev/null 2>&1; then
  die "Docker is not running or not accessible."
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD=(docker-compose)
else
  die "Docker Compose is not available."
fi

cd "$REPO_ROOT"

log "Selected clients: $(printf '%s ' "${SELECTED_CLIENTS[@]}" | sed 's/[[:space:]]*$//')"
log "Target environment: $TARGET_ENV"

ensure_network

FAILED_CLIENTS=()
for client_id in "${SELECTED_CLIENTS[@]}"; do
  if ! deploy_client "$client_id"; then
    FAILED_CLIENTS+=("$client_id")
  fi
done

if [ "${#FAILED_CLIENTS[@]}" -gt 0 ]; then
  die "Deployment completed with failures for: $(printf '%s ' "${FAILED_CLIENTS[@]}" | sed 's/[[:space:]]*$//')"
fi

log "Selected client deployment complete."

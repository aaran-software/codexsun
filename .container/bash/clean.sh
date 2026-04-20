#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONTAINER_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CLIENTS_DIR="$CONTAINER_ROOT/clients"
CLIENT_LIST_FILE="$CONTAINER_ROOT/client-list.md"
IMAGE_TAG="${IMAGE_TAG:-codexsun:v2}"

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
}

remove_container() {
  local container="$1"

  [ -n "$container" ] || return

  if docker ps -a --format '{{.Names}}' | grep -Fxq "$container"; then
    log "Removing container: $container"
    docker rm -f "$container" >/dev/null 2>&1 || true
  else
    log "Skipping missing container: $container"
  fi
}

require_cmd docker

discover_clients
parse_selected_clients "$@"

[ "${#SELECTED_CLIENTS[@]}" -gt 0 ] || die "No clients selected."

log "Cleaning app containers and image only. Networks, volumes, and databases will not be removed."

for client_id in "${SELECTED_CLIENTS[@]}"; do
  compose_file="$CLIENTS_DIR/$client_id/docker-compose.yml"
  container_name="$(parse_compose_container_name "$compose_file")"
  remove_container "$container_name"
done

log "Removing image: $IMAGE_TAG"
docker image rm "$IMAGE_TAG" >/dev/null 2>&1 || true

log "Cleanup complete."

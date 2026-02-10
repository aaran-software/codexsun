#!/usr/bin/env python3
import subprocess
import sys
import os
from pathlib import Path
from datetime import datetime

# ==================================================
# CONFIG
# ==================================================
APP_DIR = Path.cwd()
EXPECTED_USER = "devops"
LOCK_FILE = Path("/tmp/ideploy.lock")

# ==================================================
# HELPERS
# ==================================================
def run(cmd, check=True):
    print(f"\n▶ {cmd}")
    subprocess.run(cmd, shell=True, cwd=APP_DIR, check=check)

def info(msg):
    print(f"\nℹ️  {msg}")

def fail(msg):
    print(f"\n❌ {msg}")
    sys.exit(1)

# ==================================================
# SAFETY CHECKS
# ==================================================
def ensure_correct_user():
    if os.geteuid() == 0:
        fail("Do NOT run ideploy as root")

    current = os.getlogin()
    if current != EXPECTED_USER:
        fail(f"User mismatch: running as '{current}', expected '{EXPECTED_USER}'")

def ensure_git_repo():
    if not (APP_DIR / ".git").exists():
        fail("Not a git repository")

def ensure_laravel_app():
    if not (APP_DIR / "artisan").exists():
        fail("artisan not found — not a Laravel application")

def acquire_lock():
    if LOCK_FILE.exists():
        fail("Another deploy is already running")
    LOCK_FILE.write_text(str(os.getpid()))

def release_lock():
    LOCK_FILE.unlink(missing_ok=True)

# ==================================================
# GIT (SAFE UPDATE)
# ==================================================
def git_update():
    info("Updating source code safely")

    branch = subprocess.check_output(
        "git symbolic-ref --short HEAD",
        shell=True,
        cwd=APP_DIR,
        text=True,
    ).strip()

    run("git fetch origin")

    # Preserve runtime files
    run("git update-index --skip-worktree .env || true")

    run(f"git reset --hard origin/{branch}")

    # Safe clean (DO NOT remove runtime state)
    run(
        "git clean -fd "
        "-e .env "
        "-e storage "
        "-e bootstrap/cache "
        "-e node_modules "
        "-e public/build"
    )

# ==================================================
# ENVIRONMENT
# ==================================================
def ensure_env():
    if not (APP_DIR / ".env").exists():
        info(".env missing — restoring from example")
        run("cp .env.example .env")

# ==================================================
# NPM
# ==================================================
def npm_build():
    if not (APP_DIR / "package.json").exists():
        info("No frontend detected — skipping npm")
        return

    info("Building frontend assets")

    try:
        run("npm run build")
    except subprocess.CalledProcessError:
        info("Build failed — running npm install")
        run("npm install")
        run("npm run build")

# ==================================================
# LARAVEL
# ==================================================
def laravel_deploy():
    info("Running Laravel deployment steps")

    run("php artisan down || true")

    # Always clear first (idempotent)
    run("php artisan optimize:clear")
    run("php artisan config:clear")
    run("php artisan route:clear")
    run("php artisan view:clear")

    # Optional migrations (safe)
    run("php artisan migrate --force || true")

    # Rebuild caches (only AFTER env is confirmed)
    run("php artisan config:cache")
    run("php artisan route:cache")
    run("php artisan view:cache")

    run("php artisan up")

# ==================================================
# MAIN
# ==================================================
def main():
    print("\n==============================")
    print("🚀 SAFE DEPLOY STARTED")
    print(datetime.now())
    print("==============================")

    ensure_correct_user()
    ensure_git_repo()
    ensure_laravel_app()
    acquire_lock()

    try:
        ensure_env()
        git_update()
        npm_build()
        laravel_deploy()
    finally:
        release_lock()

    print("\n✅ DEPLOY COMPLETED SUCCESSFULLY")

if __name__ == "__main__":
    main()

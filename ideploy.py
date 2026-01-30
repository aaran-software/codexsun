#!/usr/bin/env python3
import subprocess
import sys
import os
import pwd
from datetime import datetime
from pathlib import Path

# ==================================================
# CONFIG
# ==================================================
APP_DIR = Path.cwd()
APP_USER = "devops"

LOCK_FILE = Path("/tmp/ideploy.lock")

# ==================================================
# HELPERS
# ==================================================
def run(cmd):
    print(f"\n▶ {cmd}")
    subprocess.check_call(cmd, shell=True, cwd=APP_DIR)

def info(msg):
    print(f"\nℹ️  {msg}")

def fail(msg):
    print(f"\n❌ {msg}")
    sys.exit(1)

# ==================================================
# SAFETY
# ==================================================
def ensure_repo():
    if not (APP_DIR / ".git").exists():
        fail(f"Not a git repository: {APP_DIR}")

def ensure_user():
    if os.geteuid() == 0:
        fail("Do not run ideploy as root")

    current_user = pwd.getpwuid(os.geteuid()).pw_name
    if current_user != APP_USER:
        fail(f"Run ideploy as `{APP_USER}` (current: {current_user})")

def lock():
    if LOCK_FILE.exists():
        fail("Another deploy is already running")
    LOCK_FILE.write_text(str(os.getpid()))

def unlock():
    LOCK_FILE.unlink(missing_ok=True)

# ==================================================
# GIT
# ==================================================
def git_update():
    info("Updating source code")

    branch = subprocess.check_output(
        "git symbolic-ref --short HEAD",
        shell=True,
        cwd=APP_DIR,
        text=True,
    ).strip()

    run("git fetch origin")
    run(f"git reset --hard origin/{branch}")
    run("git clean -fd")

# ==================================================
# NPM
# ==================================================
def npm_build():
    if not (APP_DIR / "package.json").exists():
        info("No package.json, skipping npm")
        return

    info("Building frontend")

    try:
        run("npm run build")
    except subprocess.CalledProcessError:
        info("Build failed — running npm install")
        run("npm install")
        run("npm run build")

# ==================================================
# LARAVEL
# ==================================================
def laravel_optimize():
    if not (APP_DIR / "artisan").exists():
        info("Not a Laravel app, skipping optimize")
        return

    info("Optimizing Laravel")

    run("php artisan down || true")
    run("php artisan optimize:clear")
    run("php artisan config:cache")
    run("php artisan route:cache")
    run("php artisan view:cache")
    run("php artisan up")

# ==================================================
# MAIN
# ==================================================
def main():
    print("\n==============================")
    print("🚀 DEPLOY STARTED")
    print(datetime.now())
    print("==============================")

    ensure_repo()
    ensure_user()
    lock()

    try:
        git_update()
        npm_build()
        laravel_optimize()
    finally:
        unlock()

    print("\n✅ DEPLOY COMPLETED SUCCESSFULLY")

if __name__ == "__main__":
    main()

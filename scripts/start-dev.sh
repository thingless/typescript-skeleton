#!/usr/bin/env bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd "$SCRIPT_DIR"; cd ..;

set -o allexport; source ./dev.env; set +o allexport #source env file
exec ./node_modules/.bin/tsc-watch --onSuccess "node dist/app.js"
#!/bin/bash
if [ -z "$1" ] ; then
    echo "usage: ./create_migration.sh MIGRATION_NAME"
  exit
fi
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"
cd ..
DATABASE_URL=postgresql://user:composePASSWORD@localhost:5431/test-PROJECT_NAME ./node_modules/.bin/db-migrate create "$1" --sql-file

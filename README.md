# Using This Template

1. Replace `PROJECT_NAME` with your project name. Valid names should match the regex: [a-z_]*
2. Replace `COMPANY` with your company name.
3. Search the code for `XXX:` and update any values found
4. Delete this section from the README :P

Example replace command:
```
grep -rl PROJECT_NAME . | xargs sed -i 's/PROJECT_NAME/your_project_name/g'
```


PROJECT_NAME
====

# Developing

## Setup /Install

1. Clone this repository
2. Run `npm install`
3. Run `npm run build`
4. Run `docker-compose up`
5. Run `npm run dev`

## Tasks

All the commands below are for local development and assume you have ran `docker-compose up`

### Run Tests

Run `npm run build_and_test`

Note: Depends on the `test-PROJECT_NAME` DB

### Creating a migration

Run `./scripts/create_migration.sh MIGRATION_NAME`

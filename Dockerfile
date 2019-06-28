# Build Stage
FROM node:10.10.0 AS build-stage

LABEL app="build-PROJECT_NAME"

ADD . /opt/PROJECT_NAME
WORKDIR /opt/PROJECT_NAME

RUN npm install --unsafe-perm=true && npm run build

# Final Stage
FROM node:10.10.0

#ARG GIT_COMMIT
LABEL GIT_COMMIT=$GIT_COMMIT

COPY --from=build-stage /opt/PROJECT_NAME/ /opt/PROJECT_NAME

WORKDIR /opt/PROJECT_NAME

CMD ["node", "--max-old-space-size=4096", "dist/app.js"]

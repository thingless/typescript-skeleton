# Build Stage
FROM node:16.13.0 AS build-stage

LABEL app="build-PROJECT_NAME"

COPY package.json package-lock.json /opt/PROJECT_NAME/
WORKDIR /opt/PROJECT_NAME
RUN npm install --unsafe-perm=true

ADD . /opt/PROJECT_NAME
RUN npm run build

# Final Stage
FROM node:16.13.0

#ARG GIT_COMMIT
LABEL GIT_COMMIT=$GIT_COMMIT

COPY --from=build-stage /opt/PROJECT_NAME/ /opt/PROJECT_NAME

WORKDIR /opt/PROJECT_NAME

CMD ["node", "--max-old-space-size=4096", "dist/app.js"]

# =========================
# --- BUILD NPM MODULES ---
# =========================
FROM node:alpine3.14 AS build

WORKDIR /build

COPY package*.json ./

RUN npm install

# ===============
# --- Release ---
# ===============
FROM node:alpine3.14 as production
LABEL maintainer="david@kagerer.co"

RUN apk add bash curl --no-cache && \
  mkdir -p /spotify-randomizer && \
  mkdir -p /logs && \
  chown -R node:node /spotify-randomizer /logs

WORKDIR /spotify-randomizer

COPY --chown=node:node ./dist/apps/ ./
COPY --chown=node:node --from=build /build/node_modules ./node_modules

USER node

EXPOSE 3000

VOLUME [ "/spotify-randomizer/data" ]

CMD ["node", "/spotify-randomizer/spotify-playlist-randomizer-api/main"]
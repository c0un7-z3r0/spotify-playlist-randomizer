import express from "express";
const app = express();
import SpotifyWebApi from "spotify-web-api-node";
import open from "open";
import { exit } from "process";
import { saveConfig, getConfig } from "./config-helper";

const PORT = 8080;

const { clientId, clientSecret, configPath, scopes } = getConfig();

if (!clientId || !clientSecret) {
  console.error(
    "⚠️ Missing client id or client secret. If you run it for the first time, please provide them as env variables.",
  );
  process.exit(1);
}

const spotifyApi = new SpotifyWebApi({
  redirectUri: "http://localhost:8080/callback",
  clientId,
  clientSecret,
});

app.get("/callback", async (req, res) => {
  const authCode = req.query.code;
  if (!authCode || typeof authCode !== "string") {
    res.send(`🔴 Could not find auth code in url or it is not valid! Please try again.`).status(500);
    exit(1);
  }
  const grant = await spotifyApi.authorizationCodeGrant(authCode);

  saveConfig({
    accessToken: grant.body["access_token"],
    refreshToken: grant.body["refresh_token"],
  });

  res.send(`✅ Generated token and saved in ${configPath}!`);
  exit(0);
});

app.listen(PORT, () => {
  open(spotifyApi.createAuthorizeURL(scopes, ""));
});

import { saveConfig, invalidateTokens } from "./config-helper";
import SpotifyWebApi from "spotify-web-api-node";

export const refreshTokens = async (spotifyApi: SpotifyWebApi) => {
  try {
    const grant = await spotifyApi.refreshAccessToken();

    saveConfig({
      accessToken: grant.body["access_token"],
      refreshToken: grant.body["refresh_token"],
    });
  } catch (err: any) {
    console.error(
      "🔴 Failed to refresh access token. Invaldiating tokens now. Please generate new tokens with `node src/token.js`",
    );
    console.debug("🔎", err.message);
    invalidateTokens();
    process.exit(1);
  }
};

export const updateAccessAndRefreshToken = async (
  spotifyApi: SpotifyWebApi,
  accessToken: string,
  refreshToken: string,
) => {
  if (!accessToken || !refreshToken) {
    console.error("⚠️ Missing accessToken or refresh token. Please run `npm run token`");
    process.exit(1);
  }

  spotifyApi.setAccessToken(accessToken);
  spotifyApi.setRefreshToken(refreshToken);
  saveConfig({ accessToken, refreshToken });
};

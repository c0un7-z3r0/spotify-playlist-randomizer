import nconf from "nconf";
import path from "path";
require("dotenv").config();

const CONFIG_PATH = path.join(__dirname, "/../.spotify-cli-config.json");

nconf.env().file(CONFIG_PATH);

interface Config {
  accessToken?: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
}

const _save = () => {
  nconf.save({});
};

export const saveConfig = ({ accessToken, refreshToken, clientId, clientSecret }: Config): void => {
  nconf.set("ACCESS_TOKEN", accessToken || nconf.get("ACCESS_TOKEN"));
  nconf.set("REFRESH_TOKEN", refreshToken || nconf.get("REFRESH_TOKEN"));
  nconf.set("CLIENT_ID", clientId || nconf.get("CLIENT_ID"));
  nconf.set("CLIENT_SECRET", clientSecret || nconf.get("CLIENT_SECRET"));
  _save();
};

export const invalidateTokens = () => {
  nconf.clear("ACCESS_TOKEN");
  nconf.clear("REFRESH_TOKEN");
  _save();
};

export const getConfig = () => ({
  accessToken: nconf.get("ACCESS_TOKEN"),
  refreshToken: nconf.get("REFRESH_TOKEN"),
  clientId: nconf.get("CLIENT_ID"),
  clientSecret: nconf.get("CLIENT_SECRET"),
  configPath: CONFIG_PATH,
  scopes: ["playlist-modify-private", "playlist-read-private"],
});

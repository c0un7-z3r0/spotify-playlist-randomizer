import _playlistConfig from "../playlist-config.json";
import { getConfig } from "./config-helper";
import { updateAccessAndRefreshToken, refreshTokens } from "./session-helper";
import {
  getSpotifyApi,
  getAllAlbumsOfArtist,
  getOrCreateUserPlaylistByName,
  getAllTrackIdsOfAlbum,
  replaceTracksInPlaylist,
} from "./spotify";

interface PlaylistConfig {
  artistId: string;
  playlistName: string;
  user: string;
}
const playlistConfig = _playlistConfig as PlaylistConfig;

const init = async () => {
  const { clientId, clientSecret, accessToken, refreshToken } = getConfig();

  if (!clientId || !clientSecret) {
    console.error(
      "⚠️ Missing client id or client secret. If you run it for the first time, please provide them as env variables.",
    );
    process.exit(1);
  }

  const spotifyApi = getSpotifyApi(clientId, clientSecret);
  updateAccessAndRefreshToken(spotifyApi, accessToken, refreshToken);

  try {
    const albumsOfArtist = await getAllAlbumsOfArtist(spotifyApi, playlistConfig.artistId);
    const albumIndex = Math.floor(Math.random() * (albumsOfArtist.length - 0 + 1)) + 0;
    const tracks = await getAllTrackIdsOfAlbum(spotifyApi, albumsOfArtist[albumIndex].id);
    const playlist = await getOrCreateUserPlaylistByName(spotifyApi, playlistConfig.playlistName);
    if (!playlist) throw new Error("Could not find or create playlist!");

    await replaceTracksInPlaylist(spotifyApi, playlist.id, tracks);

    console.info(
      `🎉 Replaced all tracks in playlist "${playlist.name}" with ${tracks.length} new tracks of the album "${
        albumsOfArtist[albumIndex].name
      }" by "${albumsOfArtist[albumIndex].artists.map((a) => a.name)}"`,
    );
  } catch (err: any) {
    if (err.statusCode === 401) {
      console.warn("⚠️ Invalid or expired access token. Trying to refresh.");
      await refreshTokens(spotifyApi);
      init();
    } else {
      console.error("\n🔴 Unhandled error occured. Please check log output above.");
      console.debug("🔎", err.message);
      process.exit(1);
    }
  }
};

init();

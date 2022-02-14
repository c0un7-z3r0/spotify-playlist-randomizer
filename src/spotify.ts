import SpotifyWebApi from "spotify-web-api-node";

const REQUEST_LIMIT = 50;
const MAX_UPDATE_TRACKS_PER_REQUEST = 100;

export const getSpotifyApi = (clientId: string, clientSecret: string) => {
  return new SpotifyWebApi({
    redirectUri: "http://localhost:8080/callback",
    clientId,
    clientSecret,
  });
};

export const getArtistAlbum = async (api: SpotifyWebApi, artistId: string, offset = 0, limit = REQUEST_LIMIT) => {
  const albums = await api.getArtistAlbums(artistId, {
    limit,
    offset,
  });
  return {
    albums: albums.body.items,
    total: albums.body.total,
  };
};
export const getAlbumTracks = async (
  api: SpotifyWebApi,
  albumId: string,
  offset = 0,
  limit = REQUEST_LIMIT,
): Promise<{ tracks: SpotifyApi.TrackObjectSimplified[]; total: number }> => {
  const tracksResponse = await api.getAlbumTracks(albumId, {
    limit,
    offset,
  });
  return {
    tracks: tracksResponse.body.items,
    total: tracksResponse.body.total,
  };
};

export const getAllTracksOfAlbum = async (
  api: SpotifyWebApi,
  albumId: string,
  offset = 0,
  limit = REQUEST_LIMIT,
  tracks: SpotifyApi.TrackObjectSimplified[] = [],
): Promise<SpotifyApi.TrackObjectSimplified[]> => {
  const response = await getAlbumTracks(api, albumId, offset, limit);
  const merged = [...tracks, ...response.tracks];
  if (merged.length < response.total) {
    process.stdout.write(".");
    const newOffset = merged.length;
    const newLimit = Math.min(response.total - merged.length, REQUEST_LIMIT);
    return getAllTracksOfAlbum(api, albumId, newOffset, newLimit, merged);
  }
  console.log(` - ✅ Done (${merged.length}/${response.total} Tracks)`);
  return merged;
};

const getTrackIds = (tracksOfAlbum: SpotifyApi.TrackObjectSimplified[]): string[] =>
  tracksOfAlbum.map((item) => item.uri);

export const getAllTrackIdsOfAlbum = async (api: SpotifyWebApi, albumId: string) => {
  return getTrackIds(await getAllTracksOfAlbum(api, albumId));
};

export const getAllAlbumsOfArtist = async (
  api: SpotifyWebApi,
  artistId: string,
  offset = 0,
  limit = REQUEST_LIMIT,
  albums: SpotifyApi.AlbumObjectSimplified[] = [],
): Promise<SpotifyApi.AlbumObjectSimplified[]> => {
  const response = await getArtistAlbum(api, artistId, offset, limit);
  const merged = [...albums, ...response.albums];

  if (merged.length < response.total) {
    process.stdout.write(".");
    const newOffset = merged.length;
    const newLimit = Math.min(response.total - merged.length, REQUEST_LIMIT);
    return getAllAlbumsOfArtist(api, artistId, newOffset, newLimit, merged);
  }
  console.log(` - ✅ Done (${merged.length}/${response.total} Albums)`);
  return merged;
};

const createPlaylist = async (api: SpotifyWebApi, playlistName: string) => {
  console.log(`⚠️ Playlist "${playlistName}" did not exist for user. Will create a new playlist.`);
  const createUserPlaylistResponse = await api.createPlaylist(playlistName, {
    description: "generated playlist",
    public: false,
  });
  return createUserPlaylistResponse.body;
};

const getUserPlaylistByName = async (api: SpotifyWebApi, playlistName: string) => {
  const userPlaylistResponse = await api.getUserPlaylists();
  return userPlaylistResponse.body.items.find((pl) => pl.name === playlistName);
};

export const getOrCreateUserPlaylistByName = async (api: SpotifyWebApi, playlistName: string) => {
  const playlist = await getUserPlaylistByName(api, playlistName);
  if (playlist) return playlist;

  return createPlaylist(api, playlistName);
};

export const replaceTracksInPlaylist = async (api: SpotifyWebApi, playlistId: string, trackIds: string[]) => {
  if (trackIds.length > MAX_UPDATE_TRACKS_PER_REQUEST) {
    const chunks = trackIds.reduce((collection, item, index) => {
      const chunkIndex = Math.floor(index / MAX_UPDATE_TRACKS_PER_REQUEST);
      if (!collection[chunkIndex]) {
        collection[chunkIndex] = [];
      }
      collection[chunkIndex].push(item);
      return collection;
    }, [] as string[][]);
    for (let index in chunks) {
      if (index === "0") {
        await api.replaceTracksInPlaylist(playlistId, chunks[index]);
      } else {
        await api.addTracksToPlaylist(playlistId, chunks[index]);
      }
    }
  } else {
    await api.replaceTracksInPlaylist(playlistId, trackIds);
  }
};

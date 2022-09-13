class PlaylistsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
        this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
        this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
        this.postSongPlaylistHandler = this.postSongPlaylistHandler.bind(this);
        this.getSongsFromPlaylistHandler = this.getSongsFromPlaylistHandler.bind(this);
        this.deleteSongsFromPlaylistHandler = this.deleteSongsFromPlaylistHandler.bind(this);
    }

    async postPlaylistHandler(request, h) {
        this._validator.validatePlaylistPayload(request.payload);
        const { name } = request.payload;
        const { userId: credentialId } = request.auth.credentials;

        const playlistId = await this._service.addPlaylist({ name, owner: credentialId });

        return h.response({
            status: 'success',
            data: {
                playlistId,
            },
        }).code(201);
    }

    async getPlaylistsHandler(request) {
        const { userId: credentialId } = request.auth.credentials;

        const playlists = await this._service.getPlaylists(credentialId);

        return {
            status: 'success',
            data: {
                playlists,
            },
        };
    }

    async deletePlaylistByIdHandler(request) {
        const { id: playlistId } = request.params;
        const { userId: credentialId } = request.auth.credentials;

        await this._service.verifyPlaylistOwner(playlistId, credentialId);
        await this._service.deletePlaylistById(playlistId);

        return {
            status: 'success',
            message: 'Playlist berhasil dihapus',
        };
    }

    async postSongPlaylistHandler(request, h) {
        this._validator.validateAddSongPayload(request.payload);
        const { songId } = request.payload;
        const { id: playlistId } = request.params;
        const { userId: credentialId } = request.auth.credentials;

        await this._service.verifyPlaylistOwner(playlistId, credentialId);
        await this._service.addSongToPlaylist(songId, playlistId);

        return h.response({
            status: 'success',
            message: 'Lagu berhasil ditambahkan ke playlist',
        }).code(201);
    }

    async getSongsFromPlaylistHandler(request) {
        const { id: playlistId } = request.params;
        const { userId: credentialId } = request.auth.credentials;

        await this._service.verifyPlaylistOwner(playlistId, credentialId);
        const playlist = await this._service.getPlaylistById(playlistId);
        playlist.songs = await this._service.getSongsFromPlaylist(playlistId);

        return {
            status: 'success',
            data: {
                playlist,
            },
        };
    }

    async deleteSongsFromPlaylistHandler(request) {
        this._validator.validateAddSongPayload(request.payload);
        const { songId } = request.payload;
        const { id: playlistId } = request.params;
        const { userId: credentialId } = request.auth.credentials;

        await this._service.verifyPlaylistOwner(playlistId, credentialId);
        await this._service.deleteSongFromPlaylist(songId, playlistId);

        return {
            status: 'success',
            message: 'Playlist berhasil dihapus',
        };
    }
}

module.exports = PlaylistsHandler;

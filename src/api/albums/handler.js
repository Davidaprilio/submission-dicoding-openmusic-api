const { ClientError } = require('../../exceptions');

class AlbumsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        this.postAlbumHandler = this.postAlbumHandler.bind(this);
        this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
        this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
        this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    }

    async postAlbumHandler(request, h) {
        try {
            this._validator.validateAlbumPayload(request.payload);
            const { name, year } = request.payload;

            const albumId = await this._service.addAlbum({ name, year });

            return h.response({
                status: 'success',
                data: {
                    albumId,
                },
            }).code(201);
        } catch (error) {
            return this.handleErrorAlbum(error, h);
        }
    }

    async getAlbumByIdHandler(request, h) {
        try {
            const { id } = request.params;

            const album = await this._service.getAlbumById(id);
            const songs = await this._service.getSongOnAlbum(album.id);
            album.songs = songs;

            return {
                status: 'success',
                data: {
                    album,
                },
            };
        } catch (error) {
            return this.handleErrorAlbum(error, h);
        }
    }

    async putAlbumByIdHandler(request, h) {
        try {
            this._validator.validateAlbumPayload(request.payload);
            const { id } = request.params;

            await this._service.editAlbumById(id, request.payload);

            return {
                status: 'success',
                message: 'Album berhasil diperbarui',
            };
        } catch (error) {
            return this.handleErrorAlbum(error, h);
        }
    }

    async deleteAlbumByIdHandler(request, h) {
        try {
            const { id } = request.params;

            await this._service.deleteAlbumById(id);

            return {
                status: 'success',
                message: 'Album berhasil dihapus',
            };
        } catch (error) {
            return this.handleErrorAlbum(error, h);
        }
    }

    // eslint-disable-next-line class-methods-use-this
    handleErrorAlbum(error, h) {
        if (error instanceof ClientError) {
            return h.response({
                status: 'fail',
                message: error.message,
            }).code(error.statusCode);
        }

        // Server ERROR!
        console.error(error);
        return h.response({
            status: 'error',
            message: 'Maaf, terjadi kegagalan pada server kami.',
        }).code(500);
    }
}

module.exports = AlbumsHandler;

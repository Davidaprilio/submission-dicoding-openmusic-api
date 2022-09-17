class AlbumsHandler {
    constructor(albumsService, storageService, validator) {
        this._albumsService = albumsService;
        this._storageService = storageService;
        this._validator = validator;

        this.postAlbumHandler = this.postAlbumHandler.bind(this);
        this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
        this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
        this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
        this.postAlbumCoverHandler = this.postAlbumCoverHandler.bind(this);
    }

    async postAlbumHandler(request, h) {
        this._validator.validateAlbumPayload(request.payload);
        const { name, year } = request.payload;

        const albumId = await this._albumsService.addAlbum({ name, year });

        return h.response({
            status: 'success',
            data: {
                albumId,
            },
        }).code(201);
    }

    async getAlbumByIdHandler(request) {
        const { id } = request.params;

        const album = await this._albumsService.getAlbumById(id);
        album.songs = await this._albumsService.getSongOnAlbum(album.id);

        return {
            status: 'success',
            data: {
                album,
            },
        };
    }

    async putAlbumByIdHandler(request) {
        this._validator.validateAlbumPayload(request.payload);
        const { id } = request.params;

        await this._albumsService.editAlbumById(id, request.payload);

        return {
            status: 'success',
            message: 'Album berhasil diperbarui',
        };
    }

    async deleteAlbumByIdHandler(request) {
        const { id } = request.params;

        await this._albumsService.deleteAlbumById(id);

        return {
            status: 'success',
            message: 'Album berhasil dihapus',
        };
    }

    async postAlbumCoverHandler(request, h) {
        const { id } = request.params;
        const { cover } = request.payload;
        this._validator.validateAlbumCover(cover.hapi.headers);

        // check album is exist
        await this._albumsService.getAlbumById(id);

        const filename = await this._storageService.writeFile(cover, cover.hapi);
        const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/albums/cover/${filename}`;

        await this._albumsService.editAlbumCoverById(id, coverUrl);

        return h.response({
            status: 'success',
            data: {
                coverUrl,
            },
        }).code(201);
    }
}

module.exports = AlbumsHandler;

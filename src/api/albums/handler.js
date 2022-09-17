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
        this.postLikesAlbumByIdHandler = this.postLikesAlbumByIdHandler.bind(this);
        this.getLikesAlbumByIdHandler = this.getLikesAlbumByIdHandler.bind(this);
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
            message: 'Sampul berhasil diunggah',
        }).code(201);
    }

    async postLikesAlbumByIdHandler(request, h) {
        const { id } = request.params;
        const { userId: credentialId } = request.auth.credentials;

        // verify album is exist
        const album = await this._albumsService.getAlbumById(id);
        const isLiked = await this._albumsService.addOrDeleteLikeAlbums(album.id, credentialId);

        return h.response({
            status: 'success',
            message: isLiked ? 'Like ditambahkan' : 'Like dihapus',
        }).code(201);
    }

    async getLikesAlbumByIdHandler(request, h) {
        const { id } = request.params;

        // verify album is exist
        const album = await this._albumsService.getAlbumById(id);
        const {
            likes,
            source,
        } = await this._albumsService.getLikesAlbums(album.id);

        const response = h.response({
            status: 'success',
            data: {
                likes: parseInt(likes, 10),
            },
        });

        if (source === 'cache') {
            // set header X-Data-Source = cache
            response.header('X-Data-Source', 'cache');
        }

        return response;
    }
}

module.exports = AlbumsHandler;

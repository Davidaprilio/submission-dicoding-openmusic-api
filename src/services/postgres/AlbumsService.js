const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const { InvariantError, NotFoundError } = require('../../exceptions');
const { mapDBToModel, mapAlbumsTBToModel } = require('../../utils');

class AlbumsService {
    constructor(cacheService) {
        this._pool = new Pool();
        this._cacheService = cacheService;
    }

    async addAlbum({ name, year }) {
        const id = nanoid(16);
        const query = {
            text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
            values: [`album-${id}`, name, year],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Album gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async getAlbumById(id) {
        const query = {
            text: 'SELECT * FROM albums WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Album tidak ditemukan');
        }

        return result.rows.map(mapAlbumsTBToModel)[0];
    }

    async getSongOnAlbum(albumId) {
        const query = {
            text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
            values: [albumId],
        };

        const result = await this._pool.query(query);

        return result.rows.map(mapDBToModel);
    }

    async editAlbumById(id, { name, year }) {
        const query = {
            text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
            values: [name, year, id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
        }
    }

    async editAlbumCoverById(id, coverUrl) {
        const query = {
            text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
            values: [coverUrl, id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
        }
    }

    async deleteAlbumById(id) {
        const query = {
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
        }
    }

    async getLikesAlbums(albumId) {
        try {
            const likes = await this._cacheService.get(`likes:${albumId}`);
            return { likes, source: 'cache' };
        } catch (error) {
            const query = {
                text: 'SELECT COUNT(*) as likes FROM user_album_likes WHERE album_id = $1',
                values: [albumId],
            };

            const result = await this._pool.query(query);

            const { likes } = result.rows[0];

            await this._cacheService.set(`likes:${albumId}`, likes);

            return { likes, source: 'database' };
        }
    }

    async addOrDeleteLikeAlbums(albumId, userId) {
        const query = {
            text: 'SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
            values: [albumId, userId],
        };

        const result = await this._pool.query(query);

        if (result.rowCount) {
            const deleted = await this._pool.query({
                text: 'DELETE FROM user_album_likes WHERE id = $1',
                values: [result.rows[0].id],
            });

            if (!deleted.rowCount) {
                throw new NotFoundError('Gagal menghapus like album');
            }
            await this._cacheService.delete(`likes:${albumId}`);
            return false;
        }

        const insert = await this._pool.query({
            text: 'INSERT INTO user_album_likes VALUES($1, $2, $3)',
            values: [`likes-${nanoid(16)}`, userId, albumId],
        });

        if (!insert.rowCount) {
            throw new InvariantError('Gagal menambahkan like album');
        }
        await this._cacheService.delete(`likes:${albumId}`);
        return true;
    }
}

module.exports = AlbumsService;

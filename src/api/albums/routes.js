const path = require('path');

const routes = (handler) => [
    {
        method: 'POST',
        path: '/albums',
        handler: handler.postAlbumHandler,
    },
    {
        method: 'GET',
        path: '/albums/{id}',
        handler: handler.getAlbumByIdHandler,
    },
    {
        method: 'PUT',
        path: '/albums/{id}',
        handler: handler.putAlbumByIdHandler,
    },
    {
        method: 'DELETE',
        path: '/albums/{id}',
        handler: handler.deleteAlbumByIdHandler,
    },
    {
        method: 'POST',
        path: '/albums/{id}/likes',
        handler: handler.postLikesAlbumByIdHandler,
        options: {
            auth: 'openmusic_jwt',
        },
    },
    {
        method: 'GET',
        path: '/albums/{id}/likes',
        handler: handler.getLikesAlbumByIdHandler,
    },
    {
        method: 'POST',
        path: '/albums/{id}/covers',
        handler: handler.postAlbumCoverHandler,
        options: {
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                output: 'stream',
                maxBytes: 512000, // 512KB
            },
        },
    },
    {
        method: 'GET',
        path: '/albums/cover/{param*}',
        handler: {
            directory: {
                path: path.resolve(__dirname, 'covers'),
            },
        },
    },
];

module.exports = routes;

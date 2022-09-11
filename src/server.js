require('dotenv').config();
const Hapi = require('@hapi/hapi');
const { albums, songs } = require('./api');
const { AlbumsService, SongsService } = require('./services/postgres');
const { AlbumsValidator, SongsValidator } = require('./validator');

const init = async () => {
    const albumsService = new AlbumsService();
    const songsService = new SongsService();

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    await server.register({
        plugin: albums,
        options: {
            service: albumsService,
            validator: AlbumsValidator,
        },
    });

    await server.register({
        plugin: songs,
        options: {
            service: songsService,
            validator: SongsValidator,
        },
    });

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();

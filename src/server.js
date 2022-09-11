require('dotenv').config();
const Hapi = require('@hapi/hapi');
const { albums } = require('./api');
const { AlbumsService } = require('./services/postgres');
const { AlbumsValidator } = require('./validator');

const init = async () => {
    const albumsService = new AlbumsService();

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

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();

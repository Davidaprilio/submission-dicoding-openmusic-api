require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const path = require('path');
const Inert = require('@hapi/inert');

const TokenManager = require('./tokenize/TokenManager');

const {
    albums,
    songs,
    users,
    authentications,
    playlists,
    collaborations,
    _exports,
} = require('./api');

const {
    AlbumsService,
    SongsService,
    UsersService,
    AuthenticationsService,
    PlaylistsService,
    CollaborationsService,
} = require('./services/postgres');
const ProducerService = require('./services/rabbitmq/ProducerService');
const StorageService = require('./services/storage/StorageService');

const {
    AlbumsValidator,
    SongsValidator,
    UsersValidator,
    AuthenticationsValidator,
    PlaylistsValidator,
    CollaborationsValidator,
    ExportsValidator,
} = require('./validator');

const { ClientError } = require('./exceptions');

const init = async () => {
    const albumsService = new AlbumsService();
    const songsService = new SongsService();
    const usersService = new UsersService();
    const authenticationsService = new AuthenticationsService();
    const collaborationsService = new CollaborationsService();
    const playlistsService = new PlaylistsService(collaborationsService);
    const storageService = new StorageService(path.resolve(__dirname, 'api/albums/covers'));

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    // registrasi plugin eksternal
    await server.register([
        {
            plugin: Jwt,
        },
        {
            plugin: Inert,
        },
    ]);

    // mendefinisikan strategy autentikasi jwt
    server.auth.strategy('openmusic_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE,
        },
        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                userId: artifacts.decoded.payload.userId,
            },
        }),
    });

    await server.register([
        {
            plugin: albums,
            options: {
                albumsService,
                storageService,
                validator: AlbumsValidator,
            },
        },
        {
            plugin: songs,
            options: {
                service: songsService,
                validator: SongsValidator,
            },
        },
        {
            plugin: users,
            options: {
                service: usersService,
                validator: UsersValidator,
            },
        },
        {
            plugin: authentications,
            options: {
                authenticationsService,
                usersService,
                tokenManager: TokenManager,
                validator: AuthenticationsValidator,
            },
        },
        {
            plugin: playlists,
            options: {
                service: playlistsService,
                validator: PlaylistsValidator,
            },
        },
        {
            plugin: collaborations,
            options: {
                collaborationsService,
                playlistsService,
                validator: CollaborationsValidator,
            },
        },
        {
            plugin: _exports,
            options: {
                ProducerService,
                playlistsService,
                validator: ExportsValidator,
            },
        },
    ]);

    server.ext('onPreResponse', (request, h) => {
        const { response } = request;

        // Jika response adalah Error
        if (response instanceof ClientError) {
            const newResponse = h.response({
                status: 'fail',
                message: response.message,
            });
            newResponse.code(response.statusCode);
            return newResponse;
        }

        if (response instanceof Error) {
            const { statusCode } = response.output;
            let errorMessage = response.message;

            if (statusCode === 500) {
                // Server Error
                console.error('Error:', statusCode, errorMessage, response);
                errorMessage = 'Maaf, terjadi kegagalan pada server kami.';
            }

            // Response ERROR!
            return h.response({
                status: 'error',
                message: errorMessage,
            }).code(statusCode);
        }

        return response.continue || response;
    });

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
    console.log('Give me 5⭐ coach');
};

init();

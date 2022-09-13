require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

const TokenManager = require('./tokenize/TokenManager');

const {
    albums,
    songs,
    users,
    authentications,
    playlists,
} = require('./api');

const {
    AlbumsService,
    SongsService,
    UsersService,
    AuthenticationsService,
    PlaylistsService,
} = require('./services/postgres');

const {
    AlbumsValidator,
    SongsValidator,
    UsersValidator,
    AuthenticationsValidator,
    PlaylistsValidator,
} = require('./validator');

const { ClientError } = require('./exceptions');

const init = async () => {
    const albumsService = new AlbumsService();
    const songsService = new SongsService();
    const usersService = new UsersService();
    const authenticationsService = new AuthenticationsService();
    const playlistsService = new PlaylistsService();

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
                service: albumsService,
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

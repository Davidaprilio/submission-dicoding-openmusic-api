const InvariantError = require('../../exceptions/InvariantError');
const {
    AlbumPayloadSchema,
    AlbumCoverPayloadSchema,
} = require('./schema');

const AlbumsValidator = {
    validateAlbumPayload: (payload) => {
        const validationResult = AlbumPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
    validateAlbumCover: (payload) => {
        const validationResult = AlbumCoverPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
};

module.exports = AlbumsValidator;

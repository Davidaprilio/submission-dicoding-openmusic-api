const { InvariantError } = require('../../exceptions');
const { PlaylistPayloadSchema, AddSongPayloadSchema } = require('./schema');

const PlaylistsValidator = {
    validatePlaylistPayload: (payload) => {
        const validationResult = PlaylistPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },

    validateAddSongPayload: (payload) => {
        const validationResult = AddSongPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
};

module.exports = PlaylistsValidator;

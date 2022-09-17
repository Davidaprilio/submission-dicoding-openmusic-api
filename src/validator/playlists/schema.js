const Joi = require('joi');

const PlaylistPayloadSchema = Joi.object({
    name: Joi.string().max(255).required(),
});

const AddSongPayloadSchema = Joi.object({
    songId: Joi.string().required(),
});

module.exports = { PlaylistPayloadSchema, AddSongPayloadSchema };

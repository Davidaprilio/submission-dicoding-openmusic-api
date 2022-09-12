const Joi = require('joi');

const AlbumPayloadSchema = Joi.object({
    name: Joi.string().required(),
    year: Joi.number().min(1900).max(new Date().getFullYear()).required(),
});

module.exports = { AlbumPayloadSchema };

/* eslint-disable camelcase */
const mapDBToModel = ({
    id,
    title,
    year,
    genre,
    performer,
    duration,
    album_id,
}) => ({
    id,
    title,
    year,
    genre,
    performer,
    duration,
    albumId: album_id,
});

const mapAlbumsTBToModel = ({
    id,
    name,
    year,
    cover,
}) => ({
    id,
    name,
    year,
    coverUrl: cover,
});

module.exports = { mapDBToModel, mapAlbumsTBToModel };

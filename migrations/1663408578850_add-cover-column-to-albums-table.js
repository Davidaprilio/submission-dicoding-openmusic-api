/* eslint-disable camelcase */

exports.up = (pgm) => {
    pgm.addColumns('albums', {
        cover: {
            type: 'TEXT',
            notNull: false,
        },
    });
};

exports.down = (pgm) => {
    pgm.dropColumns('albums', ['cover']);
};

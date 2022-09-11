/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createTable('songs', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
            notNull: true,
        },
        title: {
            type: 'VARCHAR(255)',
            notNull: true,
        },
        year: {
            type: 'INTEGER',
            notNull: true,
        },
        genre: {
            type: 'VARCHAR(100)',
            notNull: true,
        },
        performer: {
            type: 'VARCHAR(255)',
            notNull: true,
        },
        duration: {
            type: 'INTEGER',
        },
        albumId: {
            type: 'VARCHAR(50)',
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('songs');
};

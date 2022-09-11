const { Pool } = require('pg');

class SongsService {
    constructor() {
        this._pool = new Pool();
    }

    // async addSong({ title, body, tags }) {

    // }

    // async getSongs() {

    // }

    // async getSongById(id) {

    // }

    // async editSongById(id, { title, body, tags }) {

    // }

    // async deleteSongById(id) {

    // }
}

module.exports = SongsService;

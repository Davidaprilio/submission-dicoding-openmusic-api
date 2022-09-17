class ExportsHandler {
    constructor(ProducerService, playlistsService, validator) {
        this._ProducerService = ProducerService;
        this._playlistsService = playlistsService;
        this._validator = validator;

        this.postExportPlaylistByIdHandler = this.postExportPlaylistByIdHandler.bind(this);
    }

    async postExportPlaylistByIdHandler(request, h) {
        this._validator.validateExportPlaylistPayload(request.payload);
        const { playlistId } = request.params;
        const { userId } = request.auth.credentials;

        await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

        const message = {
            userId,
            targetEmail: request.payload.targetEmail,
        };

        await this._ProducerService.sendMessage('export:payloads', JSON.stringify(message));

        return h.response({
            status: 'success',
            message: 'Permintaan Anda sedang kami proses',
        }).code(201);
    }
}

module.exports = ExportsHandler;

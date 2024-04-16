"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PQLError = void 0;
class PQLError extends Error {
    constructor(message) {
        super(message);
    }
}
exports.PQLError = PQLError;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PQLParsingError = void 0;
class PQLParsingError extends Error {
    constructor(message) {
        super(message);
    }
}
exports.PQLParsingError = PQLParsingError;

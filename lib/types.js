"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenType = void 0;
var TokenType;
(function (TokenType) {
    TokenType[TokenType["KEYWORD"] = 0] = "KEYWORD";
    TokenType[TokenType["IDENTIFIER"] = 1] = "IDENTIFIER";
    TokenType[TokenType["PLOT_TYPE"] = 2] = "PLOT_TYPE";
    TokenType[TokenType["LPAREN"] = 3] = "LPAREN";
    TokenType[TokenType["RPAREN"] = 4] = "RPAREN";
    TokenType[TokenType["COMMA"] = 5] = "COMMA";
    TokenType[TokenType["STRING"] = 6] = "STRING";
    TokenType[TokenType["NUMBER"] = 7] = "NUMBER";
    TokenType[TokenType["NULL"] = 8] = "NULL";
    TokenType[TokenType["COMPARISON_OPERATOR"] = 9] = "COMPARISON_OPERATOR";
    TokenType[TokenType["AGGREGATION_FUNCTION"] = 10] = "AGGREGATION_FUNCTION";
    TokenType[TokenType["EOF"] = 11] = "EOF";
})(TokenType || (exports.TokenType = TokenType = {}));

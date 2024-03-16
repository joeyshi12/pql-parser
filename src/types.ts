export enum TokenType {
    PLOT = 'PLOT',
    BAR = 'BAR',
    LINE = 'LINE',
    SCATTER = 'SCATTER',
    USING = 'USING',
    AND = 'AND',
    WHERE = 'WHERE',
    GROUP_BY = 'GROUP BY',
    HAVING = 'HAVING',
    OR = 'OR',
    AND_OPERATOR = 'AND',
    AS = 'AS',
    AVG = 'AVG',
    COUNT = 'COUNT',
    SUM = 'SUM',
    IDENTIFIER = 'IDENTIFIER',
    CONDITION = 'CONDITION',
    COMPARISON_OPERATOR = 'COMPARISON_OPERATOR',
    NUMBER = 'NUMBER',
    STRING = 'STRING',
    LPAREN = '(',
    RPAREN = ')',
    NULL = 'NULL',
    EOF = 'EOF'
}

// TODO: change to interface
export class Token {
    constructor(public type: TokenType, public value: string) {}
}


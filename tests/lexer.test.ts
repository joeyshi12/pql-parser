import { Lexer } from '../src';

test("basic plot statement", () => {
    const input = 'PLOT BAR USING col1 AND col2';
    const lexer = new Lexer(input);
    console.log(lexer.getNextToken());
    console.log(lexer.getNextToken());
    console.log(lexer.getNextToken());
    console.log(lexer.getNextToken());
    console.log(lexer.getNextToken());
    console.log(lexer.getNextToken());
    console.log(lexer.getNextToken());
});

import { Lexer, Parser } from '../src';

//test("basic plot statement", () => {
//    const input = 'PLOT BAR USING col1 AND col2';
//    const lexer = new Lexer(input);
//    const parser = new Parser(lexer);
//    const result = parser.parse();
//    console.log(result);
//});
//
//test("plot statement with labelled columns", () => {
//    const input = 'PLOT BAR USING col1 AS \'x\' AND col2 AS \'y\'';
//    const lexer = new Lexer(input);
//    const parser = new Parser(lexer);
//    const result = parser.parse();
//    console.log(result);
//});
//
//test('adds two numbers correctly', () => {
//    // Example usage
//    const input = 'PLOT BAR USING AVG(col1) AND SUM(col2) WHERE col1 > 5 AND col2 <= 10 GROUP BY col1 HAVING AVG(col1) > 3 AND SUM(col2) = 20';
//    const lexer = new Lexer(input);
//    const parser = new Parser(lexer);
//    const result = parser.parse();
//    console.log(result);
//});

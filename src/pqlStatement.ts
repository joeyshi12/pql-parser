import { PQLError } from "./exceptions";
import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { PQLSyntaxTree } from "./types";

export class PQLStatement {
    constructor(private _data: any[]) {}

    public executeQuery(query: string) {
        const parser = new Parser(new Lexer(query));
        const syntaxTree = parser.parse();
        const columns = this._processData(syntaxTree);
        return this._createPlot(columns, syntaxTree);
    }

    private _processData(syntaxTree: PQLSyntaxTree): ColumnData<string | number>[] {
        if (!syntaxTree.groupByColumn) {
            return syntaxTree.usingAttributes.map(attr => {
                if (!attr.column) {
                    throw new PQLError("Column is undefined");
                }
                if (!(attr.column in this._data[0])) {
                    throw new PQLError(`Column ${attr.column} is missing from data`);
                }
                return {
                    name: attr.displayName ?? attr.column,
                    values: this._data.map(row => row[attr.column!])
                };
            });
        }
        return [];
    }

    private _createPlot(columns: ColumnData<string | number>[], syntaxTree: PQLSyntaxTree): SVGSVGElement {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        return svg;
    }
}

export interface ColumnData<T> {
    name: string;
    values: T[];
}

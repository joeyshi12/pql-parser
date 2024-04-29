import { PlotConfig, PlotType, RowData, UsingAttribute } from "./types";
import { WhereFilter } from "./filters";
export declare class PQLStatement {
    readonly plotType: PlotType;
    readonly usingAttributes: UsingAttribute[];
    readonly whereFilter?: WhereFilter | undefined;
    readonly groupByColumn?: string | undefined;
    constructor(plotType: PlotType, usingAttributes: UsingAttribute[], whereFilter?: WhereFilter | undefined, groupByColumn?: string | undefined);
    static create(query: string): PQLStatement;
    execute(data: RowData[], config: PlotConfig): SVGSVGElement;
    private _processData;
    private _createPlot;
}

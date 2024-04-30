import { LimitAndOffset, PlotConfig, PlotType, RowData, UsingAttribute } from "./types";
import { WhereFilter } from "./filters";
export declare class PQLStatement {
    readonly plotType: PlotType;
    readonly usingAttributes: UsingAttribute[];
    readonly whereFilter?: WhereFilter | undefined;
    readonly groupByColumn?: string | undefined;
    readonly limitAndOffset?: LimitAndOffset | undefined;
    constructor(plotType: PlotType, usingAttributes: UsingAttribute[], whereFilter?: WhereFilter | undefined, groupByColumn?: string | undefined, limitAndOffset?: LimitAndOffset | undefined);
    static create(query: string): PQLStatement;
    execute(data: RowData[], config: PlotConfig): SVGSVGElement;
    private _processData;
    private _createPlot;
    private _slicePoints;
}

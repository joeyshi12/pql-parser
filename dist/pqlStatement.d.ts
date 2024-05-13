import { LimitAndOffset, PlotConfig, PlotType, RowData, PlotAttribute } from "./types";
import { WhereFilter } from "./filters";
export declare class PQLStatement {
    readonly plotType: PlotType;
    readonly usingAttributes: PlotAttribute[];
    readonly whereFilter?: WhereFilter | undefined;
    readonly groupByColumn?: string | undefined;
    readonly limitAndOffset?: LimitAndOffset | undefined;
    constructor(plotType: PlotType, usingAttributes: PlotAttribute[], whereFilter?: WhereFilter | undefined, groupByColumn?: string | undefined, limitAndOffset?: LimitAndOffset | undefined);
    static create(query: string): PQLStatement;
    execute(data: RowData[], config: PlotConfig): SVGSVGElement;
    private _processData;
    private _createPlot;
    private _slicePoints;
}

import { ColumnData, PlotConfig, Primitive } from "../types";

export function barChart(x: ColumnData<number>, y: ColumnData<string>, config: PlotConfig): SVGSVGElement {
    // TODO
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    return svg;
}

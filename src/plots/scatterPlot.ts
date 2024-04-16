import { ColumnData, PlotConfig } from "../types";

export function scatterPlot(x: ColumnData<number>, y: ColumnData<number>, config: PlotConfig): SVGSVGElement {
    // TODO
    const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const plotElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
    plotElement.setAttribute("transform", `translate(${config.margin.left}, ${config.margin.top})`)

    const width = config.containerWidth - config.margin.left - config.margin.right;
    const height = config.containerHeight - config.margin.top - config.margin.bottom;

    document.createElementNS("http://www.w3.org/2000/svg", "circle")
    return svgElement;
}

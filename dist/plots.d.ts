import { PlotConfig } from "./types";
export declare function barChart(points: [string, number][], config: PlotConfig): SVGSVGElement;
export declare function lineChart(points: [number, number][], config: PlotConfig): SVGSVGElement;
export declare function scatterPlot(points: [number, number][], config: PlotConfig): SVGSVGElement;

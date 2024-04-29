import { Point, PlotConfig } from "./types";
export declare function barChart(points: Point<number, string>[], config: PlotConfig): SVGSVGElement;
export declare function lineChart(points: Point<number, number>[], config: PlotConfig): SVGSVGElement;
export declare function scatterPlot(points: Point<number, number>[], config: PlotConfig): SVGSVGElement;

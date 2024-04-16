"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scatterPlot = void 0;
function scatterPlot(x, y, config) {
    const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const plotElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
    plotElement.setAttribute("transform", `translate(${config.margin.left}, ${config.margin.top})`);
    const width = config.containerWidth - config.margin.left - config.margin.right;
    const height = config.containerHeight - config.margin.top - config.margin.bottom;
    document.createElementNS("http://www.w3.org/2000/svg", "circle");
    return svgElement;
}
exports.scatterPlot = scatterPlot;

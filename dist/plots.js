"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scatterPlot = exports.lineChart = exports.barChart = void 0;
const d3Select = __importStar(require("d3-selection"));
const d3Scale = __importStar(require("d3-scale"));
const d3Array = __importStar(require("d3-array"));
const d3Axis = __importStar(require("d3-axis"));
const d3Shape = __importStar(require("d3-shape"));
function barChart(points, config) {
    const [width, height] = getShape(config);
    const svg = d3Select.create("svg")
        .attr("width", config.containerWidth)
        .attr("height", config.containerHeight);
    insertLabels(svg, config);
    const plotArea = svg.append("g")
        .attr("transform", `translate(${config.margin.left},${config.margin.top})`);
    const [xMin, xMax] = d3Array.extent(points, p => p.x);
    const xScale = d3Scale.scaleLinear()
        .domain([Math.min(0, xMin), xMax])
        .range([0, width]);
    const yScale = d3Scale.scaleBand()
        .domain(points.map(p => p.y))
        .range([height, 0])
        .paddingInner(0.1)
        .paddingOuter(0);
    const tickFormatter = getNumericalTickFormatter(xMax - xMin);
    const xAxis = d3Axis.axisTop(xScale)
        .tickSize(-height)
        .tickPadding(10)
        .tickSizeOuter(0)
        .tickFormat((value) => tickFormatter(value.valueOf()));
    const yAxis = d3Axis.axisLeft(yScale)
        .tickFormat(label => truncateLabel(label, 20));
    plotArea.append("g")
        .call(xAxis)
        .call(g => g.selectAll(".tick line")
        .attr("color", "#ccc"));
    plotArea.append("g")
        .attr("transform", `translate(${xScale(0)},0)`)
        .call(yAxis)
        .call(g => g.selectAll(".tick text")
        .filter((_, i) => points[i].x < 0)
        .attr("text-anchor", "start")
        .attr("x", 6));
    plotArea.selectAll("rect")
        .data(points)
        .enter()
        .append("rect")
        .attr("fill", (p) => p.x > 0 ? "steelblue" : "orange")
        .attr("x", (p) => xScale(Math.min(p.x, 0)))
        .attr("y", (p) => yScale(p.y))
        .attr("width", (p) => Math.abs(xScale(p.x) - xScale(0)))
        .attr("height", yScale.bandwidth());
    return svg.node();
}
exports.barChart = barChart;
function lineChart(points, config) {
    const [width, height] = getShape(config);
    const svg = d3Select.create("svg")
        .attr("width", config.containerWidth)
        .attr("height", config.containerHeight);
    insertLabels(svg, config);
    const plotArea = svg.append("g")
        .attr("transform", `translate(${config.margin.left},${config.margin.top})`);
    const [xMin, xMax] = d3Array.extent(points, p => p.x);
    const xScale = d3Scale.scaleLinear()
        .domain([xMin, xMax])
        .range([0, width]);
    const [yMin, yMax] = d3Array.extent(points, p => p.y);
    const yScale = d3Scale.scaleLinear()
        .domain([yMin, yMax])
        .range([height, 0]);
    const line = d3Shape.line()
        .x(p => xScale(p.x))
        .y(p => yScale(p.y));
    plotArea.append("path")
        .datum(points)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line);
    const xTickFormatter = getNumericalTickFormatter(xMax - xMin);
    plotArea.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3Axis.axisBottom(xScale).tickFormat((value) => xTickFormatter(value.valueOf())));
    const yTickFormatter = getNumericalTickFormatter(yMax - yMin);
    plotArea.append("g")
        .call(d3Axis.axisLeft(yScale).tickFormat((value) => yTickFormatter(value.valueOf())));
    return svg.node();
}
exports.lineChart = lineChart;
function scatterPlot(points, config) {
    const [width, height] = getShape(config);
    const svg = d3Select.create("svg")
        .attr("width", config.containerWidth)
        .attr("height", config.containerHeight);
    insertLabels(svg, config);
    const plotArea = svg.append("g")
        .attr("transform", `translate(${config.margin.left},${config.margin.top})`);
    const [xMin, xMax] = d3Array.extent(points, p => p.x);
    const xScale = d3Scale.scaleLinear()
        .domain([xMin, xMax])
        .range([0, width]);
    const [yMin, yMax] = d3Array.extent(points, p => p.y);
    const yScale = d3Scale.scaleLinear()
        .domain([yMin, yMax])
        .range([height, 0]);
    plotArea.selectAll("circle")
        .data(points)
        .enter()
        .append("circle")
        .attr("cx", (p) => xScale(p.x))
        .attr("cy", (p) => yScale(p.y))
        .attr("r", 4)
        .attr("fill", "steelblue");
    const xTickFormatter = getNumericalTickFormatter(xMax - xMin);
    plotArea.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3Axis.axisBottom(xScale).tickFormat((value) => xTickFormatter(value.valueOf())));
    const yTickFormatter = getNumericalTickFormatter(yMax - yMin);
    plotArea.append("g")
        .call(d3Axis.axisLeft(yScale).tickFormat((value) => yTickFormatter(value.valueOf())));
    return svg.node();
}
exports.scatterPlot = scatterPlot;
function getNumericalTickFormatter(domainSize) {
    if (domainSize < 1000) {
        return (value) => value.toString();
    }
    if (domainSize < 1000000) {
        return (value) => Math.floor(value / 1000) + "k";
    }
    if (domainSize < 1000000000) {
        return (value) => Math.floor(value / 1000000) + "M";
    }
    return (value) => Math.floor(value / 1000000000) + "B";
}
function insertLabels(svg, config) {
    if (config.xLabel) {
        svg.append("text")
            .attr("transform", `translate(${config.containerWidth / 2}, 0)`)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "hanging")
            .text(config.xLabel);
    }
    if (config.yLabel) {
        svg.append("text")
            .attr("transform", `translate(0, ${config.containerHeight / 2}) rotate(-90)`)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "hanging")
            .text(config.yLabel);
    }
}
function getShape(config) {
    const width = config.containerWidth - config.margin.left - config.margin.right;
    const height = config.containerHeight - config.margin.top - config.margin.bottom;
    return [width, height];
}
function truncateLabel(label, maxLength) {
    if (label.length <= maxLength) {
        return label;
    }
    return label.substring(0, maxLength) + "…";
}

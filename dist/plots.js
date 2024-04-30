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
    if (config.xLabel) {
        svg.append("text")
            .attr("transform", `translate(${config.containerWidth / 2}, ${config.containerHeight - 10})`)
            .text(config.xLabel);
    }
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
    const xAxis = d3Axis.axisBottom(xScale)
        .tickSize(-width - 10)
        .tickPadding(10)
        .tickSizeOuter(0);
    const yAxis = d3Axis.axisLeft(yScale)
        .tickFormat(label => {
        if (label.length <= 16) {
            return label;
        }
        else {
            return label.substring(0, 16) + "…";
        }
    });
    plotArea.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);
    plotArea.append("g")
        .call(yAxis);
    plotArea.selectAll("rect")
        .data(points)
        .enter()
        .append("rect")
        .attr("fill", "steelblue")
        .attr("x", 0)
        .attr("y", (p) => yScale(p.y))
        .attr("width", (p) => xScale(p.x))
        .attr("height", yScale.bandwidth());
    return svg.node();
}
exports.barChart = barChart;
function lineChart(points, config) {
    const [width, height] = getShape(config);
    const svg = d3Select.create("svg")
        .attr("width", config.containerWidth)
        .attr("height", config.containerHeight);
    if (config.xLabel) {
        svg.append("text")
            .attr("transform", `translate(${config.containerWidth / 2}, ${config.containerHeight - 10})`)
            .text(config.xLabel);
    }
    if (config.yLabel) {
        svg.append("text")
            .attr("transform", `translate(${config.margin.left - 40}, ${config.containerHeight / 2}) rotate(-90)`)
            .text(config.yLabel);
    }
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
    plotArea.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3Axis.axisBottom(xScale));
    plotArea.append("g")
        .call(d3Axis.axisLeft(yScale));
    return svg.node();
}
exports.lineChart = lineChart;
function scatterPlot(points, config) {
    const [width, height] = getShape(config);
    const svg = d3Select.create("svg")
        .attr("width", config.containerWidth)
        .attr("height", config.containerHeight);
    if (config.xLabel) {
        svg.append("text")
            .attr("transform", `translate(${config.containerWidth / 2}, ${config.containerHeight - 10})`)
            .text(config.xLabel);
    }
    if (config.yLabel) {
        svg.append("text")
            .attr("transform", `translate(${config.margin.left - 40}, ${config.containerHeight / 2}) rotate(-90)`)
            .text(config.yLabel);
    }
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
    plotArea.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3Axis.axisBottom(xScale));
    plotArea.append("g")
        .call(d3Axis.axisLeft(yScale));
    return svg.node();
}
exports.scatterPlot = scatterPlot;
function getShape(config) {
    const width = config.containerWidth - config.margin.left - config.margin.right;
    const height = config.containerHeight - config.margin.top - config.margin.bottom;
    return [width, height];
}

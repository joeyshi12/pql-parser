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
            .attr("transform", `translate(${config.containerWidth / 2}, 2)`)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "hanging")
            .text(config.xLabel);
    }
    if (config.yLabel) {
        svg.append("text")
            .attr("transform", `translate(2, ${config.containerHeight / 2}) rotate(-90)`)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "hanging")
            .text(config.yLabel);
    }
    const plotArea = svg.append("g")
        .attr("transform", `translate(${config.margin.left},${config.margin.top})`);
    const [xMin, xMax] = d3Array.extent(points, p => p[1]);
    const xScale = d3Scale.scaleLinear()
        .domain([Math.min(0, xMin), xMax])
        .range([0, width]);
    const yScale = d3Scale.scaleBand()
        .domain(points.map(p => p[0]))
        .range([height, 0])
        .paddingInner(0.1)
        .paddingOuter(0);
    const ticks = xScale.ticks();
    const tickFormatter = getTickFormatter(ticks[1] - ticks[0]);
    const xAxis = d3Axis.axisTop(xScale)
        .tickSize(-height)
        .tickPadding(10)
        .tickSizeOuter(0)
        .tickFormat(tickFormatter);
    const yAxis = d3Axis.axisLeft(yScale)
        .tickFormat(label => truncateLabel(label, 15));
    plotArea.append("g")
        .call(xAxis)
        .call(g => g.selectAll(".tick line")
        .attr("color", "#ccc"));
    plotArea.selectAll("rect")
        .data(points)
        .enter()
        .append("rect")
        .attr("fill", (p) => p[1] > 0 ? "steelblue" : "orange")
        .attr("x", (p) => xScale(Math.min(p[1], 0)))
        .attr("y", (p) => yScale(p[0]))
        .attr("width", (p) => Math.abs(xScale(p[1]) - xScale(0)))
        .attr("height", yScale.bandwidth())
        .attr("opacity", "0.7");
    plotArea.append("g")
        .attr("transform", `translate(${xScale(0)},0)`)
        .call(yAxis)
        .call(g => g.selectAll(".tick text")
        .filter((_, i) => points[i][1] < 0)
        .attr("text-anchor", "start")
        .attr("x", 6));
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
            .attr("transform", `translate(${config.containerWidth / 2}, ${config.containerHeight - 4})`)
            .attr("text-anchor", "middle")
            .text(config.xLabel);
    }
    if (config.yLabel) {
        svg.append("text")
            .attr("transform", `translate(2, ${config.containerHeight / 2}) rotate(-90)`)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "hanging")
            .text(config.yLabel);
    }
    const plotArea = svg.append("g")
        .attr("transform", `translate(${config.margin.left},${config.margin.top})`);
    const [xMin, xMax] = d3Array.extent(points, p => p[0]);
    const xScale = d3Scale.scaleLinear()
        .domain([xMin, xMax])
        .range([0, width]);
    const [yMin, yMax] = d3Array.extent(points, p => p[1]);
    const yScale = d3Scale.scaleLinear()
        .domain([yMin, yMax])
        .range([height, 0]);
    const xTicks = xScale.ticks();
    const xTickFormatter = getTickFormatter(xTicks[1] - xTicks[0]);
    plotArea.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3Axis.axisBottom(xScale).tickFormat(xTickFormatter));
    const yTicks = yScale.ticks();
    const yTickFormatter = getTickFormatter(yTicks[1] - yTicks[0]);
    plotArea.append("g")
        .call(d3Axis.axisLeft(yScale).tickFormat(yTickFormatter));
    const line = d3Shape.line()
        .x(p => xScale(p[0]))
        .y(p => yScale(p[1]));
    plotArea.append("path")
        .datum(points)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line);
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
            .attr("transform", `translate(${config.containerWidth / 2}, ${config.containerHeight - 4})`)
            .attr("text-anchor", "middle")
            .text(config.xLabel);
    }
    if (config.yLabel) {
        svg.append("text")
            .attr("transform", `translate(2, ${config.containerHeight / 2}) rotate(-90)`)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "hanging")
            .text(config.yLabel);
    }
    const plotArea = svg.append("g")
        .attr("transform", `translate(${config.margin.left},${config.margin.top})`);
    const [xMin, xMax] = d3Array.extent(points, p => p[0]);
    const xScale = d3Scale.scaleLinear()
        .domain([xMin, xMax])
        .range([0, width]);
    const [yMin, yMax] = d3Array.extent(points, p => p[1]);
    const yScale = d3Scale.scaleLinear()
        .domain([yMin, yMax])
        .range([height, 0]);
    const xTicks = xScale.ticks();
    const xTickFormatter = getTickFormatter(xTicks[1] - xTicks[0]);
    plotArea.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3Axis.axisBottom(xScale).tickFormat(xTickFormatter));
    const yTicks = yScale.ticks();
    const yTickFormatter = getTickFormatter(yTicks[1] - yTicks[0]);
    plotArea.append("g")
        .call(d3Axis.axisLeft(yScale).tickFormat(yTickFormatter));
    plotArea.selectAll("circle")
        .data(points)
        .enter()
        .append("circle")
        .attr("cx", (p) => xScale(p[0]))
        .attr("cy", (p) => yScale(p[1]))
        .attr("r", 4)
        .attr("fill", "steelblue");
    return svg.node();
}
exports.scatterPlot = scatterPlot;
function getTickFormatter(intervalSize) {
    if (intervalSize > 1000000000) {
        return (numberValue) => Math.floor(numberValue.valueOf() / 1000000000) + "B";
    }
    if (intervalSize > 1000000) {
        return (numberValue) => Math.floor(numberValue.valueOf() / 1000000) + "M";
    }
    if (intervalSize > 1000) {
        return (numberValue) => Math.floor(numberValue.valueOf() / 1000) + "k";
    }
    return (numberValue) => numberValue.valueOf().toString();
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

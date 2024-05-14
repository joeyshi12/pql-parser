import * as d3Select from "d3-selection";
import * as d3Scale from "d3-scale";
import * as d3Array from "d3-array";
import * as d3Axis from "d3-axis";
import * as d3Shape from "d3-shape";
import { PlotConfig } from "./types";

export function barChart(points: [string, number][], config: PlotConfig): SVGSVGElement {
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
        .domain([Math.min(0, xMin!), xMax!])
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
        .tickFormat(label => truncateLabel(label, 15))

    plotArea.append("g")
        .call(xAxis)
        .call(g => g.selectAll(".tick line")
              .attr("color", "#ccc"));

    plotArea.selectAll("rect")
        .data(points)
        .enter()
        .append("rect")
        .attr("fill", (p: [string, number]) => p[1] > 0 ? "steelblue" : "orange")
        .attr("x", (p: [string, number]) => xScale(Math.min(p[1], 0)))
        .attr("y", (p: [string, number]) => yScale(p[0])!)
        .attr("width", (p: [string, number]) => Math.abs(xScale(p[1]) - xScale(0)))
        .attr("height", yScale.bandwidth())
        .attr("opacity", "0.7");

    plotArea.append("g")
        .attr("transform", `translate(${xScale(0)},0)`)
        .call(yAxis)
        .call(g => g.selectAll(".tick text")
              .filter((_, i) => points[i][1] < 0)
              .attr("text-anchor", "start")
              .attr("x", 6));

    return svg.node()!;
}

export function lineChart(points: [number, number][], config: PlotConfig): SVGSVGElement {
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
        .domain([xMin!, xMax!])
        .range([0, width]);

    const [yMin, yMax] = d3Array.extent(points, p => p[1]);
    const yScale = d3Scale.scaleLinear()
        .domain([yMin!, yMax!])
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

    const line: d3Shape.Line<[number, number]> = d3Shape.line<[number, number]>()
        .x(p => xScale(p[0]))
        .y(p => yScale(p[1]));

    plotArea.append("path")
        .datum(points)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line);

    return svg.node()!;
}

export function scatterPlot(points: [number, number][], config: PlotConfig): SVGSVGElement {
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
        .domain([xMin!, xMax!])
        .range([0, width]);

    const [yMin, yMax] = d3Array.extent(points, p => p[1]);
    const yScale = d3Scale.scaleLinear()
        .domain([yMin!, yMax!])
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
        .attr("cx", (p: [number, number]) => xScale(p[0]))
        .attr("cy", (p: [number, number]) => yScale(p[1]))
        .attr("r", 4)
        .attr("fill", "steelblue");

    return svg.node()!;
}

function getTickFormatter(intervalSize: number): (numberValue: d3Scale.NumberValue) => string {
    if (intervalSize > 1000000000) {
        return (numberValue: d3Scale.NumberValue) => Math.floor(numberValue.valueOf() / 1000000000) + "B";
    }
    if (intervalSize > 1000000) {
        return (numberValue: d3Scale.NumberValue) => Math.floor(numberValue.valueOf() / 1000000) + "M";
    }
    if (intervalSize > 1000) {
        return (numberValue: d3Scale.NumberValue) => Math.floor(numberValue.valueOf() / 1000) + "k";
    }
    return (numberValue: d3Scale.NumberValue) => numberValue.valueOf().toString();
}

function getShape(config: PlotConfig): [number, number] {
    const width = config.containerWidth - config.margin.left - config.margin.right;
    const height = config.containerHeight - config.margin.top - config.margin.bottom;
    return [width, height];
}

function truncateLabel(label: string, maxLength: number): string {
    if (label.length <= maxLength) {
        return label;
    }
    return label.substring(0, maxLength) + "…";
}

import * as d3Select from "d3-selection";
import * as d3Scale from "d3-scale";
import * as d3Array from "d3-array";
import * as d3Axis from "d3-axis";
import * as d3Shape from "d3-shape";
import { Point, PlotConfig } from "./types";

export function barChart(points: Point<number, string>[], config: PlotConfig): SVGSVGElement {
    const [width, height] = getShape(config);

    const svg = d3Select.create("svg")
        .attr("width", config.containerWidth)
        .attr("height", config.containerHeight);

    insertLabels(svg, config);

    const plotArea = svg.append("g")
        .attr("transform", `translate(${config.margin.left},${config.margin.top})`);

    const [xMin, xMax] = d3Array.extent(points, p => p.x);
    const xScale = d3Scale.scaleLinear()
        .domain([Math.min(0, xMin!), xMax!])
        .range([0, width]);

    const yScale = d3Scale.scaleBand()
        .domain(points.map(p => p.y))
        .range([height, 0])
        .paddingInner(0.1)
        .paddingOuter(0);

    const xAxis = d3Axis.axisTop(xScale)
        .tickSize(-height)
        .tickPadding(10)
        .tickSizeOuter(0)
        .tickFormat(unitFormat);

    const yAxis = d3Axis.axisLeft(yScale)
        .tickFormat(label => truncateLabel(label, 16))

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
        .attr("fill", (p: Point<number, string>) => p.x > 0 ? "steelblue" : "orange")
        .attr("x", (p: Point<number, string>) => xScale(Math.min(p.x, 0)))
        .attr("y", (p: Point<number, string>) => yScale(p.y)!)
        .attr("width", (p: Point<number, string>) => Math.abs(xScale(p.x) - xScale(0)))
        .attr("height", yScale.bandwidth())

    return svg.node()!;
}

export function lineChart(points: Point<number, number>[], config: PlotConfig): SVGSVGElement {
    const [width, height] = getShape(config);

    const svg = d3Select.create("svg")
        .attr("width", config.containerWidth)
        .attr("height", config.containerHeight);

    insertLabels(svg, config);

    const plotArea = svg.append("g")
        .attr("transform", `translate(${config.margin.left},${config.margin.top})`);

    const [xMin, xMax] = d3Array.extent(points, p => p.x);
    const xScale = d3Scale.scaleLinear()
        .domain([xMin!, xMax!])
        .range([0, width]);

    const [yMin, yMax] = d3Array.extent(points, p => p.y);
    const yScale = d3Scale.scaleLinear()
        .domain([yMin!, yMax!])
        .range([height, 0]);

    const line: d3Shape.Line<Point<number, number>> = d3Shape.line<Point<number, number>>()
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
        .call(d3Axis.axisBottom(xScale).tickFormat(unitFormat));

    plotArea.append("g")
        .call(d3Axis.axisLeft(yScale).tickFormat(unitFormat));

    return svg.node()!;
}

export function scatterPlot(points: Point<number, number>[], config: PlotConfig): SVGSVGElement {
    const [width, height] = getShape(config);

    const svg = d3Select.create("svg")
        .attr("width", config.containerWidth)
        .attr("height", config.containerHeight);

    insertLabels(svg, config);

    const plotArea = svg.append("g")
        .attr("transform", `translate(${config.margin.left},${config.margin.top})`);

    const [xMin, xMax] = d3Array.extent(points, p => p.x);
    const xScale = d3Scale.scaleLinear()
        .domain([xMin!, xMax!])
        .range([0, width]);

    const [yMin, yMax] = d3Array.extent(points, p => p.y);
    const yScale = d3Scale.scaleLinear()
        .domain([yMin!, yMax!])
        .range([height, 0]);

    plotArea.selectAll("circle")
        .data(points)
        .enter()
        .append("circle")
        .attr("cx", (p: any) => xScale(p.x))
        .attr("cy", (p: any) => yScale(p.y))
        .attr("r", 4)
        .attr("fill", "steelblue");

    plotArea.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3Axis.axisBottom(xScale).tickFormat(unitFormat));

    plotArea.append("g")
        .call(d3Axis.axisLeft(yScale).tickFormat(unitFormat));

    return svg.node()!;
}

function unitFormat(numberValue: d3Scale.NumberValue): string {
    const value: number = numberValue.valueOf();
    if (value > 1000000000) {
        return Math.floor(value / 1000000000) + "B";
    }
    if (value > 1000000) {
        return Math.floor(value / 1000000) + "M";
    }
    if (value > 1000) {
        return Math.floor(value / 1000) + "k";
    }
    return value.toString();
}

function insertLabels(svg: d3Select.Selection<SVGSVGElement, undefined, null, undefined>, config: PlotConfig) {
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

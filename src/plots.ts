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

    if (config.xLabel) {
        svg.append("text")
            .attr("transform", `translate(${config.containerWidth / 2}, ${config.containerHeight - 10})`)
            .text(config.xLabel);
    }

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

    const xAxis = d3Axis.axisBottom(xScale)
        .tickSize(-width - 10)
        .tickPadding(10)
        .tickSizeOuter(0);

    const yAxis = d3Axis.axisLeft(yScale)
        .tickFormat(label => {
            if (label.length <= 16) {
                return label;
            } else {
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
        .attr("y", (p: Point<number, string>) => yScale(p.y)!)
        .attr("width", (p: Point<number, string>) => p.x)
        .attr("height", yScale.bandwidth())

    return svg.node()!;
}

export function lineChart(points: Point<number, number>[], config: PlotConfig): SVGSVGElement {
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
        .call(d3Axis.axisBottom(xScale));

    plotArea.append("g")
        .call(d3Axis.axisLeft(yScale));

    return svg.node()!;
}

export function scatterPlot(points: Point<number, number>[], config: PlotConfig): SVGSVGElement {
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
        .call(d3Axis.axisBottom(xScale));

    plotArea.append("g")
        .call(d3Axis.axisLeft(yScale));

    return svg.node()!;
}

function getShape(config: PlotConfig): [number, number] {
    const width = config.containerWidth - config.margin.left - config.margin.right;
    const height = config.containerHeight - config.margin.top - config.margin.bottom;
    return [width, height];
}

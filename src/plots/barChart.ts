import * as d3 from "d3";
import { ColumnData, PlotConfig } from "../types";

export function barChart(x: ColumnData<number>, y: ColumnData<string>, config: PlotConfig): SVGSVGElement {
    const [width, height] = getShape(config);
    const svg = d3.create("svg")
        .attr("width", config.containerWidth)
        .attr("height", config.containerHeight);

    svg.append("text")
        .attr("transform", `translate(${config.containerWidth / 2}, ${config.containerHeight - 10})`)
        .text(x.name);

    const plotArea = svg.append("g")
        .attr("transform", `translate(${config.margin.left},${config.margin.top})`);

    const [xMin, xMax] = d3.extent(x.values);
    const xScale = d3.scaleLinear()
        .domain([Math.min(0, xMin!), xMax!])
        .range([0, width]);

    const yScale = d3.scaleBand()
        .domain(y.values)
        .range([height, 0])
        .paddingInner(0.1)
        .paddingOuter(0);

    const xAxis = d3.axisBottom(xScale)
        .tickSize(-width - 10)
        .tickPadding(10)
        .tickSizeOuter(0);

    const yAxis = d3.axisLeft(yScale)
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

    const data = x.values.map((num, i) => [num, y.values[i]]);
    plotArea.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("fill", "steelblue")
        .attr("x", 0)
        .attr("y", row => row[1])
        .attr("width", row => row[0])
        .attr("height", yScale.bandwidth())

    return svg.node()!;
}

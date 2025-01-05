import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

interface CandleChartProps {
  data: StockChartData[];
}

export interface StockChartData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

const CandleChart: React.FC<CandleChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // SVG 설정
    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 400;

    svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("background", "#f9f9f9")
      .style("border", "1px solid #ccc");

    // 날짜 파싱
    const parseDate = d3.timeParse("%Y-%m-%d");
    const formattedData = data.map((d) => ({
      ...d,
      date: parseDate(d.date) as Date,
    }));

    // X, Y 스케일 설정
    const xScale = d3
      .scaleBand<Date>()
      .domain(formattedData.map((d) => d.date))
      .range([0, width])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(formattedData, (d) => d.low)! - 10,
        d3.max(formattedData, (d) => d.high)! + 10,
      ])
      .range([height, 0]);

    // X, Y 축 그리기
    svg.selectAll(".x-axis").remove();
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y-%m-%d") as any));

    svg.selectAll(".y-axis").remove();
    svg.append("g").attr("class", "y-axis").call(d3.axisLeft(yScale));

    // 캔들 차트 그리기
    svg.selectAll(".candle").remove();
    svg
      .selectAll(".candle")
      .data(formattedData)
      .enter()
      .append("rect")
      .attr("class", "candle")
      .attr("x", (d) => xScale(d.date)!)
      .attr("y", (d) => yScale(Math.max(d.open, d.close)))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => Math.abs(yScale(d.open) - yScale(d.close)))
      .attr("fill", (d) => (d.open > d.close ? "#d32f2f" : "#2e7d32"));

    // 고가/저가 선 그리기
    svg.selectAll(".stem").remove();
    svg
      .selectAll(".stem")
      .data(formattedData)
      .enter()
      .append("line")
      .attr("class", "stem")
      .attr("x1", (d) => xScale(d.date)! + xScale.bandwidth() / 2)
      .attr("x2", (d) => xScale(d.date)! + xScale.bandwidth() / 2)
      .attr("y1", (d) => yScale(d.high))
      .attr("y2", (d) => yScale(d.low))
      .attr("stroke", "#555");
  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default CandleChart;

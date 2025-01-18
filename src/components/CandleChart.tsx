import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

interface CandleChartProps {
  data: StockChartData[];
}

export interface StockChartData {
  date: string;
  open: string;
  high: string;
  low: string;
  close: string;
}

const CandleChart: React.FC<CandleChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !tooltipRef.current) return;

    // 차트 크기와 여백 설정
    const margin = { top: 20, right: 30, bottom: 50, left: 70 };
    const width = 800 - 2 * margin.left - 2 * margin.right;
    const height = 400;

    // SVG 설정
    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.bottom + margin.top);

    // 차트 그룹 추가 (마진 적용)
    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // 날짜 파싱 함수
    const parseDate = d3.timeParse("%Y%m%d%H%M%S");

    // 데이터 변환
    const formattedData = data.map((d) => ({
      date: parseDate(d.date) as Date,
      open: parseFloat(d.open),
      close: parseFloat(d.close),
      high: parseFloat(d.high),
      low: parseFloat(d.low),
    }));

    // X, Y 스케일 설정
    const xScale = d3
      .scaleBand<Date>()
      .domain(formattedData.map((d) => d.date))
      .range([0, width * 2]) // 스크롤을 위해 X축 범위를 넓게 설정
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(formattedData, (d) => d.low)! * 0.99, // 최저값에 5% 여유 추가
        d3.max(formattedData, (d) => d.high)! * 1.01, // 최고값에 5% 여유 추가
      ])
      .range([height, 0]);

    // ✅ Y축 고정
    svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .call(d3.axisLeft(yScale));

    // ✅ X축 그리기 (Tick 간격 조정)
    const xAxis = chart
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickValues(
            formattedData
              .map((d, i) => (i % 10 === 0 ? d.date : null)) // 10개마다 하나씩 표시
              .filter((d) => d !== null) as Date[]
          )
          .tickFormat(d3.timeFormat("%Y-%m-%d %H:%M:%S") as any)
      );

    // ✅ X축 텍스트 스타일 조정
    xAxis
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "12px");

    // 캔들 차트 그리기
    chart
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
    chart
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

    // ✅ Zoom & Pan 기능 추가
    const zoom: any = d3
      .zoom()
      .scaleExtent([1, 1]) // 확대/축소 비활성화
      .translateExtent([
        [0, 0],
        [width * 2, height + margin.bottom + margin.top],
      ])
      .on("zoom", (event) => {
        chart.attr("transform", event.transform);
      });

    // ✅ 차트 로드 시 기본 위치를 맨 오른쪽으로 이동
    const initialTransform = d3.zoomIdentity.translate(
      -xScale.step() * (formattedData.length - width / xScale.step()) +
        margin.left +
        margin.right,
      0
    );
    svg.call(zoom.transform, initialTransform);

    svg.call(zoom);
  }, [data]);

  return (
    <div style={{ position: "relative" }}>
      <svg ref={svgRef}></svg>
      <div ref={tooltipRef} style={tooltipStyle}></div>
    </div>
  );
};

const tooltipStyle: React.CSSProperties = {
  position: "absolute",
  backgroundColor: "#fff",
  border: "1px solid #ccc",
  borderRadius: "4px",
  padding: "8px",
  display: "none",
  pointerEvents: "none",
  fontSize: "12px",
  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
};

export default CandleChart;

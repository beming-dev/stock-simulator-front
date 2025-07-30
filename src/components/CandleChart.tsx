import React, { useMemo } from "react";
import ReactApexChart from "react-apexcharts";

export interface StockChartData {
  date: string; // 예: "20240425153000"
  open: string;
  high: string;
  low: string;
  close: string;
}

interface CandleChartProps {
  data: StockChartData[];
}

const CandleChart: React.FC<CandleChartProps> = React.memo(({ data }) => {
  // 차트 데이터 메모이제이션으로 성능 최적화
  const series = useMemo(
    () => [
      {
        data: data.map((d) => ({
          x: parseApexDate(d.date),
          y: [
            parseFloat(d.open),
            parseFloat(d.high),
            parseFloat(d.low),
            parseFloat(d.close),
          ],
        })),
      },
    ],
    [data]
  );

  const options: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: "candlestick",
        height: 400,
        toolbar: { show: true },
        zoom: { enabled: true },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 300,
          animateGradually: {
            enabled: true,
            delay: 150,
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350,
          },
        },
      },
      xaxis: {
        type: "datetime",
        labels: { datetimeUTC: false },
      },
      yaxis: {
        tooltip: { enabled: true },
        decimalsInFloat: 2,
      },
      tooltip: {
        enabled: true,
        shared: true,
        x: { format: "yyyy-MM-dd HH:mm" },
      },
      grid: { show: true },
    }),
    []
  );

  return (
    <div style={{ width: "100%", minHeight: 400 }}>
      <ReactApexChart
        options={options}
        series={series}
        type="candlestick"
        height={400}
      />
    </div>
  );
});

CandleChart.displayName = "CandleChart";

// 날짜 문자열을 JS Date 객체로 변환 (ApexCharts용)
function parseApexDate(dateStr: string): number {
  // 예: "20240425153000" → 2024-04-25T15:30:00
  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  const hour = dateStr.slice(8, 10);
  const min = dateStr.slice(10, 12);
  const sec = dateStr.slice(12, 14);
  return new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}`).getTime();
}

export default CandleChart;

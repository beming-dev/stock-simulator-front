import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// 필요한 스케일 및 플러그인 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const StockChart: React.FC = () => {
  const chartData = {
    labels: ["9:00", "10:00", "11:00", "12:00", "1:00", "2:00"],
    datasets: [
      {
        label: "Stock Price",
        data: [150, 151, 152, 149, 150, 151],
        borderColor: "rgba(59, 130, 246, 1)", // Tailwind Blue
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
    },
  };

  return (
    <div className="h-64 flex items-center">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default StockChart;

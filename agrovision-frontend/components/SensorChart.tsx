"use client";

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
);

export default function SensorChart({ data }: any) {
  const chartData = {
    labels: data.map((item: any) =>
      new Date(item.createdAt).toLocaleTimeString()
    ),
    datasets: [
      {
        label: "Sensor Data",
        data: data.map((item: any) => item.value),
      },
    ],
  };

  return <Line data={chartData} />;
}

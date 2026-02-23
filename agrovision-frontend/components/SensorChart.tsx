'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface Sensor {
  _id: string;
  type: string;
  value: number;
  unit: string;
  createdAt: string;
}

interface Props {
  sensors: Sensor[];
  /** Cuántas lecturas mostrar por tipo. Default: 30 */
  limit?: number;
  /** Altura del contenedor. Default: 280 */
  height?: number;
}

export default function SensorChart({ sensors, limit = 30, height = 280 }: Props) {
  // La API devuelve más reciente primero → tomar los últimos `limit` y revertir
  // para mostrar evolución de izquierda (antiguo) → derecha (reciente)
  const temps = sensors
    .filter((s) => s.type === 'temperature')
    .slice(0, limit)
    .reverse();

  const hums = sensors
    .filter((s) => s.type === 'humidity')
    .slice(0, limit)
    .reverse();

  const labels = temps.map((s) =>
    new Date(s.createdAt).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Temperatura (°C)',
        data: temps.map((s) => s.value),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245,158,11,0.07)',
        fill: true,
        tension: 0.4,
        pointRadius: temps.length > 20 ? 2 : 3,
        pointHoverRadius: 5,
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: 'transparent',
        borderWidth: 2,
        yAxisID: 'yTemp',
      },
      {
        label: 'Humedad (%)',
        data: hums.map((s) => s.value),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.07)',
        fill: true,
        tension: 0.4,
        pointRadius: hums.length > 20 ? 2 : 3,
        pointHoverRadius: 5,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: 'transparent',
        borderWidth: 2,
        yAxisID: 'yHum',
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    animation: { duration: 300 },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: '#94a3b8',
          font: { size: 12 },
          boxWidth: 10,
          boxHeight: 10,
          borderRadius: 3,
          useBorderRadius: true,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: '#0f0f0f',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label: (ctx) => {
            const unit = ctx.datasetIndex === 0 ? '°C' : '%';
            const val = ctx.parsed.y != null ? ctx.parsed.y.toFixed(1) : '—';
            return `  ${ctx.dataset.label?.split(' ')[0]}: ${val}${unit}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        border: { color: 'transparent' },
        ticks: {
          color: '#475569',
          font: { size: 11 },
          maxTicksLimit: 8,
          maxRotation: 0,
        },
      },
      yTemp: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'Temp °C', color: '#f59e0b', font: { size: 11 } },
        grid: { color: 'rgba(255,255,255,0.04)' },
        border: { color: 'transparent' },
        ticks: {
          color: '#f59e0b',
          font: { size: 11 },
          callback: (v) => `${v}°`,
        },
      },
      yHum: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: 'Humedad %', color: '#3b82f6', font: { size: 11 } },
        grid: { drawOnChartArea: false },
        border: { color: 'transparent' },
        ticks: {
          color: '#3b82f6',
          font: { size: 11 },
          callback: (v) => `${v}%`,
        },
      },
    },
  };

  if (temps.length === 0 && hums.length === 0) {
    return (
      <div style={{
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#475569',
        gap: '8px',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        <span style={{ fontSize: '13px' }}>Esperando datos del simulador...</span>
      </div>
    );
  }

  return (
    <div style={{ height, position: 'relative' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

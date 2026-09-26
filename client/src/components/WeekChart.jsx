import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function WeekChart({ weekChart }) {
  if (!weekChart) {
    return <p className="text-slate-400 text-sm">No data yet</p>;
  }

  const data = {
    labels: weekChart.labels,
    datasets: [
      {
        label: weekChart.datasets[0].label,
        data: weekChart.datasets[0].data,
        backgroundColor: weekChart.user1Color || '#22c55e',
        borderRadius: 6,
      },
      {
        label: weekChart.datasets[1].label,
        data: weekChart.datasets[1].data,
        backgroundColor: weekChart.user2Color || '#3b82f6',
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 12, padding: 16, font: { size: 12 } },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, font: { size: 11 } },
        grid: { color: '#f1f5f9' },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  };

  return (
    <div className="h-48">
      <Bar data={data} options={options} />
    </div>
  );
}

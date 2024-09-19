import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register necessary components from Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

export const HolderDistributionChart = ({ distributionData }) => {
  const data = {
    labels: Object.keys(distributionData), // Address of the holders
    datasets: [
      {
        label: "Holder Percentage",
        data: Object.values(distributionData).map(
          (holder) => holder.percentage
        ),
        backgroundColor: [
          "rgba(59, 130, 246, 1)", // Fully opaque (brightest)
          "rgba(59, 130, 246, 0.95)",
          "rgba(59, 130, 246, 0.9)",
          "rgba(59, 130, 246, 0.85)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(59, 130, 246, 0.75)",
          "rgba(59, 130, 246, 0.7)",
          "rgba(59, 130, 246, 0.65)",
          "rgba(59, 130, 246, 0.6)", // Medium brightness
          "rgba(59, 130, 246, 0.55)",
          "rgba(59, 130, 246, 0.5)",
          "rgba(59, 130, 246, 0.45)", // Lightest
        ],
        hoverBackgroundColor: [
          "rgba(59, 130, 246, 1)", // Fully opaque (brightest)
          "rgba(59, 130, 246, 0.95)",
          "rgba(59, 130, 246, 0.9)",
          "rgba(59, 130, 246, 0.85)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(59, 130, 246, 0.75)",
          "rgba(59, 130, 246, 0.7)",
          "rgba(59, 130, 246, 0.65)",
          "rgba(59, 130, 246, 0.6)", // Medium brightness
          "rgba(59, 130, 246, 0.55)",
          "rgba(59, 130, 246, 0.5)",
          "rgba(59, 130, 246, 0.45)", // Lightest
        ],
        borderColor: ["#e6e6e6"],
        borderWidth: 2, // Thin border for visibility
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "hidden",
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.label}: ${tooltipItem.raw.toFixed(2)}%`;
          },
        },
      },
    },
  };

  return <Pie data={data} options={options} />;
};

export const chartOptions = {
  responsive: true,
  scales: {
    y: {
      beginAtZero: true,
      max: 10,
      ticks: {
        stepSize: 2,
        color: "black",
      },
      grid: {
        display: true,
        color: "rgba(0,0,0,0.3)",
      },
      border: {
        width: 2,
        color: "black",
      },
    },
    x: {
      grid: {
        display: false,
      },
      border: {
        width: 2,
        color: "black",
      },
      ticks: {
        color: "black",
      },
    },
  },
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: false,
      text: "レポート推移",
    },
  },
  elements: {
    point: {
      radius: 4,
    },
    line: {
      borderWidth: 2,
    },
  },
  layout: {
    padding: {
      left: 10,
    },
  },
};

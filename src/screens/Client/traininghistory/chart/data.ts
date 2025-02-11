import { formatDateTime } from "../../../utils.client";
import UserReport from "../user/report";

export const prepareChartData = (reports: UserReport[]) => {
  const sortedReports = reports.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const labels = [
    "",
    ...sortedReports.map((report) => {
      const date = new Date(report.createdAt);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
  ];

  const physicalData = [
    null,
    ...sortedReports.map((report) => report.data[0].physical),
  ];
  const emotionalData = [
    null,
    ...sortedReports.map((report) => report.data[0].emotional),
  ];

  return {
    labels,
    datasets: [
      {
        label: "身体面",
        data: physicalData,
        borderColor: "rgb(0, 0, 255)",
        backgroundColor: "rgba(0, 0, 255, 0.5)",
        tension: 0.1,
      },
      {
        label: "精神面",
        data: emotionalData,
        borderColor: "rgb(255, 165, 0)",
        backgroundColor: "rgba(255, 165, 0, 0.5)",
        tension: 0.1,
      },
    ],
  };
};

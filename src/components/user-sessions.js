const seriesTitles = [
  "00:00",
  "01:00",
  "03:00",
  "04:00",
  "05:00",
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];

const series1 = {
  style: { line: "green" },
  title: "/favorites",
  x: seriesTitles,
  y: [5, 1, 7, 5, 5, 1, 7, 5, 5, 1, 7, 5, 5, 1, 7, 5],
};
const series2 = {
  style: { line: "blue" },
  title: "/account",
  x: seriesTitles,
  y: [2, 1, 4, 8, 2, 1, 4, 8, 2, 1, 4, 8, 2, 1, 4, 8],
};

module.exports = {
  style: { line: "yellow", text: "green", baseline: "black" },
  xLabelPadding: 3,
  xPadding: 10,
  showLegend: true,
  wholeNumbersOnly: false,
  label: "Dynamic requests",
  data: [series1, series2],
};


module.exports = {

  data: {
    requestCount: {
      style: { line: "green" },
      title: "Requests",
      x: [],
      y: [],
    },
    responseTime: {
      style: { line: "blue" },
      title: "Response Time",
      x: [],
      y: [],
    },
    errors: {
      style: { line: "red" },
      title: "Failed requests",
      x: [],
      y: [],
    }
  },

  config: {
    style: { text: "green", baseline: "black" },
    xLabelPadding: 3,
    xPadding: 10,
    showLegend: true,
    legend: { width: 20 },
    wholeNumbersOnly: false,
    label: "Dynamic requests",
  }
};

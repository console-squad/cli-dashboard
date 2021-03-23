chalk = require("chalk");
module.exports = {
  requests: {
    markdown: "Requests   `0/min`",
    style: {
      fg: "green",
    },
  },
  responseTime: {
    markdown: "Response time   `0 ms`",
    style: {
      fg: "blue",
    },
  },
  failed: {
    markdown: "Failed requests   `0%`",
    style: {
      fg: "red",
    },
  },
};

const blessed = require("blessed");
const contrib = require("blessed-contrib");
const screen = blessed.screen({ smartCSR: true });
const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });
const dotenv = require("dotenv");
dotenv.config();
const titleConfig = require("./components/title.js");
const timeFrameConfig = require("./components/time-frame.js");
const timeFrameBoxConfig = require("./components/time-frame-box.js");
const mgmtZoneFilter = require("./components/management-zone-filter.js");
const logoConfig = require("./components/logo.js");
const mapConfig = require("./components/map.js");
const httpMonitorConfig = require("./components/http-monitor.js");
const syntheticMonitorConfig = require("./components/synthetic-monitor.js");
const dynamicRequestsConfig = require("./components/dynamic-requests.js");
const dynamicRequestsWidgetsConfig = require("./components/dynamic-requests-widgets.js");
const networkMetricsConfig = require("./components/network-metrics.js");
const requestsTableConfig = require("./components/requests-table.js");
const activeUsersConfig = require("./components/active-users.js");
const apdexConfig = require("./components/apdex.js");
const { DYNAMIC_REQUEST_METRICS } = require("./services/entity-mapping.js");
const metricsService = require("./services/metrics.service.js");
const moment = require("moment");

// Terminal title
screen.title = "ci360 Health Dashboard";

// Components
const title = grid.set(0, 0, 1, 2, contrib.markdown, titleConfig);
const timeFrame = grid.set(0.3, 2, 0.8, 1, contrib.markdown, timeFrameConfig);
const mgmtZone = grid.set(0.3, 3, 0.8, 1, contrib.markdown, mgmtZoneFilter);
const logo = grid.set(0, 11, 1, 1, contrib.picture, { ...logoConfig, onReady: ready });
const map = grid.set(1, 0, 4, 4, contrib.map, mapConfig);
const activeUsers = grid.set(4, 0, 1, 1, contrib.lcd, activeUsersConfig);
const httpMonitorDonut = grid.set(1, 4, 2, 1, contrib.donut, httpMonitorConfig.donut);
const httpMonitorBar = grid.set(1, 5, 2, 7, contrib.bar, httpMonitorConfig.bar);
const syntheticMonitorDonut = grid.set(3, 4, 2, 1, contrib.donut, syntheticMonitorConfig.donut);
const syntheticMonitorBar = grid.set(3, 5, 2, 7, contrib.bar, syntheticMonitorConfig.bar);
const dynamicRequestsLine = grid.set(5, 0, 7, 10, contrib.line, dynamicRequestsConfig.config);

const dynamicRequestWidgets = {};
dynamicRequestWidgets.requestCount = grid.set(5, 10, 0.5, 2, contrib.markdown, dynamicRequestsWidgetsConfig.requests);
dynamicRequestWidgets.responseTime = grid.set(5.5, 10, 0.5, 2, contrib.markdown, dynamicRequestsWidgetsConfig.responseTime);
dynamicRequestWidgets.errors = grid.set(5.9, 10, 0.5, 2, contrib.markdown, dynamicRequestsWidgetsConfig.failed);
const networkMetrics = grid.set(10, 10, 2, 2, contrib.sparkline, networkMetricsConfig);
const apdex = grid.set(9, 10, 1, 2, contrib.gauge, apdexConfig);
const requests = grid.set(6.5, 10, 2.5, 2, contrib.table, requestsTableConfig);

// Time range box
var timeRangeBox = blessed.box({ ...timeFrameBoxConfig, parent: screen });
timeRangeBox.hide();
screen.render();
var timeRangeBoxSelections = [
  { label: "Last 1 hour", value: 1, format: "HH:mm" },
  { label: "Last 6 hours", value: 6, format: "HH:mm" },
  { label: "Last 24 hours", value: 24, format: "HH:mm" },
  { label: "Last 72 hours", value: 72, format: "M/D/YY" },
];

var selectedIndex = 1;
timeRangeBox.key("right", function () {
  if (selectedIndex == timeRangeBoxSelections.length - 1) {
    selectedIndex = 0;
  } else {
    selectedIndex++;
  }
  timeRangeBox.content = "\n\n\n{center}{bold}← " + timeRangeBoxSelections[selectedIndex].label + " → {/}";
  timeFrame.setMarkdown("## Time frame\n`" + "▼ " + timeRangeBoxSelections[selectedIndex].label + "`");
  screen.render();
});
timeRangeBox.key("left", function () {
  if (selectedIndex == 0) {
    selectedIndex = timeRangeBoxSelections.length - 1;
  } else {
    selectedIndex--;
  }
  timeRangeBox.content = "\n\n\n{center}{bold}← " + timeRangeBoxSelections[selectedIndex].label + " → {/}";
  timeFrame.setMarkdown("## Time frame\n`" + "▼ " + timeRangeBoxSelections[selectedIndex].label + "`");
  screen.render();
});
timeRangeBox.key("escape", function () {
  timeRangeBox.hide();
  screen.render();
});
timeFrame.on("click", function () {
  timeRangeBox.show();
  screen.render();
  timeRangeBox.focus();
});

let dynamicRequestMetrics = Object.keys(DYNAMIC_REQUEST_METRICS);

// User sessions - line
setInterval(async () => {
  const chartDateFormat = timeRangeBoxSelections[selectedIndex].format;
  const current = dynamicRequestMetrics[0];
  dynamicRequestMetrics = dynamicRequestMetrics.slice(1);
  dynamicRequestMetrics.push(current);

  const to = moment.utc().valueOf();
  const from = moment(to).subtract(timeRangeBoxSelections[selectedIndex].value, "hour").valueOf();

  // Dynamic requests
  metricsService.getDynamicRequestMetrics("ci360-bff", current, from, to, chartDateFormat).then((data) => {
    dynamicRequestsLine.setData({
      style: dynamicRequestsConfig.data[current].style,
      title: dynamicRequestsConfig.data[current].title,
      ...data,
    });

    const sum = Math.ceil(data.y.reduce((cur, prev) => cur + prev, 0));
    const avg = Math.ceil(data.y.reduce((a, b) => a + b) / data.y.length);

    const markdown = {
      requestCount: {
        markdown: `Requests   \`${sum}/min\``,
        style: {
          fg: "green",
        },
      },
      responseTime: {
        markdown: `Response time   \`${avg} ms\``,
        style: {
          fg: "blue",
        },
      },
      errors: {
        markdown: `Failed requests   \`${sum}%\``,
        style: {
          fg: "red",
        },
      },
    };

    dynamicRequestWidgets[current].setMarkdown(markdown[current].markdown);

    dynamicRequestsLine.screen.render();
  });

  // http monitor
  metricsService.getHttpMonitorMetrics(from, to, chartDateFormat).then((data) => {
    httpMonitorDonut.setData([{ label: "Availability", percent: data.average, color: "green" }]);
    httpMonitorBar.setData({
      titles: sampleDates(data.x, 16),
      data: reduceGranularity(data.y, 16),
    });
    httpMonitorBar.screen.render();
  });

  // synthetic monitor
  metricsService.getSyntheticMonitorMetrics(from, to, chartDateFormat).then((data) => {
    syntheticMonitorDonut.setData([{ label: "Availability", percent: data.average, color: "blue" }]);
    syntheticMonitorBar.setData({
      titles: sampleDates(data.x, 16),
      data: reduceGranularity(data.y, 16),
    });
    httpMonitorBar.screen.render();
  });

  // apdex
  metricsService.getApdexMetrics(from, to, chartDateFormat).then((data) => {
    const truthy = data.filter((d) => !!d);
    const length = truthy.length;
    const green = truthy.filter((d) => d >= 0.85);
    const yellow = truthy.filter((d) => d >= 0.7 && d < 0.85);
    const red = truthy.filter((d) => d < 0.7);

    apdex.setData([
      { percent: Math.floor((green.length / length) * 100), stroke: "green" },
      { percent: Math.floor((yellow.length / length) * 100), stroke: "yellow" },
      { percent: Math.floor((red.length / length) * 100), stroke: "red" },
    ]);

    apdex.screen.render();
  });

  // active users
  metricsService.getActiveUsers(from, to, chartDateFormat).then((data) => {
    activeUsers.setData(data);
    activeUsers.screen.render();
  });
}, process.env.RESOLUTION_INTERVAL);

// Kill all
screen.key(["q", "C-c"], function (ch, key) {
  return process.exit(0);
});

function reduceGranularity(arr, num) {
  const filtered = arr.filter((a) => !!a);
  const chunkSize = filtered.length / num;

  var sets = [],
    chunks,
    i = 0;
  chunks = Math.ceil(filtered.length / chunkSize);

  while (i < chunks) {
    sets[i] = filtered.splice(0, chunkSize);
    i++;
  }
  return sets.map((s) => {
    return Math.floor(s.reduce((a, b) => a + b) / s.length);
  });
}

function sampleDates(arr, num) {
  const filtered = arr.filter((a) => !!a);
  const chunkSize = filtered.length / num;

  var sets = [],
    chunks,
    i = 0;
  chunks = Math.ceil(filtered.length / chunkSize);

  while (i < chunks) {
    sets[i] = filtered.splice(0, chunkSize);
    i++;
  }
  return sets.map((s) => {
    return s[Math.floor(chunkSize / 2)];
  });
}

// Render screen
function ready() {
  screen.render();
}
ready();

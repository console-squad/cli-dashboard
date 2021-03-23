const blessed = require("blessed");
const contrib = require("blessed-contrib");
const screen = blessed.screen({ smartCSR: true });
const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });
const metricsService = require("./services/metrics.service.js");
const countrySelectConfig = require("./components/country-select.js");
const logoConfig = require("./components/logo.js");

// Terminal title
screen.title = "COVID-19 analysis";

const title = grid.set(0, 0, 1, 2, contrib.markdown, {
  markdown: "# COVID-19 analysis\n" + "View trending data around the COVID-19 pandemic.\n\n" + "Owners: Arnaud, Jose, Todd, Nick",
});
const select = grid.set(0.3, 2, 0.8, 1, contrib.markdown, {
  markdown: "## Selected country\n" + "`▼ US`\n",
});
const logo = grid.set(0, 11, 1, 1, contrib.picture, { ...logoConfig, onReady: ready });

const line1 = grid.set(1, 0, 3.6, 12, contrib.line, {
  style: { text: "green", baseline: "black" },
  xLabelPadding: 3,
  xPadding: 10,
  showLegend: true,
  legend: { width: 30 },
  wholeNumbersOnly: false,
  label: "COVID-19 cumulative cases/recoveries",
  data: metricsService.getCovidAnalysis("US"),
});

const trialsLine = grid.set(4.6, 0, 3.6, 12, contrib.line, {
  style: { text: "yellow", baseline: "black" },
  xLabelPadding: 3,
  xPadding: 10,
  showLegend: true,
  legend: { width: 30 },
  wholeNumbersOnly: false,
  label: "COVID-19 trial creation",
  data: metricsService.getCovidTrialAccountCreations("US"),
});

const activeAccountLine = grid.set(8.2, 0, 3.6, 12, contrib.line, {
  style: { text: "cyan", baseline: "black" },
  xLabelPadding: 3,
  xPadding: 10,
  showLegend: true,
  legend: { width: 30 },
  wholeNumbersOnly: false,
  label: "COVID-19 active accounts user views and sessions",
  data: metricsService.getCovidActiveAccount("US"),
});

var countryConfig = blessed.box({ ...countrySelectConfig, parent: screen });
countryConfig.hide();
screen.render();
var countrySelections = ["US", "United Kingdom", "Spain", "France", "Poland", "Austria", "Australia"];
var selectedIndex = 0;
countryConfig.key("right", function () {
  if (selectedIndex == countrySelections.length - 1) {
    selectedIndex = 0;
  } else {
    selectedIndex++;
  }
  countryConfig.content = "\n\n\n{center}{bold}← " + countrySelections[selectedIndex] + " → {/}";
  select.setMarkdown("## Selected country\n`" + "▼ " + countrySelections[selectedIndex] + "`");
  updateData(selectedIndex);
  screen.render();
});
countryConfig.key("left", function () {
  if (selectedIndex == 0) {
    selectedIndex = countrySelections.length - 1;
  } else {
    selectedIndex--;
  }
  countryConfig.content = "\n\n\n{center}{bold}← " + countrySelections[selectedIndex] + " → {/}";
  select.setMarkdown("## Selected country\n`" + "▼ " + countrySelections[selectedIndex] + "`");
  updateData(selectedIndex);
  screen.render();
});
countryConfig.key("escape", function () {
  countryConfig.hide();
  screen.render();
});
select.on("click", function () {
  countryConfig.show();
  screen.render();
  countryConfig.focus();
});

screen.render();

// Kill all
screen.key(["q", "C-c"], function (ch, key) {
  return process.exit(0);
});

function updateData(index) {
  line1.setData(metricsService.getCovidAnalysis(countrySelections[index]));
  trialsLine.setData(metricsService.getCovidTrialAccountCreations(countrySelections[index]));
  activeAccountLine.setData(metricsService.getCovidActiveAccount(countrySelections[index]));
}
function ready() {
  screen.render();
}

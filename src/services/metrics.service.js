const { DYNAMIC_REQUEST_METRICS, SERVICES } = require("./entity-mapping.js");
const axios = require("axios");
const covidAnalysis = require("./db/covid-analysis.json");
const trialAnalysis = require("./db/covid-trials.json");
const activeAccountAnalysis = require("./db/covid-active.json");
const moment = require("moment");

module.exports = {
  getApdexMetrics: (from, to, chartDateFormat) => {
    return axios
      .get("/api/v2/metrics/query", {
        baseURL: process.env.API_BASE_URL,
        headers: { Authorization: `Api-token ${process.env.API_TOKEN}` },
        params: {
          entitySelector: `entityId("APPLICATION-6D794877E82BD376"),type("APPLICATION")`,
          metricSelector: "builtin:apps.web.apdex.userType",
          from,
          to,
        },
      })
      .then((response) => {
        return response.data.result[0].data[0].values.filter((v) => !!v);
      })
      .catch((error) => {
        console.log(error);
      });
  },
  getHttpMonitorMetrics: (from, to, chartDateFormat) => {
    return axios
      .get("/api/v2/metrics/query", {
        baseURL: process.env.API_BASE_URL,
        headers: { Authorization: `Api-token ${process.env.API_TOKEN}` },
        params: {
          entitySelector: `entityId("HTTP_CHECK-42221D97AA8A4343"),type("HTTP_CHECK")`,
          metricSelector: "builtin:synthetic.http.availability.location.total",
          from,
          to,
        },
      })
      .then((response) => {
        const values = response.data.result[0].data[0].values;
        return {
          x: response.data.result[0].data[0].timestamps.map((t) => moment(t).format(chartDateFormat)),
          y: values.slice(0, 16),
          average: values.reduce((p, c, _, a) => p + c / a.length, 0),
        };
      })
      .catch((error) => {
        console.log(error);
      });
  },
  getSyntheticMonitorMetrics: (from, to, chartDateFormat) => {
    return axios
      .get("/api/v2/metrics/query", {
        baseURL: process.env.API_BASE_URL,
        headers: { Authorization: `Api-token ${process.env.API_TOKEN}` },
        params: {
          entitySelector: `entityId("SYNTHETIC_TEST-1B29B195C6C5D757"),type("SYNTHETIC_TEST")`,
          metricSelector: "builtin:synthetic.browser.availability.location.total",
          from,
          to,
        },
      })
      .then((response) => {
        const values = response.data.result[0].data[0].values;
        return {
          x: response.data.result[0].data[0].timestamps.map((t) => moment(t).format(chartDateFormat)),
          y: values.slice(0, 16),
          average: values.reduce((p, c, _, a) => p + c / a.length, 0),
        };
      })
      .catch((error) => {
        console.log(error);
      });
  },
  getActiveUsers: (from, to) => {
    return axios
      .get("/api/v2/metrics/query", {
        baseURL: process.env.API_BASE_URL,
        headers: { Authorization: `Api-token ${process.env.API_TOKEN}` },
        params: {
          entitySelector: `entityId("APPLICATION-6D794877E82BD376"),type("APPLICATION")`,
          metricSelector: "builtin:apps.web.activeUsersEst",
          from,
          to,
        },
      })
      .then((response) => {
        const values = response.data.result[0].data[0].values.filter((v) => !!v);
        return values.reduce((cur, prev) => {
          if (cur > prev) {
            return cur;
          } else {
            return prev;
          }
        }, 0);
      })
      .catch((error) => {
        console.log(error);
      });
  },
  getDynamicRequestMetrics: (serviceId, metricId, from, to, chartDateFormat) => {
    return axios
      .get("/api/v2/metrics/query", {
        baseURL: process.env.API_BASE_URL,
        headers: { Authorization: `Api-token ${process.env.API_TOKEN}` },
        params: {
          entitySelector: `type("SERVICE"),tag("ci360"),entityId(${SERVICES[serviceId]})`,
          metricSelector: DYNAMIC_REQUEST_METRICS[metricId],
          from,
          to,
        },
      })
      .then((response) => {

        if (metricId === 'responseTime') {
          return {
            x: response.data.result[0].data[0].timestamps.map((t) => moment(t).format(chartDateFormat)),
            y: response.data.result[0].data[0].values.map(v => Math.floor(v / 1000)),
          };
        } else {
          return {
            x: response.data.result[0].data[0].timestamps.map((t) => moment(t).format(chartDateFormat)),
            y: response.data.result[0].data[0].values,
          };
        }
      })
      .catch((error) => {
        console.log(error);
      });
  },
  getCovidAnalysis: (country) => {
    const countryCases = trialAnalysis.filter((i) => i.name === country);
    const timestamp = countryCases.map((i) => new Date(i.dt).toLocaleDateString());

    return [
      {
        style: { line: "green" },
        title: "New cases per million",
        x: timestamp,
        y: countryCases.map((i) => parseFloat(i.new_cases_per_million)),
      },
      {
        style: { line: "blue" },
        title: "New recoveries per million",
        x: timestamp,
        y: countryCases.map((i) => parseFloat(i.new_recoveries_per_million)),
      },
    ];
  },
  getCovidTrialAccountCreations: (country) => {
    const countryCases = trialAnalysis.filter((i) => i.name === country);
    const timestamp = countryCases.map((i) => new Date(i.dt).toLocaleDateString());
    return [
      {
        style: { line: "yellow" },
        title: "New trial account",
        x: timestamp,
        y: countryCases.map((i) => i.count_new_accounts),
      },
    ];
  },
  getCovidActiveAccount: (country) => {
    const countryCases = activeAccountAnalysis.filter((i) => i.billing_country === country);
    const timestamp = countryCases.map((i) => new Date(i.periodstart).toLocaleDateString());
    return [
      {
        style: { line: "magenta" },
        title: "Count users",
        x: timestamp,
        y: countryCases.map((i) => i.countusers),
      },
      {
        style: { line: "cyan" },
        title: "Count sessions",
        x: timestamp,
        y: countryCases.map((i) => i.countsessions),
      },
    ];
  },
};

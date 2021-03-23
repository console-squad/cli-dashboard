module.exports = {
  keys: true,
  fg: "white",
  selectedFg: "black",
  selectedBg: "blue",
  interactive: true,
  label: "Key requests (ms)",
  border: { type: "line", fg: "cyan" },
  columnSpacing: 1,
  columnWidth: [40, 12],
  data: {
    headers: ["Name", "Time"],
    data: [
      ["/account/search", 1.8],
      ["/login/callback", 862],
      ["/account/favorites", 581],
      ["/onboarding/summary", 117],
      ["/renewals/summary", 105],
      ["/login/status", 32.1],
      ["/login", 14.4],
      ["/logout", 8.47],
    ],
  },
};

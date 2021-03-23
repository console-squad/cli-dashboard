module.exports = {
  label: "Network metrics",
  tags: true,
  style: { fg: "blue" },
  data: {
    titles: ["Traffic", "Retransmission", "Connectivity", "Latency"],
    data: [randomArray(), randomArray(), randomArray(), randomArray()],
  },
};

function randomArray() {
  return Array.from({ length: 60 }, () => Math.floor(Math.random() * 60));
}

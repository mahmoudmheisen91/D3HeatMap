// API URL to fetch Monthly Global Land-Surface Temperature Data:
let api_url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

let baseTemperature;

/*
 * Loading data from API when DOM Content has been loaded:
 */
document.addEventListener("DOMContentLoaded", () => {
  fetch(api_url)
    .then(response => response.json())
    .then(data => {
      let data_set = parseData(data);
      drawHeatMap(data_set);
    })
    .catch(err => console.log(err));
});

/**
 * Parse data function
 * @param {object} data Object containing Monthly Global Land-Surface Temperature data
 */
let parseData = data => {
  let data_set = data.monthlyVariance;
  baseTemperature = data.baseTemperature;
  data_set.map(item => {
    item.temp = item.variance + baseTemperature;
  });
  return data_set;
};

/**
 * Creates a Heat Map using D3.js
 * @param {object} data Object containing Monthly Global Land-Surface Temperature data
 */
let drawHeatMap = data => {
  // Globals:
  const width = 1800;
  const height = 700;
  const margin = {
    top: 30,
    right: 0,
    bottom: 30,
    left: 175
  };
  let timeFormat = d3.timeFormat("%B");

  // Scaleing:
  let xScale = d3
    .scaleBand()
    .domain(data.map(item => item.year))
    .range([margin.right + margin.left, width - margin.right - margin.left]);

  let yScale = d3
    .scaleBand()
    .domain(data.map(item => item.month))
    .range([height - margin.top - margin.bottom, margin.top + margin.bottom]);

  // Axes:
  let xAxis = g =>
    g
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickFormat(d3.format("d"))
          .tickValues(xScale.domain().filter(item => item % 10 == 0))
          .tickSize(15, 1)
      )
      .call(g =>
        g
          .append("text")
          .attr("class", "x-label")
          .attr("x", width - (margin.right + margin.left))
          .attr("y", margin.top + margin.bottom)
          .text("Year")
      );

  let yAxis = g =>
    g
      .attr("id", "y-axis")
      .attr("transform", `translate(${margin.right + margin.left}, 0)`)

      .call(
        d3
          .axisLeft(yScale)
          .tickFormat(d => {
            let date = new Date();
            date.setMonth(d - 1);
            return timeFormat(date);
          })
          .tickValues(yScale.domain())
          .tickSize(15, 1)
      )
      .call(g =>
        g
          .append("text")
          .attr("class", "y-label")
          .attr("transform", "rotate(-90)")
          .attr("x", -(margin.right + margin.left) * 0.5)
          .attr("y", -(margin.top + margin.bottom) * 2)
          .text("Month")
      );

  // ToolTip:
  let toolTip = d3
    .select("main")
    .append("div")
    .attr("id", "tooltip");

  // Main PLot:
  let plot = g =>
    g
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("data-month", d => d.month)
      .attr("data-year", d => d.year)
      .attr("data-temp", d => d.temp)
      .attr("x", d => xScale(d.year))
      .attr(
        "y",
        d => height - margin.top - margin.bottom - yScale(d.month) + 12
      )
      .attr("width", d => width / 262)
      .attr("height", d => height / 12 - 12)
      .attr("fill", "none")
      .on("mouseover", function(d) {
        let date = new Date(d.year, d.month);
        toolTip
          .style("display", "block")
          .attr("data-year", d.year)
          .html(
            d3.timeFormat("%B, %Y")(date) +
              "<br/>" +
              "Temperature: " +
              d.temp +
              "<br/>" +
              "Variance: " +
              d.variance
          )
          .style("left", d3.event.pageX + 20 + "px")
          .style("top", d3.event.pageY - 45 + "px");
      })
      .on("mouseout", d => {
        toolTip.style("display", "none");
      });

  // Title:
  let title = g =>
    g.call(g =>
      g
        .append("text")
        .attr("id", "title")
        .attr("x", width / 2)
        .attr("y", (margin.top + margin.bottom) / 2)
        .text("Monthly Global Land-Surface Temperature")
    );

  // Description:
  let description = g =>
    g.call(g =>
      g
        .append("text")
        .attr("id", "description")
        .attr("x", width / 2)
        .attr("y", (margin.top + margin.bottom) / 2 + 20)
        .text("Base Temperature: 8.66 Cel")
    );

  // Create SVG:
  let svg = d3
    .select(".vis-container")
    .append("svg")
    .attr("class", "svg-graph")
    .attr("viewBox", [0, 0, width, height])
    .attr("preserveAspectRatio", "xMidYMid meet");

  // Append:
  svg.append("g").call(xAxis);
  svg.append("g").call(yAxis);
  svg.append("g").call(plot);
  svg.append("g").call(title);
  svg.append("g").call(description);
};

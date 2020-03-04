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
  let timeFormat = d3.timeFormat("%b");

  // Scaleing:
  let xScale = d3
    .scaleLinear()
    .domain([d3.min(data, d => d.year), d3.max(data, d => d.year)])
    .range([margin.right + margin.left, width - margin.right - margin.left]);

  let yScale = d3
    .scaleBand()
    .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    .range([height - margin.top - margin.bottom, margin.top + margin.bottom]);

  // Axes:
  let xAxis = g =>
    g
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
      .call(g =>
        g
          .append("text")
          .attr("class", "x-label")
          .attr("x", width - (margin.right + margin.left))
          .attr("y", (margin.top + margin.bottom) * 0.75)
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
      )
      .call(g =>
        g
          .append("text")
          .attr("class", "y-label")
          .attr("transform", "rotate(-90)")
          .attr("x", -(margin.right + margin.left) * 0.5)
          .attr("y", -(margin.top + margin.bottom) * 1.25)
          .text("Month")
      );

  // ToolTip:
  let toolTip = d3
    .select("main")
    .append("div")
    .attr("id", "tooltip");

  // Main PLot:
  //   let plot = g =>
  //     g
  //       .selectAll("rect")
  //       .data(data)
  //       .enter()
  //       .append("rect")
  //       .attr("class", "bar")
  //       .attr("data-date", d => d.DateStr)
  //       .attr("data-gdp", d => d.GDP)
  //       .attr("x", d => xScale(d.Date))
  //       .attr("y", d => yScale(d.GDP))
  //       .attr("width", width / 275)
  //       .attr("height", d => height - margin.top - margin.bottom - yScale(d.GDP))
  //       .attr("fill", "none")
  //       .on("mouseover", d => {
  //         toolTip.style("display", "block");
  //         toolTip.attr("data-date", d.DateStr);
  //         toolTip
  //           .html(
  //             "Year: " +
  //               d.Year +
  //               " " +
  //               d.QVAL +
  //               "<br/>" +
  //               "GDP: " +
  //               d.GDP +
  //               " Billion"
  //           )
  //           .style("left", d3.event.pageX + "px")
  //           .style("top", d3.event.pageY - 28 + "px");
  //       })
  //       .on("mouseout", d => {
  //         toolTip.style("display", "none");
  //       });

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
  //   svg.append("g").call(plot);
  svg.append("g").call(title);
};

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
  const cell_width = 8;
  const cell_height = 90;
  const width = (cell_width + 1) * Math.ceil(data.length / 12);
  const height = (cell_height + 10) * 12;
  const legend_width = 50;
  const legend_height = 70 * 11;
  const margin = {
    top: 40,
    right: 30,
    bottom: 40,
    left: 175
  };
  let timeFormat = d3.timeFormat("%B");
  let colors = [
    "#a50026",
    "#d73027",
    "#f46d43",
    "#fdae61",
    "#fee08b",
    "#ffffbf",
    "#d9ef8b",
    "#a6d96a",
    "#66bd63",
    "#1a9850",
    "#006837"
  ].reverse();

  // Scaleing:
  let xScale = d3
    .scaleBand()
    .domain(data.map(item => item.year))
    .range([margin.right + margin.left, width - margin.right - margin.left]);

  let yScale = d3
    .scaleBand()
    .domain(data.map(item => item.month))
    .range([height - margin.top - margin.bottom, margin.top + margin.bottom]);

  let legendScale = d3
    .scaleLinear()
    .domain([d3.min(data, d => d.temp), d3.max(data, d => d.temp)])
    .range([margin.top + margin.bottom, legend_height]);

  let colorDomain = (min, max) => {
    let step = (max - min) / colors.length;
    return [...new Array(10)].map((_, index) => min + (index + 1) * step);
  };

  let colorScale = d3
    .scaleThreshold()
    .domain(
      colorDomain(
        d3.min(data, d => d.temp),
        d3.max(data, d => d.temp)
      )
    )
    .range(colors);

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
          .attr("y", -(margin.top + margin.bottom) * 1.75)
          .text("Month")
      );

  let legendAxis = g =>
    g
      .attr("id", "legend-axis")
      .attr("transform", `translate(${width - margin.right * 4}, ${50})`)
      .call(
        d3
          .axisLeft(legendScale)
          .tickFormat(d3.format("0.2f"))
          .tickValues(colorScale.domain())
          .tickSize(15, 1)
      )
      .call(g =>
        g
          .append("text")
          .attr("class", "legend-label")
          .attr("x", margin.right + 40)
          .attr("y", margin.top + 20)
          .text("Legend")
      );

  // Legend
  var legend = g =>
    g
      .attr("id", "legend")
      .attr("transform", `translate(${width - margin.right * 4 - 10}, ${50})`)
      .selectAll("rect")
      .data(
        colorScale.range().map(color => {
          let d = colorScale.invertExtent(color);
          if (d[0] == null) d[0] = legendScale.domain()[0];
          if (d[1] == null) d[1] = legendScale.domain()[1];
          return d;
        })
      )
      .enter()
      .append("rect")
      .attr("x", 10)
      .attr("y", d => legendScale(d[0]))
      .attr("width", legend_width)
      .attr("height", legend_height / 11 - 5)
      .style("fill", d => colorScale(d[0]))
      .style("stroke", "black");

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
      .attr("data-month", d => d.month - 1)
      .attr("data-year", d => d.year)
      .attr("data-temp", d => d.temp)
      .attr("x", d => xScale(d.year))
      .attr("y", d => yScale(d.month))
      .attr("width", cell_width)
      .attr("height", cell_height)
      .attr("fill", d => colorScale(d.temp))
      .on("mouseover", function(d) {
        let date = new Date(d.year, d.month - 1);
        let temp = Math.round((d.temp + Number.EPSILON) * 100) / 100;
        toolTip
          .style("display", "block")
          .attr("data-year", d.year)
          .html(
            d3.timeFormat("%B, %Y")(date) +
              "<br/>" +
              "Temperature: " +
              temp +
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
        .attr("y", (margin.top + margin.bottom) / 3)
        .text("Monthly Global Land-Surface Temperature")
    );

  // Description:
  let description = g =>
    g.call(g =>
      g
        .append("text")
        .attr("id", "description")
        .attr("x", width / 2)
        .attr("y", (margin.top + margin.bottom) / 2 + 25)
        .text("Base Temperature: 8.66 Cel")
    );

  // Create SVG:
  let svg = d3
    .select(".vis-container")
    .append("svg")
    .attr("class", "svg-graph")
    .attr("viewBox", [0, 0, width, height])
    .attr("viewBox", [0, 0, width, height])
    .attr("preserveAspectRatio", "xMidYMid meet");

  // Append:
  svg.append("g").call(xAxis);
  svg.append("g").call(yAxis);
  svg.append("g").call(legendAxis);
  svg.append("g").call(legend);
  svg.append("g").call(plot);
  svg.append("g").call(title);
  svg.append("g").call(description);
};

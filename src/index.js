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
      console.log(data_set);
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

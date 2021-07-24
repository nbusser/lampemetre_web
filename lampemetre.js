var xValues = [50,60,70,80,90,100,110,120,130,140,150];

var yValues = [7,8,8,9,9,9,10,11,14,14,15];
var yValues2 = [15,3,1,5,9,9,10,11,14,14,15];

var add_line_chart = function(chart, color, data) {
  line = {
    fill: false,
    lineTension: 0,
    backgroundColor: "rgba(0,0,255,1.0)",
    borderColor: color,
    data: data
  };
  chart.data.datasets.push(line);
  chart.update();
};

var remove_line_chart = function(chart, position) {
  chart.data.datasets.splice(position, 1);
  chart.update();
}

var clear_chart = function(chart) {
  chart.data.datasets = []
  chart.update();
}

var chart = new Chart("chart", {
  type: "line",
  data: {
    labels: xValues,
    datasets: [],
}});

add_line_chart(chart, "rgba(0,0,255,1.0)", yValues);
add_line_chart(chart, "rgba(255,0,0,1.0)", yValues2);
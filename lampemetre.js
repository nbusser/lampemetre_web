var xValues = [50,60,70,80,90,100,110,120,130,140,150];

var yValues = [7,8,8,9,9,9,10,11,14,14,15];
var yValues2 = [15,3,1,15,4,3,0,1,4,6,15];
var yValues3 = [5,2,5,9,2,6,9,1,14,7,3];

groups_colors = ["rgba(0,0,255,1.0)", "rgba(255,0,0,1.0)"]
var add_line_chart = function(data, group) {
  var color = groups_colors[group%groups_colors.length]
  line = {
    fill: false,
    lineTension: 0,
    backgroundColor: color,
    borderColor: color,
    data: data,
    stack: group,
  };
  chart.data.datasets.push(line);
  chart.update();
};

var remove_line_chart = function(position) {
  chart.data.datasets.splice(position, 1);
  chart.update();
}

var clear_chart = function() {
  chart.data.datasets = []
  chart.update();
}

var chart = new Chart("chart", {
  type: "line",
  data: {
    labels: xValues,
    datasets: [],
  },
  options: {
    onClick: (e) => measure(e),
    annotation: {
      annotations: []
    },
  },
});

add_line_chart(yValues, 0);
add_line_chart(yValues2, 0);
add_line_chart(yValues3, 1);

var n_measure = 0
var measure = function(e) {
  // Checks if user is hovering a valid sample point
  if(chart.tooltip._active.length) {
    const canvasPosition = Chart.helpers.getRelativePosition(e, chart);
    const index_x = chart.scales['x-axis-0'].getValueForPixel(canvasPosition.x);
    const val_x = xValues[index_x];

    let annotation = chart.options.annotation.annotations.find((a) => {return a.value == val_x});

    if (!annotation) {
      add_mesure(val_x);
    }
    else {
      delete_mesure(val_x);
    }
  }
}

var add_mesure = function(val_x) {
  n_measure++;
  add_vertical_annotation(val_x, "Mesure " + n_measure);
}

var add_vertical_annotation = function(xValue, text){
	var line = 'mesure_' + xValue;
	chart.options.annotation.annotations.push(
		{
			drawTime: "afterDatasetsDraw",
			id: line,
			type: "line",
			mode: "vertical",
			scaleID: "x-axis-0",
			value: xValue,
			borderColor: "black",
			borderWidth: 3,
			label:
			{
				fontColor: "black",
				backgroundColor: "white",
				content: text,
				enabled: true
			}
		});
    chart.update();
}

var delete_mesure = function(val_x) {
  let index = undefined;
  for (let i = 0; i < chart.options.annotation.annotations.length && index == undefined; i++) {
    let annotation_val = chart.options.annotation.annotations[i].value
    if(annotation_val == val_x) {
      index = i;
    }
  }

  remove_annotation(index)
}

var remove_annotation = function(position) {
  chart.options.annotation.annotations.splice(position, 1);
  chart.update();
}

var clear_annotations = function() {
  chart.options.annotation.annotations = [];
  chart.update();
}
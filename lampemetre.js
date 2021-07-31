document.getElementById("btn_capture").onclick = function() {
  if ("serial" in navigator) {
    perform_capture().then().catch(error => {
      alert("Erreur pendant la capture: " + error)
    });
  }
  else {
    alert("Capture impossible. Votre navigateur ne supporte pas web serial API")
  }
};

document.getElementById("btn_clear").onclick = function() {
  clear_measures();
  clear_lines();
};

document.getElementById("btn_clear_measures").onclick = function() {
  clear_measures();
};

var perform_capture = async function() {
  // Get all serial ports the user has previously granted the website access to.
  const ports = await navigator.serial.getPorts();
  var serial_connection;

  if(ports.length > 0) {
    serial_connection = ports[0];
  } else {
    // Filter on devices with the valid USB Vendor/Product IDs.
    const filters = [
      { usbVendorId: 0x0403, usbProductId: 0x6001 }
    ];

    // Prompt user to select an Arduino Uno device.
    serial_connection = await navigator.serial.requestPort({ filters });

    const { usbProductId, usbVendorId } = serial_connection.getInfo();
  }

  // Wait for the serial port to open.
  await serial_connection.open({
    baudRate: 2400,
    dataBits: 8,
    stopBits: 2,
    parity: "none"
  });

  let tensions_anode = await acquire_u_anode(serial_connection);
}

var write_byte_serial = async function(serial_connection, value) {
  let serial_writer = serial_connection.writable.getWriter();
  const data = new Uint8Array([value]);
  try {
    await serial_writer.write(data);
  }
  finally {
    serial_writer.releaseLock();
  }
}

var acquire_u_anode = async function(serial_connection) {
  let serial_reader = serial_connection.readable.getReader();
  try{
    write_byte_serial(serial_connection, 101);

    let bytes_to_read = 128;
    read_buffer = await read_n_bytes_serial_pack_uint16(serial_reader, bytes_to_read, 1500);
  } catch {
    throw "Impossible d'obtenir les valeurs de tension anode"
  } finally {
    serial_reader.cancel();
    serial_reader.releaseLock();
  }

  let u_anode_samples = []
  for(let i = 0; i < read_buffer.length; i++) {
    let voltage = Math.round(read_buffer[i] * 4.6875);
    u_anode_samples.push(voltage);
  }

  return u_anode_samples;
}

var read_n_bytes_serial_pack_uint16 = async function(serial_reader, n_bytes, timeout) {
  if(n_bytes % 2 != 0) {
    throw "n_bytes must be even to pack reading result in 16-bits words"
  }

  let read_buffer = await read_n_bytes_serial_with_timeout(serial_reader, n_bytes, timeout);

  let uint16_values = []
  for(let i = 0; i < read_buffer.length; i+= 2) {
    let uin16_value = (read_buffer[i] << 8) + read_buffer[i+1];
    uint16_values.push(uin16_value);
  }

  return uint16_values;
}

var read_n_bytes_serial_with_timeout = function(serial_reader, n_bytes, timeout) {
  return new Promise(function(resolve, reject) {
    read_n_bytes_serial(serial_reader, n_bytes).then(resolve, reject);
    setTimeout(() => {reject("Timeout while reading")}, timeout)
  });
}

var read_n_bytes_serial = async function(serial_reader, n_bytes) {
  let i = 0;
  const read_buffer = [];
  while(i < n_bytes) {
    const { value, _ } = await serial_reader.read();

    if(!value) {
      throw "read value is empty"
    }

    for(j = 0; j < value.length; j++) {
      read_buffer.push(value[j]);
    }
    i+=value.length;
  }
  return read_buffer;
}

var xValues = [50,60,70,80,90,100,110,120,130,140,150];

var yValues = [7,8,8,9,9,9,10,11,14,14,15];
var yValues2 = [15,3,1,15,4,3,0,1,4,6,15];
var yValues3 = [5,2,5,9,2,6,9,1,14,7,3];

groups_colors = ["rgba(0,0,255,1.0)", "rgba(255,0,0,1.0)", "rgba(255,0,0,1.0)", "rgba(255,0,255,1.0)"]
var add_line_chart = function(data, group) {
  var color = groups_colors[group%groups_colors.length];
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

var clear_lines = function() {
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
  let mesure_name = "Mesure " + n_measure;
  add_vertical_annotation(val_x, mesure_name);

  let measure_div = document.createElement("div");
  measure_div.id = "measure_" + val_x;
  measure_div.className = "measure";
  measure_div.textContent = mesure_name;

  let all_measures_div = document.getElementById("measures");
  all_measures_div.appendChild(measure_div);
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
  let all_measures_div = document.getElementById("measures");
  let measure_div = document.getElementById("measure_" + val_x);
  all_measures_div.removeChild(measure_div);

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

var clear_measures = function() {
  let all_measures_div = document.getElementById("measures");
  while (all_measures_div.firstChild) {
    all_measures_div.removeChild(all_measures_div.lastChild);
  }
  n_measure = 0;
  clear_annotations();
}

var clear_annotations = function() {
  chart.options.annotation.annotations = [];
  chart.update();
}
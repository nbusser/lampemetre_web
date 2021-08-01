document.getElementById("btn_capture").onclick = function() {
  if ("serial" in navigator) {
    perform_capture(16, [1]).then().catch(error => {
      alert("Erreur pendant la capture: " + error)
    });
  }
  else {
    alert("Capture impossible. Votre navigateur ne supporte pas web serial API")
  }
};

document.getElementById("btn_test").onclick = function() {
  if ("serial" in navigator) {
    perform_test().then().catch(error => {
      alert("Erreur pendant le test: " + error)
    });
  }
  else {
    alert("Test impossible. Votre navigateur ne supporte pas web serial API")
  }
};

document.getElementById("btn_clear").onclick = function() {
  clear_measures();
  clear_lines();
};

document.getElementById("btn_clear_measures").onclick = function() {
  clear_measures();
};

var get_serial_connection = async function() {
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

    return serial_connection;
}

var perform_test = async function() {
  let serial_connection = await get_serial_connection();

  let serial_reader = serial_connection.readable.getReader();
  let serial_writer = serial_connection.writable.getWriter();

  let u_anode_max = [];
  let i_cathode_32 = [];
  let i_cathode_256 = [];
  let u_grid = [];

  try {
    write_byte_serial(serial_writer, 124);

    let to_read_commands = 20;
    let leftovers = [];

    while(to_read_commands > 0) {
      read_buffer = await read_n_bytes_serial_with_timeout(serial_reader, 3-leftovers.length, 500);
      leftovers.push(...read_buffer);
      while(leftovers.length/3 >= 1) {
        to_read_commands--;
        let received = leftovers.splice(0, 3);

        let category = received[0];
        let value = (received[1] << 8) + received[2];

        switch(category) {
          case 126:
            u_anode_max.push(value * 0.46875);
            break;
          case 151:
            i_cathode_32.push(value * 0.03125);
            break;
          case 111:
            i_cathode_256.push(value * 0.25);
            break;
          case 107:
            u_grid.push(value);
            break;
          default:
            throw "Le programme a recu une mesure de test invalide"
        }
      }
    }
  } finally {
    await write_byte_serial(serial_writer, 0);

    serial_reader.cancel();
    serial_reader.releaseLock();

    await serial_writer.close();

    await serial_connection.close();
  }

  let diagnostic_message = "Test terminé\n"

  let u_anode_ref = 280;
  let u_anode_error = detect_error_test(u_anode_max, u_anode_ref, 0.05, 0);

  let i_cathode_32_ref = 0;
  let i_32_cathode_error = detect_error_test(i_cathode_32, i_cathode_32_ref, 0, 0.5);

  let i_cathode_256_ref = 0;
  let i_256_cathode_error = detect_error_test(i_cathode_256, i_cathode_256_ref, 0, 0.5);

  let u_grid_ref = 31;
  let u_grid_error = detect_error_test(u_grid, u_grid_ref, 0, 0);

  if(!(u_anode_error || i_32_cathode_error || i_256_cathode_error || u_grid_error)) {
    diagnostic_message += "Aucune anomalie à signaler";
  } else {
    diagnostic_message += "Anomalies détectées:\n"

    if(u_anode_error) {
      diagnostic_message += "-Tension plaque max: " + u_anode_error + " capturé (tension de référence " + u_anode_ref + "V)\n";
    }
    if(i_32_cathode_error) {
      diagnostic_message += "-Intensité cathode 32mA: " + i_32_cathode_error + " capturé (intensité de référence " + i_cathode_32_ref + "mA)\n";
    }
    if(i_256_cathode_error) {
      diagnostic_message += "-Intensité cathode 32mA: " + i_256_cathode_error + " capturé (intensité de référence " + i_cathode_256_ref + "mA)\n";
    }
    if(u_grid_error) {
      diagnostic_message += "-Tension grille: -" + u_grid_error + " capturé (tension de référence -" + u_grid_ref + "V)\n";
    }
  }
  alert(diagnostic_message);
}

var detect_error_test = function(array, ref_value, tolerance, tolerance_beta) {
  error_val = undefined;
  for(let i = 0; i < array.length; i++) {
    let element = array[i];
    if(Math.abs(ref_value-element) > tolerance*ref_value + tolerance_beta) {
      error_val = element;
      break;
    }
  }
  return error_val;
}

var perform_capture = async function(i_cathode_max, u_grids) {
  let serial_connection = await get_serial_connection();

  let serial_reader = serial_connection.readable.getReader();
  let serial_writer = serial_connection.writable.getWriter();
  try {
    let tensions_anode = await acquire_u_anode(serial_reader, serial_writer);
    chart.data.labels = tensions_anode;
    chart.update();

    let sampling_mode = i_cathode_max < 32 ? 32 : 50;
    write_byte_serial(serial_writer, sampling_mode);

    await sleep(100);

    for(let i = 0; i < u_grids.length; i++) {
      let u_grid = u_grids[i];
      let current_cathode = await acquire_i_cathode(serial_reader, serial_writer, u_grid);
      add_line_chart(current_cathode, 0);
      await sleep(200);
    }

    write_byte_serial(serial_writer, 105);
  } finally {
    serial_reader.cancel();
    serial_reader.releaseLock();

    await serial_writer.close();

    await serial_connection.close();
  }
}

var sleep = async function(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var write_byte_serial = async function(serial_writer, value) {
  const data = new Uint8Array([value]);
  await serial_writer.write(data);
}

var acquire_u_anode = async function(serial_reader, serial_writer) {
  try{
    write_byte_serial(serial_writer, 101);

    let bytes_to_read = 128;
    read_buffer = await read_n_bytes_serial_pack_uint16(serial_reader, bytes_to_read, 1500);
  } catch {
    throw "Impossible d'obtenir les valeurs de tension anode"
  }

  let u_anode_samples = []
  for(let i = 0; i < read_buffer.length; i++) {
    let voltage = Math.round(read_buffer[i] * 0.46875);
    u_anode_samples.push(voltage);
  }

  return u_anode_samples;
}

var acquire_i_cathode = async function(serial_reader, serial_writer, u_grid) {
  try{
    let u_grid_to_send = 150 + (u_grid * 2);
    write_byte_serial(serial_writer, u_grid_to_send);

    let bytes_to_read = 128;
    read_buffer = await read_n_bytes_serial_pack_uint16(serial_reader, bytes_to_read, 15000);
  } catch(error) {
    alert(error)
    throw "Impossible d'obtenir les valeurs d'intensité cathode"
  }

  return read_buffer;
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

//add_line_chart(yValues, 0);
//add_line_chart(yValues2, 0);
//add_line_chart(yValues3, 1);

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
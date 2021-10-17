async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function writeByteSerial(
  serialWriter: WritableStreamDefaultWriter<Uint8Array>, value: number,
) {
  const data = new Uint8Array([value]);
  await serialWriter.write(data);
}

async function readBytesSerial(
  serialReader: ReadableStreamDefaultReader<Uint8Array>, nBytes: number,
) : Promise<number[]> {
  let i = 0;
  const readBuffer = [];
  while (i < nBytes) {
    const { value, _ } = await serialReader.read();

    if (!value) {
      throw Error('read value is empty');
    }

    for (let j = 0; j < value.length; j += 1) {
      readBuffer.push(value[j]);
    }
    i += value.length;
  }
  return readBuffer;
}

function readBytesSerialWithTimeout(
  serialReader: ReadableStreamDefaultReader<Uint8Array>, nBytes: number, timeout: number,
): Promise<number[]> {
  return new Promise((resolve, reject) => {
    readBytesSerial(serialReader, nBytes).then(resolve, reject);
    setTimeout(() => { reject(Error('Timeout while reading')); }, timeout);
  });
}

async function readBytesSerialPackUint16(
  serialReader: ReadableStreamDefaultReader<Uint8Array>, nBytes: number, timeout: number,
) {
  if (nBytes % 2 !== 0) {
    throw Error('n_bytes must be even to pack reading result in 16-bits words');
  }

  const readBuffer = await readBytesSerialWithTimeout(serialReader, nBytes, timeout);

  const uint16Values = [];
  for (let i = 0; i < readBuffer.length; i += 2) {
    const val = (readBuffer[i] << 8) + readBuffer[i + 1];
    uint16Values.push(val);
  }

  return uint16Values;
}

async function acquireTensionsAnode(
  serialReader: ReadableStreamDefaultReader<Uint8Array>,
  serialWriter: WritableStreamDefaultWriter<Uint8Array>,
) {
  let readBuffer = [];
  try {
    await writeByteSerial(serialWriter, 101);

    const bytesToRead = 128;
    readBuffer = await readBytesSerialPackUint16(serialReader, bytesToRead, 1500);
  } catch {
    throw Error('Impossible d\'obtenir les valeurs de tension anode');
  }

  const uAnodeSamples = [];
  for (let i = 0; i < readBuffer.length; i += 1) {
    const voltage = Math.round(readBuffer[i] * 4.6875) / 10;
    uAnodeSamples.push(voltage);
  }

  return uAnodeSamples;
}

async function acquireCurrentCathode(
  serialReader: ReadableStreamDefaultReader<Uint8Array>,
  serialWriter: WritableStreamDefaultWriter<Uint8Array>,
  uGrid: number,
) {
  const iCathodeSample = [];
  try {
    const uGridToSend = 150 + (uGrid * 2);

    await writeByteSerial(serialWriter, uGridToSend);

    const bytesToRead = 128;
    const readBuffer = await readBytesSerialPackUint16(serialReader, bytesToRead, 15000);

    for (let i = 0; i < readBuffer.length; i += 1) {
      const current = readBuffer[i] * 0.03125;
      iCathodeSample.push(current);
    }
  } catch (error) {
    alert(error);
    throw Error('Impossible d\'obtenir les valeurs d\'intensité cathode');
  }

  return iCathodeSample;
}

async function getSerialConnection() {
  // Get all serial ports the user has previously granted the website access to.
  const ports = await navigator.serial.getPorts();
  let serialConnection;

  if (ports.length > 0) {
    [serialConnection] = ports;
  } else {
    // Filter on devices with the valid USB Vendor/Product IDs.
    const filters = [
      { usbVendorId: 0x0403, usbProductId: 0x6001 },
    ];

    // Prompt user to select a device matching filters.
    serialConnection = await navigator.serial.requestPort({ filters });
  }

  // Wait for the serial port to open.
  await serialConnection.open({
    baudRate: 2400,
    dataBits: 8,
    stopBits: 2,
    parity: 'none',
  });

  return serialConnection;
}

export type CaptureData = {
  tensionsAnode: number[],
  currentsCathode: number[],
};

export default async function performCapture(
  iCathodeMax: number, uGrid: number,
): Promise<CaptureData> {
  const serialConnection: SerialPort = await getSerialConnection();

  const serialReader = (<ReadableStream<Uint8Array>>serialConnection.readable).getReader();
  const serialWriter = (<WritableStream<Uint8Array>>serialConnection.writable).getWriter();

  let tensionsAnode;
  let currentsCathode;
  try {
    tensionsAnode = await acquireTensionsAnode(serialReader, serialWriter);

    const samplingMode = iCathodeMax <= 32 ? 32 : 50;
    await writeByteSerial(serialWriter, samplingMode);

    currentsCathode = await acquireCurrentCathode(serialReader, serialWriter, uGrid);

    await writeByteSerial(serialWriter, 105);
  } finally {
    serialReader.cancel();
    serialReader.releaseLock();

    await serialWriter.close();

    await serialConnection.close();
  }

  return { tensionsAnode, currentsCathode };
}

async function perform_test() {
  const serial_connection = await getSerialConnection();

  const serial_reader = serial_connection.readable.getReader();
  const serial_writer = serial_connection.writable.getWriter();

  const u_anode_max = [];
  const i_cathode_32 = [];
  const i_cathode_256 = [];
  const u_grid = [];

  try {
    writeByteSerial(serial_writer, 124);

    let to_read_commands = 20;
    const leftovers = [];

    while (to_read_commands > 0) {
      read_buffer = await readBytesSerialWithTimeout(serial_reader, 3 - leftovers.length, 500);
      leftovers.push(...read_buffer);
      while (leftovers.length / 3 >= 1) {
        to_read_commands--;
        const received = leftovers.splice(0, 3);

        const category = received[0];
        const value = (received[1] << 8) + received[2];

        switch (category) {
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
            throw 'Le programme a recu une mesure de test invalide';
        }
      }
    }
  } finally {
    await writeByteSerial(serial_writer, 0);

    serial_reader.cancel();
    serial_reader.releaseLock();

    await serial_writer.close();

    await serial_connection.close();
  }

  let diagnostic_message = 'Test terminé\n';

  const u_anode_ref = 280;
  const u_anode_error = detect_error_test(u_anode_max, u_anode_ref, 0.05, 0);

  const i_cathode_32_ref = 0;
  const i_32_cathode_error = detect_error_test(i_cathode_32, i_cathode_32_ref, 0, 0.5);

  const i_cathode_256_ref = 0;
  const i_256_cathode_error = detect_error_test(i_cathode_256, i_cathode_256_ref, 0, 0.5);

  const u_grid_ref = 31;
  const u_grid_error = detect_error_test(u_grid, u_grid_ref, 0, 0);

  if (!(u_anode_error || i_32_cathode_error || i_256_cathode_error || u_grid_error)) {
    diagnostic_message += 'Aucune anomalie à signaler';
  } else {
    diagnostic_message += 'Anomalies détectées:\n';

    if (u_anode_error) {
      diagnostic_message += `-Tension plaque max: ${u_anode_error} capturé (tension de référence ${u_anode_ref}V)\n`;
    }
    if (i_32_cathode_error) {
      diagnostic_message += `-Intensité cathode 32mA: ${i_32_cathode_error} capturé (intensité de référence ${i_cathode_32_ref}mA)\n`;
    }
    if (i_256_cathode_error) {
      diagnostic_message += `-Intensité cathode 32mA: ${i_256_cathode_error} capturé (intensité de référence ${i_cathode_256_ref}mA)\n`;
    }
    if (u_grid_error) {
      diagnostic_message += `-Tension grille: -${u_grid_error} capturé (tension de référence -${u_grid_ref}V)\n`;
    }
  }
  alert(diagnostic_message);
}

function detect_error_test(array, ref_value, tolerance, tolerance_beta) {
  error_val = undefined;
  for (let i = 0; i < array.length; i++) {
    const element = array[i];
    if (Math.abs(ref_value - element) > tolerance * ref_value + tolerance_beta) {
      error_val = element;
      break;
    }
  }
  return error_val;
}

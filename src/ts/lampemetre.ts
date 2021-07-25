import Chart, { ChartDataset } from 'chart.js/auto';

import Tube from './model/Tube';
import Capture from './model/Capture';
import TubeManager from './controler/TubesManager';
import Color from './chart/Color';

const xValues: number[] = [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150];

const yValues: number[] = [7, 8, 8, 9, 9, 9, 10, 11, 14, 14, 15];
const yValues2: number[] = [15, 3, 1, 15, 4, 3, 0, 1, 4, 6, 15];
const yValues3: number[] = [5, 2, 5, 9, 2, 6, 9, 1, 14, 7, 3];

function measure(e) {
  console.log(e);
}

const CHART = new Chart('chart', {
  type: 'line',
  data: {
    labels: xValues,
    datasets: [],
  },
  options: {
    onClick: (e) => measure(e),
    scales: {
      xAxis: {
        display: true,
        title: {
          display: true,
          text: 'Tension Plaque (V)',
        },
      },
      yAxis: {
        display: true,
        title: {
          display: true,
          text: 'Intensité Cathode (A)',
        },
      },
    },
  },
});

const colors: Color[] = [
  new Color(0, 0, 255, 1.0),
  new Color(255, 0, 0, 1.0),
  new Color(0, 255, 0, 1.0),
  new Color(255, 255, 0, 1.0),
  new Color(255, 0, 255, 1.0),
];

function getTubeColor(tube: Tube): Color {
  const tubeIndex = TubeManager.getTubeIndex(tube);
  return colors[tubeIndex % colors.length];
}

function captureGetLabel(capture: Capture): string {
  return `${capture.uGrille}V`;
}

function captureToDataset(capture: Capture): ChartDataset {
  const tubeColor: string = getTubeColor(capture.tube).toString();
  return {
    label: captureGetLabel(capture),
    fill: false,
    backgroundColor: tubeColor,
    borderColor: tubeColor,
    data: capture.yValues,
    stack: capture.tube.name,
    yAxisID: 'yAxis',
  };
}

function addLineToChart(chart: Chart, line: ChartDataset) {
  chart.data.datasets.push(line);
  chart.update();
}

const tube0: Tube = TubeManager.createTube('Tubi');
const tube1: Tube = TubeManager.createTube('Tuba');

const capture0 = tube0.createCapture(0, yValues);
const capture1 = tube0.createCapture(1, yValues2);
const capture2 = tube1.createCapture(-5, yValues3);

addLineToChart(CHART, captureToDataset(capture0));
addLineToChart(CHART, captureToDataset(capture1));
addLineToChart(CHART, captureToDataset(capture2));

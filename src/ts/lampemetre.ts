import Plotly from 'plotly.js-dist-min';

import Tube from './model/Tube';
import Capture from './model/Capture';
import TubeManager from './controler/TubesManager';
import Color from './chart/Color';

const CHART = 'chart';
const PLOT_DATA = [];

Plotly.newPlot(CHART, {
  data: PLOT_DATA,
  layout: {
    width: 600,
    height: 400,
  },
});

Plotly.redraw(CHART);

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

function captureToTrace(capture: Capture): Object {
  const tubeColor: string = getTubeColor(capture.tube).toString();

  return {
    x: capture.uAnode,
    y: capture.iCathode,
    mode: 'lines+markers',
    type: 'scatter',
    marker: {
      color: tubeColor,
    },
    name: captureGetLabel(capture),
  };
}

function addTraceToPlot(line: Object) {
  PLOT_DATA.push(line);
  Plotly.redraw(CHART);
}

const xValues: number[] = [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150];

const yValues: number[] = [7, 8, 8, 9, 9, 9, 10, 11, 14, 14, 15];
const yValues2: number[] = [15, 3, 1, 15, 4, 3, 0, 1, 4, 6, 15];
const yValues3: number[] = [5, 2, 5, 9, 2, 6, 9, 1, 14, 7, 3];

const tube0: Tube = TubeManager.createTube('Tubi');
const tube1: Tube = TubeManager.createTube('Tuba');

const capture0 = tube0.createCapture(xValues, 0, yValues);
const capture1 = tube0.createCapture(xValues, 1, yValues2);
const capture2 = tube1.createCapture(xValues, -5, yValues3);

addTraceToPlot(captureToTrace(capture0));
addTraceToPlot(captureToTrace(capture1));
addTraceToPlot(captureToTrace(capture2));

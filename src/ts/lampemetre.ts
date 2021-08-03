import {
  Shape, PlotData, PlotMouseEvent, newPlot, redraw, Data, Layout,
} from 'plotly.js';

import Tube from './model/Tube';
import Capture from './model/Capture';
import TubeManager from './controler/TubesManager';
import Color from './chart/Color';
import Measure from './model/Measure';
import ViewMeasure from './chart/ViewMeasure';
import ViewMeasuresManager from './controler/ViewMeasuresManager';

interface PlotHTMLElement extends HTMLElement {
  on(eventName: string, handler: Function): void;
}

const PLOT: PlotHTMLElement = <PlotHTMLElement>document.getElementById('chart');
const PLOT_DATA: Data[] = [];

const SHAPES: Shape[] = [];

const LAYOUT: Partial<Layout> = {
  width: 600,
  height: 400,
  shapes: SHAPES,
};

newPlot(PLOT, PLOT_DATA, LAYOUT);

PLOT.on('plotly_click', (data: PlotMouseEvent) => {
  const xClicked: number = <number>data.points[0].x;

  const viewMeasure: ViewMeasure | undefined = ViewMeasuresManager.getViewMeasure(xClicked);
  if (viewMeasure === undefined) {
    const newViewMeasure: ViewMeasure = ViewMeasuresManager.createViewMeasure(
      new Measure(xClicked),
    );
    SHAPES.push(newViewMeasure.getShape());
  } else {
    ViewMeasuresManager.removeViewMeasure(viewMeasure);
    SHAPES.splice(SHAPES.indexOf(viewMeasure.getShape()), 1);
  }

  redraw(PLOT);
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

function captureToTrace(capture: Capture): PlotData {
  const tubeColor: string = getTubeColor(capture.tube).toString();

  return <PlotData>{
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

function addTraceToPlot(line: PlotData) {
  PLOT_DATA.push(line);
  redraw(PLOT);
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

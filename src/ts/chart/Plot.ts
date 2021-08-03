import {
  Layout, Shape, Data, PlotMouseEvent, newPlot, redraw, PlotData,
} from 'plotly.js';
import Color from './Color';
import ViewMeasure from './ViewMeasure';
import Capture from '../model/Capture';
import Measure from '../model/Measure';
import Tube from '../model/Tube';
import TubeManager from '../controler/TubesManager';
import ViewMeasuresManager from '../controler/ViewMeasuresManager';

interface PlotHTMLElement extends HTMLElement {
  on(eventName: string, handler: Function): void;
}

export default class Plot {
  private static instance: Plot;

  private static colors: Color[] = [
    new Color(0, 0, 255, 1.0),
    new Color(255, 0, 0, 1.0),
    new Color(0, 255, 0, 1.0),
    new Color(255, 255, 0, 1.0),
    new Color(255, 0, 255, 1.0),
  ];

  private static getTubeColor(tube: Tube): Color {
    const tubeIndex = TubeManager.getTubeIndex(tube);
    return Plot.colors[tubeIndex % Plot.colors.length];
  }

  private rootHtml: PlotHTMLElement = <PlotHTMLElement>document.getElementById('chart');

  private data: Data[] = [];

  private annotations: Shape[] = [];

  private layout: Partial<Layout> = {
    width: 600,
    height: 400,
    shapes: this.annotations,
  };

  public static getInstance(): Plot {
    if (!Plot.instance) {
      Plot.instance = new Plot();
    }
    return Plot.instance;
  }

  private constructor() {
    newPlot(this.rootHtml, this.data, this.layout);

    this.rootHtml.on('plotly_click', (data: PlotMouseEvent) => {
      const xClicked: number = <number>data.points[0].x;

      const viewMeasure: ViewMeasure | undefined = ViewMeasuresManager.getViewMeasure(xClicked);
      if (viewMeasure === undefined) {
        const newViewMeasure: ViewMeasure = ViewMeasuresManager.createViewMeasure(
          new Measure(xClicked),
        );
        this.annotations.push(newViewMeasure.getShape());
      } else {
        ViewMeasuresManager.removeViewMeasure(viewMeasure);
        this.annotations.splice(this.annotations.indexOf(viewMeasure.getShape()), 1);
      }

      this.refresh();
    });
  }

  private refresh() {
    redraw(this.rootHtml);
  }

  private addTraceToPlot(trace: PlotData) {
    this.data.push(trace);
    this.refresh();
  }

  public drawCapture(capture: Capture) {
    const tubeColor: string = Plot.getTubeColor(capture.tube).toString();

    const trace: PlotData = <PlotData>{
      x: capture.uAnode,
      y: capture.iCathode,
      mode: 'lines+markers',
      type: 'scatter',
      marker: {
        color: tubeColor,
      },
      name: `${capture.uGrille}V`,
    };

    this.addTraceToPlot(trace);
  }
}

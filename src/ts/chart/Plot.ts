import {
  Layout, Shape, Data, PlotMouseEvent, newPlot, redraw, PlotData,
} from 'plotly.js';
import Color from './Color';
import ViewMeasure from './ViewMeasure';
import Capture from '../model/Capture';
import Measure from '../model/Measure';
import ViewMeasuresManager from '../controler/ViewMeasuresManager';

interface PlotHTMLElement extends HTMLElement {
  on(eventName: string, handler: Function): void;
}

export default class Plot {
  private static instance: Plot;

  private rootHtml: PlotHTMLElement = <PlotHTMLElement>document.getElementById('chart');

  private data: Data[] = [];

  private annotations: Shape[] = [];

  private captureTraceMap: Map<Capture, PlotData> = new Map();

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
        this.removeMeasure(viewMeasure);
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

  private removeTraceFromPlot(trace: PlotData) {
    const index = this.data.indexOf(trace);
    if (index === -1) {
      throw Error('This trace is not part of the plot');
    } else {
      this.data.splice(index, 1);
      this.refresh();
    }
  }

  public drawCapture(capture: Capture, tubeColor: Color) {
    const trace: PlotData = <PlotData>{
      x: capture.uAnode,
      y: capture.iCathode,
      mode: 'lines+markers',
      type: 'scatter',
      marker: {
        color: tubeColor.toString(),
      },
      name: `${capture.uGrille}V`,
    };

    this.captureTraceMap.set(capture, trace);

    this.addTraceToPlot(trace);
  }

  public removeCapture(capture: Capture) {
    const trace = this.captureTraceMap.get(capture);
    if (trace === undefined) {
      throw Error(`Cannot remove capture ${capture.toString} from plot. This capture has never been added to the plot`);
    } else {
      this.captureTraceMap.delete(capture);
      this.removeTraceFromPlot(trace);
    }
  }

  public removeMeasure(viewMeasure: ViewMeasure) {
    this.annotations.splice(this.annotations.indexOf(viewMeasure.getShape()), 1);
    this.refresh();
  }

  public clearMeasures() {
    this.annotations.splice(0, this.annotations.length);
    this.refresh();
  }
}

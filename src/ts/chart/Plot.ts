import {
  Layout, Shape, Data, PlotMouseEvent, newPlot, redraw, PlotData,
} from 'plotly.js';
import Color from './Color';
import ViewMeasure from './ViewMeasure';
import Capture from '../model/Capture';
import ViewMeasuresManager from '../controler/ViewMeasuresManager';
import ViewTubesManager from '../controler/ViewTubesManager';
import ViewTube from './ViewTube';
import Tube from '../model/Tube';
import MeasuresManager from '../controler/MeasuresManager';

interface PlotHTMLElement extends HTMLElement {
  on(eventName: string, handler: Function): void;
}

export default class Plot {
  private rootHtml: PlotHTMLElement;

  private data: Data[] = [];

  private annotations: Shape[] = [];

  private captureTraceMap: Map<Capture, PlotData> = new Map();

  private layout: Partial<Layout> = {
    width: 900,
    height: 600,
    shapes: this.annotations,
  };

  constructor(rootHtml: HTMLElement,
    viewTubesManager: ViewTubesManager,
    viewMeasuresManager: ViewMeasuresManager,
    measureManager: MeasuresManager) {
    const createViewTubeHandler = (v: ViewTubesManager, viewTube: ViewTube) => {
      viewTube.tube.OnCreateCapture.on(
        (t: Tube, capture: Capture) => {
          this.drawCapture(capture, viewTube.getColor());
        },
      );
      viewTube.tube.OnRemoveCapture.on(
        (t: Tube, capture: Capture) => {
          this.removeCapture(capture);
        },
      );
    };
    viewTubesManager.OnCreateViewTube.on(createViewTubeHandler);

    const createViewMeasureHandler = (
      v: ViewMeasuresManager, viewMeasure: ViewMeasure,
    ) => {
      this.addViewMeasure(viewMeasure);
    };
    viewMeasuresManager.OnCreateViewMeasure.on(createViewMeasureHandler);

    const removeViewMeasureHandler = (
      v: ViewMeasuresManager, viewMeasure: ViewMeasure,
    ) => {
      this.removeViewMeasure(viewMeasure);
    };
    viewMeasuresManager.OnRemoveViewMeasure.on(removeViewMeasureHandler);

    this.rootHtml = <PlotHTMLElement>rootHtml;

    newPlot(this.rootHtml, this.data, this.layout);

    this.rootHtml.on('plotly_click', (data: PlotMouseEvent) => {
      const xClicked: number = <number>data.points[0].x;

      if (!measureManager.measureExists(xClicked)) {
        measureManager.createMeasure(xClicked);
      } else {
        measureManager.removeMeasure(xClicked);
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

  public addViewMeasure(viewMeasure: ViewMeasure) {
    this.annotations.push(viewMeasure.getShape());
    this.refresh();
  }

  public removeViewMeasure(viewMeasure: ViewMeasure) {
    this.annotations.splice(this.annotations.indexOf(viewMeasure.getShape()), 1);
    this.refresh();
  }

  public clearMeasures() {
    this.annotations.splice(0, this.annotations.length);
    this.refresh();
  }
}

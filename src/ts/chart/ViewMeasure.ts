import { Shape } from 'plotly.js';
import TubesManager from '../controler/TubesManager';
import Measure from '../model/Measure';
import Tube from '../model/Tube';
import Color from './Color';
import ViewTubeMeasure from './ViewTubeMeasure';

export default class ViewMeasure {
  private allMeasuresHtml: HTMLElement;

  public measure: Measure;

  private color: Color;

  private shape: Shape;

  private htmlElement: HTMLElement;

  private viewTubeMeasures: Map<Tube, ViewTubeMeasure> = new Map();

  constructor(
    measure: Measure, color: Color, allMeasuresHtml: HTMLElement, tubesManager: TubesManager,
  ) {
    this.measure = measure;
    this.color = color;
    this.allMeasuresHtml = allMeasuresHtml;

    this.shape = <Shape>{
      type: 'line',
      x0: measure.uAnode,
      y0: 0,
      x1: measure.uAnode,
      yref: 'paper',
      y1: 1,
      line: {
        color: color.toString(),
        width: 2,
        dash: 'dot',
      },
    };

    this.htmlElement = document.createElement('div');
    const title = document.createElement('p');
    title.textContent = `Mesure (${measure.uAnode}V)`;
    title.style.color = this.color.toString();
    this.htmlElement.appendChild(title);

    this.allMeasuresHtml.appendChild(this.htmlElement);

    const tubeMeasureCreateHandler = (_: TubesManager, tube: Tube) => {
      this.createViewTubeMeasure(tube);
    };
    tubesManager.OnCreateTube.on(tubeMeasureCreateHandler);

    const tubeMeasureRemoveHandler = (_: TubesManager, tube: Tube) => {
      this.removeViewTubeMeasure(tube);
    };
    tubesManager.OnRemoveTube.on(tubeMeasureRemoveHandler);

    tubesManager.getTubes().forEach((tube: Tube) => {
      const newViewTubeMeasure = new ViewTubeMeasure(this.measure.uAnode, tube, this.htmlElement);
      this.viewTubeMeasures.set(tube, newViewTubeMeasure);
    });
  }

  public getColor(): Color {
    return this.color;
  }

  public getShape(): Shape {
    return this.shape;
  }

  public removeDiv() {
    this.allMeasuresHtml.removeChild(this.htmlElement);
  }

  private createViewTubeMeasure(tube: Tube) {
    const newViewTubeMeasure = new ViewTubeMeasure(
      this.measure.uAnode, tube, this.htmlElement,
    );
    this.viewTubeMeasures.set(tube, newViewTubeMeasure);
  }

  private removeViewTubeMeasure(tube: Tube) {
    const viewTubeMeasure = <ViewTubeMeasure> this.viewTubeMeasures.get(tube);
    viewTubeMeasure.deleteHtml();
    this.viewTubeMeasures.delete(tube);
  }
}

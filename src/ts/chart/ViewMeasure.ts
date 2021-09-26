import { Shape } from 'plotly.js';
import Measure from '../model/Measure';
import Tube from '../model/Tube';
import TubeMeasure from '../model/TubeMeasure';
import Color from './Color';
import ViewTubeMeasure from './ViewTubeMeasure';

export default class ViewMeasure {
  private allMeasuresHtml: HTMLElement;

  public measure: Measure;

  private color: Color;

  private shape: Shape;

  private htmlElement: HTMLElement;

  private viewTubeMeasures: Map<TubeMeasure, ViewTubeMeasure> = new Map();

  constructor(measure: Measure, color: Color, allMeasuresHtml: HTMLElement) {
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

    const tubeMeasureChangeHandler = (_: Measure, tubeMeasure: TubeMeasure) => {
      this.viewTubeMeasures.get(tubeMeasure)?.updateDom();
    };
    this.measure.OnTubeMeasureChange.on(tubeMeasureChangeHandler);

    const tubeMeasureCreateHandler = (_: Measure, tubeMeasure: TubeMeasure) => {
      this.createViewTubeMeasure(tubeMeasure);
    };
    this.measure.OnTubeMeasureCreate.on(tubeMeasureCreateHandler);

    const tubeMeasureRemoveHandler = (_: Measure, tubeMeasure: TubeMeasure) => {
      this.removeViewTubeMeasure(tubeMeasure);
    };
    this.measure.OnTubeMeasureRemove.on(tubeMeasureRemoveHandler);

    this.measure.tubeMeasures.forEach((tubeMeasure: TubeMeasure, _: Tube) => {
      this.viewTubeMeasures.set(
        tubeMeasure,
        new ViewTubeMeasure(tubeMeasure, this.htmlElement),
      );
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

  private createViewTubeMeasure(tubeMeasure: TubeMeasure) {
    const newViewTubeMeasure = new ViewTubeMeasure(tubeMeasure, this.htmlElement);
    this.viewTubeMeasures.set(tubeMeasure, newViewTubeMeasure);
  }

  private removeViewTubeMeasure(tubeMeasure: TubeMeasure) {
    const viewTubeMeasure = <ViewTubeMeasure> this.viewTubeMeasures.get(tubeMeasure);
    viewTubeMeasure.deleteHtml();
    this.viewTubeMeasures.delete(tubeMeasure);
  }
}

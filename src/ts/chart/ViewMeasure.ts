import { Shape } from 'plotly.js';
import TubesManager from '../controler/TubesManager';
import Tube from '../model/Tube';
import Color from './Color';
import ViewTubeMeasure from './ViewTubeMeasure';

export default class ViewMeasure {
  private allMeasuresHtml: HTMLElement;

  public uAnodeMeasure: number;

  private color: Color;

  private shape: Shape;

  private htmlElement: HTMLElement;

  private viewTubeMeasures: Map<Tube, ViewTubeMeasure> = new Map();

  constructor(
    uAnodeMeasure: number, color: Color, allMeasuresHtml: HTMLElement, tubesManager: TubesManager,
  ) {
    this.uAnodeMeasure = uAnodeMeasure;
    this.color = color;
    this.allMeasuresHtml = allMeasuresHtml;

    this.shape = <Shape>{
      type: 'line',
      x0: uAnodeMeasure,
      y0: 0,
      x1: uAnodeMeasure,
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
    title.textContent = `Mesure (${uAnodeMeasure}V)`;
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
      const newViewTubeMeasure = new ViewTubeMeasure(this.uAnodeMeasure, tube, this.htmlElement);
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
      this.uAnodeMeasure, tube, this.htmlElement,
    );
    this.viewTubeMeasures.set(tube, newViewTubeMeasure);
  }

  private removeViewTubeMeasure(tube: Tube) {
    const viewTubeMeasure = <ViewTubeMeasure> this.viewTubeMeasures.get(tube);
    viewTubeMeasure.deleteHtml();
    this.viewTubeMeasures.delete(tube);
  }
}

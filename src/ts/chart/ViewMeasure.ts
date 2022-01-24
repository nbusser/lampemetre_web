import { Shape } from 'plotly.js';
import MeasuresManager from '../controler/MeasuresManager';
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

  private measuresManager: MeasuresManager;

  private tubesManager: TubesManager;

  private viewTubeMeasures: Map<Tube, ViewTubeMeasure> = new Map();

  private tableHtml: HTMLTableElement = <HTMLTableElement> document.createElement('table');

  private tableBody: HTMLElement = <HTMLElement> document.createElement('tbody');

  constructor(
    uAnodeMeasure: number,
    color: Color,
    allMeasuresHtml: HTMLElement,
    tubesManager: TubesManager,
    measuresManager: MeasuresManager,
  ) {
    this.uAnodeMeasure = uAnodeMeasure;
    this.color = color;
    this.allMeasuresHtml = allMeasuresHtml;
    this.measuresManager = measuresManager;

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
    this.htmlElement.classList.add('measure');

    const title = document.createElement('h2');
    title.classList.add('measure_title');
    title.style.textAlign = 'center';
    title.textContent = `${uAnodeMeasure}V`;
    title.style.color = this.color.toString();

    const removeMeasure = document.createElement('button');
    removeMeasure.classList.add('btn_remove_measure');
    removeMeasure.textContent = '-';
    removeMeasure.addEventListener('click', () => {
      this.measuresManager.removeMeasure(this.uAnodeMeasure);
    });

    const measureHeader = document.createElement('div');
    measureHeader.classList.add('measures_header');
    measureHeader.appendChild(title);
    measureHeader.appendChild(removeMeasure);

    this.htmlElement.appendChild(measureHeader);
    this.htmlElement.appendChild(this.tableHtml);

    this.tableBody.innerHTML = (`
      <tr>
        <th></th>
        <th>Courant cathode</th>
        <th>Résistance</th>
        <th>Transductance</th>
        <th>μ (coef)</th>
      </tr>
    `
    );
    this.tableHtml.appendChild(this.tableBody);

    this.allMeasuresHtml.appendChild(this.htmlElement);

    tubesManager.OnCreateTube.on(this.tubeMeasureCreateHandler);

    tubesManager.OnRemoveTube.on(this.tubeMeasureRemoveHandler);

    tubesManager.getTubes().forEach((tube: Tube) => {
      const newViewTubeMeasure = new ViewTubeMeasure(
        this.uAnodeMeasure, tube, this.measuresManager, this.tableBody,
      );
      this.viewTubeMeasures.set(tube, newViewTubeMeasure);
    });

    this.tubesManager = tubesManager;
  }

  private tubeMeasureCreateHandler = (_: TubesManager, tube: Tube) => {
    this.createViewTubeMeasure(tube);
  };

  private tubeMeasureRemoveHandler = (_: TubesManager, tube: Tube) => {
    this.removeViewTubeMeasure(tube);
  };

  public getColor(): Color {
    return this.color;
  }

  public getShape(): Shape {
    return this.shape;
  }

  private removeDiv() {
    this.allMeasuresHtml.removeChild(this.htmlElement);
  }

  public remove() {
    this.removeDiv();
    this.tubesManager.OnCreateTube.off(this.tubeMeasureCreateHandler);
    this.tubesManager.OnRemoveTube.off(this.tubeMeasureRemoveHandler);

    this.viewTubeMeasures.forEach((element: ViewTubeMeasure) => {
      element.remove();
    });
    this.viewTubeMeasures.clear();
  }

  private createViewTubeMeasure(tube: Tube) {
    const newViewTubeMeasure = new ViewTubeMeasure(
      this.uAnodeMeasure, tube, this.measuresManager, this.tableBody,
    );
    this.viewTubeMeasures.set(tube, newViewTubeMeasure);
  }

  private removeViewTubeMeasure(tube: Tube) {
    const viewTubeMeasure = <ViewTubeMeasure> this.viewTubeMeasures.get(tube);
    viewTubeMeasure.remove();
    this.viewTubeMeasures.delete(tube);
  }
}

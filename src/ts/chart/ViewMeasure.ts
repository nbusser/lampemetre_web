import Measure from '../model/Measure';
import Color from './Color';

export default class ViewMeasure {
  static measuresDiv: HTMLDivElement = <HTMLDivElement>document.getElementById('measures');

  public measure: Measure;

  private shape: Object;

  private htmlElement: HTMLElement;

  constructor(measure: Measure, color: Color) {
    this.measure = measure;

    this.shape = {
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
    this.htmlElement.appendChild(title);

    ViewMeasure.measuresDiv.appendChild(this.htmlElement);
  }

  getShape() {
    return this.shape;
  }

  removeDiv() {
    ViewMeasure.measuresDiv.removeChild(this.htmlElement);
  }
}

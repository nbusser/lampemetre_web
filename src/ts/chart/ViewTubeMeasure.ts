import TubeMeasure from '../model/TubeMeasure';

export default class ViewTubeMeasure {
  private tubeMeasure: TubeMeasure;

  private measureHtml: HTMLElement;

  private tubeMeasureHtml: HTMLElement;

  constructor(tubeMeasure: TubeMeasure, measureHtml: HTMLElement) {
    this.tubeMeasure = tubeMeasure;
    this.measureHtml = measureHtml;

    this.tubeMeasureHtml = document.createElement('div');
    this.tubeMeasureHtml.classList.add('tube_measure_div');

    const tubeMeasureDivTitle = document.createElement('p');
    tubeMeasureDivTitle.textContent = tubeMeasure.tube.name;
    this.tubeMeasureHtml.appendChild(tubeMeasureDivTitle);

    this.measureHtml.appendChild(this.tubeMeasureHtml);
  }

  public deleteHtml() {
    this.measureHtml.removeChild(this.tubeMeasureHtml);
  }

  public updateDom() {
    const result = this.tubeMeasure.performMeasure();
    console.log(result);
  }
}

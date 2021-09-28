import MeasuresManager, { MeasureResult } from '../controler/MeasuresManager';
import Capture from '../model/Capture';
import Tube from '../model/Tube';
import TubeMode from '../TubeMode';

export default class ViewTubeMeasure {
  private uAnode: number;

  private tube: Tube;

  private measuresManager: MeasuresManager;

  private measureHtml: HTMLElement;

  private tubeMeasureHtml: HTMLDivElement = <HTMLDivElement> document.createElement('div');

  private validResultHtml: HTMLDivElement = <HTMLDivElement> document.createElement('div');

  private validResultListHtml: HTMLUListElement = <HTMLUListElement> document.createElement('ul');

  private internalTrHtml: HTMLLIElement = <HTMLLIElement> document.createElement('li');

  private slopeIHtml: HTMLLIElement = <HTMLLIElement> document.createElement('li');

  private coefIHtml: HTMLLIElement = <HTMLLIElement> document.createElement('li');

  private iRefyHtml: HTMLLIElement = <HTMLLIElement> document.createElement('li');

  private uRefxHtml: HTMLLIElement = <HTMLLIElement> document.createElement('li');

  private invalidResultHtml: HTMLDivElement = <HTMLDivElement> document.createElement('div');

  private invalidReasonHtml: HTMLSpanElement = <HTMLSpanElement> document.createElement('span');

  constructor(
    uAnode: number, tube: Tube, measuresManager: MeasuresManager, measureHtml: HTMLElement,
  ) {
    this.uAnode = uAnode;
    this.tube = tube;
    this.measuresManager = measuresManager;
    this.measureHtml = measureHtml;

    this.measureHtml.appendChild(this.tubeMeasureHtml);

    this.tubeMeasureHtml.classList.add('tube_measure_div');

    const tubeMeasureTitle = document.createElement('h3');
    tubeMeasureTitle.textContent = tube.name;
    this.tubeMeasureHtml.appendChild(tubeMeasureTitle);

    this.tubeMeasureHtml.appendChild(this.validResultHtml);
    this.tubeMeasureHtml.appendChild(this.invalidResultHtml);
    this.toggleResultBlock(false);

    this.validResultHtml.appendChild(this.internalTrHtml);
    this.validResultHtml.appendChild(this.slopeIHtml);
    this.validResultHtml.appendChild(this.coefIHtml);
    this.validResultHtml.appendChild(this.iRefyHtml);
    this.validResultHtml.appendChild(this.uRefxHtml);

    this.invalidReasonHtml.classList.add('warning_sign');
    this.invalidResultHtml.appendChild(this.invalidReasonHtml);
    this.updateInvalid('/');

    const initMeasureResults: MeasureResult = {
      internalTR: -1,
      slopeI: -1,
      coefI: -1,
      iRefy: -1,
      uRefx: -1,
    };
    this.updateValid(initMeasureResults);

    this.tube.OnCreateCapture.on((tube: Tube, capture: Capture) => this.updateDom());
    this.tube.OnRemoveCapture.on((tube: Tube, capture: Capture) => this.updateDom());
    this.tube.OnModeChange.on((tube: Tube, mode: TubeMode) => this.updateDom());

    this.updateDom();
  }

  public deleteHtml() {
    this.measureHtml.removeChild(this.tubeMeasureHtml);
  }

  private updateDom() {
    try {
      const result = this.measuresManager.performMeasure(this.uAnode, this.tube);
      this.updateValid(result);
      this.toggleResultBlock(true);
    } catch (Error) {
      this.updateInvalid(Error.message);
      this.toggleResultBlock(false);
    }
  }

  private updateValid(result: MeasureResult) {
    this.internalTrHtml.textContent = `Internal TR: ${result.internalTR} Ohm`;
    this.slopeIHtml.textContent = `Pente I: ${result.slopeI} mA`;
    this.coefIHtml.textContent = `Coef I: ${result.coefI} mA`;
    this.iRefyHtml.textContent = `I ref y: ${result.iRefy} mA`;
    this.uRefxHtml.textContent = `U ref x: ${result.uRefx} mA`;
  }

  private updateInvalid(reason: string) {
    this.invalidReasonHtml.title = reason;
  }

  private toggleResultBlock(validResult: boolean) {
    this.validResultHtml.hidden = !validResult;
    this.invalidResultHtml.hidden = validResult;
  }
}

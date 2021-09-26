import Capture from '../model/Capture';
import Tube from '../model/Tube';
import TubeMode from '../TubeMode';

type MeasureResult = {
  internalTR: Number,
  slopeI: Number,
  coefI: Number,
  iRefy: Number,
  uRefx: Number
};

export default class ViewTubeMeasure {
  private uAnode: number;

  private tube: Tube;

  private measureHtml: HTMLElement;

  private tubeMeasureHtml: HTMLElement = document.createElement('div');

  private measureResultErrorHtml: HTMLElement = document.createElement('p');

  private measureResultsHtml: HTMLUListElement = document.createElement('ul');

  private internalTrHtml: HTMLLIElement = document.createElement('li');

  private slopeIHtml: HTMLLIElement = document.createElement('li');

  private coefIHtml: HTMLLIElement = document.createElement('li');

  private iRefy: HTMLLIElement = document.createElement('li');

  private uRefx: HTMLLIElement = document.createElement('li');

  constructor(uAnode: number, tube: Tube, measureHtml: HTMLElement) {
    this.uAnode = uAnode;
    this.tube = tube;
    this.measureHtml = measureHtml;

    this.tubeMeasureHtml.classList.add('tube_measure_div');

    const tubeMeasureDivTitle = document.createElement('p');
    tubeMeasureDivTitle.textContent = tube.name;
    this.tubeMeasureHtml.appendChild(tubeMeasureDivTitle);

    this.measureHtml.appendChild(this.tubeMeasureHtml);

    this.measureResultsHtml.appendChild(this.internalTrHtml);
    this.measureResultsHtml.appendChild(this.slopeIHtml);
    this.measureResultsHtml.appendChild(this.coefIHtml);
    this.measureResultsHtml.appendChild(this.iRefy);
    this.measureResultsHtml.appendChild(this.uRefx);

    this.tube.OnCreateCapture.on((tube: Tube, capture: Capture) => this.updateDom());
    this.tube.OnRemoveCapture.on((tube: Tube, capture: Capture) => this.updateDom());
    this.tube.OnModeChange.on((tube: Tube, mode: TubeMode) => this.updateDom());

    this.updateDom();
  }

  public deleteHtml() {
    this.measureHtml.removeChild(this.tubeMeasureHtml);
  }

  public updateDom() {
    const result = this.performMeasure();

    if (typeof result === 'string') {
      this.measureResultErrorHtml.textContent = '/';
      this.measureResultErrorHtml.title = result;

      if (this.tubeMeasureHtml.contains(this.measureResultsHtml)) {
        this.tubeMeasureHtml.removeChild(this.measureResultsHtml);
      }
      this.tubeMeasureHtml.appendChild(this.measureResultErrorHtml);
    } else {
      this.internalTrHtml.textContent = `Internal TR: ${result.internalTR} Ohm`;
      this.slopeIHtml.textContent = `Pente I: ${result.slopeI} mA`;
      this.coefIHtml.textContent = `Coef I: ${result.coefI} mA`;
      this.iRefy.textContent = `I ref y: ${result.iRefy} mA`;
      this.uRefx.textContent = `U ref x: ${result.uRefx} mA`;

      if (this.tubeMeasureHtml.contains(this.measureResultErrorHtml)) {
        this.tubeMeasureHtml.removeChild(this.measureResultErrorHtml);
      }
      this.tubeMeasureHtml.appendChild(this.measureResultsHtml);
    }
  }

  private performMeasure(): MeasureResult | string {
    if (this.tube.mode !== TubeMode.Triode) {
      return 'Seul le mode triode est supporté';
    }

    if (this.tube.captures.length < 2) {
      return 'Le tube doit contenir au moins deux captures';
    }

    const capturesSorted = [...this.tube.captures].sort((a: Capture, b: Capture) => {
      if (a.uGrille < b.uGrille) {
        return -1;
      } if (a.uGrille > b.uGrille) {
        return 1;
      }
      return 0;
    });

    const minGridCapture: Capture = capturesSorted[0];

    const positionUMeasure = minGridCapture.uAnode.find((uAnode) => uAnode > this.uAnode);
    if (positionUMeasure === undefined) {
      return `Aucun échantillon capturé au delà de la tension anode ${this.uAnode}V`;
    }

    let closestUanodeIndex: number;
    if (positionUMeasure === 0) {
      closestUanodeIndex = positionUMeasure;
    } else {
      const distance = (uAnode: number) => Math.abs(uAnode - this.uAnode);
      closestUanodeIndex = (
        distance(minGridCapture.uAnode[positionUMeasure])
          < distance(minGridCapture.uAnode[positionUMeasure - 1])
      ) ? positionUMeasure : positionUMeasure - 1;
    }

    const iTest = minGridCapture.iCathode[closestUanodeIndex] * 32;

    const iMeasureMin = iTest - 16;
    const positionIMeasureMin = minGridCapture.iCathode.find(
      (iCathode) => iCathode > iMeasureMin,
    );
    if (positionIMeasureMin === undefined) {
      return `Aucun échantillon ne dépasse le point de mesure minimum ${iMeasureMin}mA`;
    }
    let closestImeasureMinIndex: number;
    if (positionIMeasureMin === 0) {
      closestImeasureMinIndex = positionIMeasureMin;
    } else {
      const distance = (uAnode: number) => Math.abs(uAnode - this.uAnode);
      closestImeasureMinIndex = (
        distance(minGridCapture.uAnode[positionIMeasureMin])
          < distance(minGridCapture.uAnode[positionIMeasureMin - 1])
      ) ? positionIMeasureMin : positionIMeasureMin - 1;
    }

    const iMeasureMax = iTest + 16;
    const positionIMeasureMax = minGridCapture.iCathode.find(
      (iCathode) => iCathode > iMeasureMax,
    );
    if (positionIMeasureMax === undefined) {
      return `Aucun échantillon ne dépasse le point de mesure maximum ${iMeasureMax}mA`;
    }
    let closestImeasureMaxIndex: number;
    if (positionIMeasureMax === 0) {
      closestImeasureMaxIndex = positionIMeasureMax;
    } else {
      const distance = (uAnode: number) => Math.abs(uAnode - this.uAnode);
      closestImeasureMaxIndex = (
        distance(minGridCapture.uAnode[positionIMeasureMax])
          < distance(minGridCapture.uAnode[positionIMeasureMax - 1])
      ) ? positionIMeasureMax : positionIMeasureMax - 1;
    }

    const deltaU = minGridCapture.uAnode[closestImeasureMaxIndex]
      - minGridCapture.uAnode[closestImeasureMinIndex];

    const deltaI = minGridCapture.iCathode[closestImeasureMaxIndex]
      - minGridCapture.iCathode[closestImeasureMinIndex]
      * 0.03125;

    const internalR = Math.floor((deltaU / deltaI) * 100);
    const internalTR = Math.floor(internalR / 100) / 10;

    const curinf = capturesSorted[1].iCathode[positionUMeasure];

    let deltaIGrid = minGridCapture.iCathode[positionUMeasure] - curinf;

    const slopeI = Math.floor(deltaIGrid * 3.125) / 100;

    deltaIGrid = Math.floor(deltaIGrid * 31.25);

    const coefI = Math.floor((internalR * deltaIGrid) / 1000000);

    const iRefy = Math.floor(minGridCapture.iCathode[positionUMeasure] * 0.03125 * 10) / 10;

    return {
      internalTR,
      slopeI,
      coefI,
      iRefy,
      uRefx: 0,
    };
  }
}

import Signal from '../Signal';
import TubeMode from '../TubeMode';
import Capture from './Capture';
import Tube from './Tube';

type MeasureResult = {
  internalTR: Number,
  slopeI: Number,
  coefI: Number,
  iRefy: Number,
  uRefx: Number
};

export default class TubeMeasure {
  public uAnode: number;

  public tube: Tube;

  public measureResult: MeasureResult | string = '\\';

  private readonly onChange = new Signal<TubeMeasure, undefined>();

  public get OnChange(): Signal<TubeMeasure, undefined> {
    return this.onChange;
  }

  constructor(uAnode: number, tube: Tube) {
    this.uAnode = uAnode;
    this.tube = tube;

    this.tube.OnCreateCapture.on((t: Tube, c: Capture) => this.OnChange.trigger(this, undefined));
    this.tube.OnRemoveCapture.on((t: Tube, c: Capture) => this.OnChange.trigger(this, undefined));
    this.tube.OnModeChange.on((t: Tube, m: TubeMode) => this.OnChange.trigger(this, undefined));
  }

  public performMeasure(): MeasureResult | string {
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
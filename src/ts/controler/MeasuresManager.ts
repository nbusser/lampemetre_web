import Capture from '../model/Capture';
import Tube from '../model/Tube';
import Signal from '../Signal';
import TubeMode from '../TubeMode';

export type MeasureResult = {
  internalTR: Number,
  slopeI: Number,
  coefI: Number,
  iRefy: Number,
  uRefx: Number
};

export default class MeasuresManager {
  private measuresMap: Map<number, boolean> = new Map();

  private readonly onCreateMeasure = new Signal<MeasuresManager, number>();

  private readonly onRemoveMeasure = new Signal<MeasuresManager, number>();

  public get OnCreateMeasure(): Signal<MeasuresManager, number> {
    return this.onCreateMeasure;
  }

  public get OnRemoveMeasure(): Signal<MeasuresManager, number> {
    return this.onRemoveMeasure;
  }

  public createMeasure(uAnode: number) {
    if (this.measuresMap.has(uAnode)) {
      throw Error(`A measure for ${uAnode} has already been created`);
    }
    this.measuresMap.set(uAnode, true);
    this.onCreateMeasure.trigger(this, uAnode);
  }

  public removeMeasure(uAnode: number) {
    this.measuresMap.delete(uAnode);
    this.onRemoveMeasure.trigger(this, uAnode);
  }

  public measureExists(uAnode: number): boolean {
    return this.measuresMap.has(uAnode);
  }

  public clearMeasures() {
    this.measuresMap.forEach((_, uAnode) => {
      this.removeMeasure(uAnode);
    });
  }

  public performMeasure(uAnode: number, tube: Tube): MeasureResult {
    if (!this.measureExists(uAnode)) {
      throw Error(`Aucune mesure pour la valeur ${uAnode}V`);
    }

    if (tube.mode !== TubeMode.Triode) {
      throw Error('Seul le mode triode est supporté');
    }

    if (tube.captures.size < 2) {
      throw Error('Le tube doit contenir au moins deux captures');
    }

    const capturesSorted = [...tube.captures.values()].sort((a: Capture, b: Capture) => {
      if (a.uGrille < b.uGrille) {
        return -1;
      } if (a.uGrille > b.uGrille) {
        return 1;
      }
      return 0;
    });

    const minGridCapture: Capture = capturesSorted[0];

    const positionUMeasure = minGridCapture.uAnode.find((uAnode2) => uAnode2 > uAnode);
    if (positionUMeasure === undefined) {
      throw Error(`Aucun échantillon capturé au delà de la tension anode ${uAnode}V`);
    }

    let closestUanodeIndex: number;
    if (positionUMeasure === 0) {
      closestUanodeIndex = positionUMeasure;
    } else {
      const distance = (uAnode2: number) => Math.abs(uAnode2 - uAnode);
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
      throw Error(`Aucun échantillon ne dépasse le point de mesure minimum ${iMeasureMin}mA`);
    }
    let closestImeasureMinIndex: number;
    if (positionIMeasureMin === 0) {
      closestImeasureMinIndex = positionIMeasureMin;
    } else {
      const distance = (uAnode2: number) => Math.abs(uAnode2 - uAnode);
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
      throw Error(`Aucun échantillon ne dépasse le point de mesure maximum ${iMeasureMax}mA`);
    }
    let closestImeasureMaxIndex: number;
    if (positionIMeasureMax === 0) {
      closestImeasureMaxIndex = positionIMeasureMax;
    } else {
      const distance = (uAnode2: number) => Math.abs(uAnode2 - uAnode);
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

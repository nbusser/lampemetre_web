import Capture from '../model/Capture';
import Tube from '../model/Tube';
import Signal from '../Signal';
import TubeMode from '../TubeMode';

export type MeasureResult = {
  internalResistance: Number,
  transductance: Number,
  amplificationFactor: Number,
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

    const positionUMeasure = minGridCapture.uAnode.findIndex((uAnode2) => uAnode2 > uAnode);
    if (positionUMeasure === -1) {
      throw Error(`Aucun échantillon capturé au delà de la tension anode ${uAnode}V`);
    }

    const distance = (goal: number, uAnode2: number) => Math.abs(uAnode2 - goal);

    let closestUanodeIndex: number;
    if (positionUMeasure === 0) {
      closestUanodeIndex = positionUMeasure;
    } else {
      closestUanodeIndex = (
        distance(uAnode, minGridCapture.uAnode[positionUMeasure])
          < distance(uAnode, minGridCapture.uAnode[positionUMeasure - 1])
      ) ? positionUMeasure : positionUMeasure - 1;
    }
    const iMeasure = minGridCapture.iCathode[closestUanodeIndex];

    const iMeasureMin = iMeasure - 0.5;

    const positionIMeasureMin = minGridCapture.iCathode.findIndex(
      (iCathode) => iCathode > iMeasureMin,
    );

    if (positionIMeasureMin === -1) {
      throw Error(`Aucun échantillon ne dépasse le point de mesure minimum ${iMeasureMin}mA`);
    }
    let closestImeasureMinIndex: number;
    if (positionIMeasureMin === 0) {
      closestImeasureMinIndex = positionIMeasureMin;
    } else {
      closestImeasureMinIndex = (
        distance(iMeasureMin, minGridCapture.iCathode[positionIMeasureMin])
          < distance(iMeasureMin, minGridCapture.iCathode[positionIMeasureMin - 1])
      ) ? positionIMeasureMin : positionIMeasureMin - 1;
    }

    const iMeasureMax = iMeasure + 0.5;

    const positionIMeasureMax = minGridCapture.iCathode.findIndex(
      (iCathode) => iCathode > iMeasureMax,
    );
    if (positionIMeasureMax === -1) {
      throw Error(`Aucun échantillon ne dépasse le point de mesure maximum ${iMeasureMax}mA`);
    }
    let closestImeasureMaxIndex: number;
    if (positionIMeasureMax === 0) {
      closestImeasureMaxIndex = positionIMeasureMax;
    } else {
      closestImeasureMaxIndex = (
        distance(iMeasureMin, minGridCapture.iCathode[positionIMeasureMax])
          < distance(iMeasureMin, minGridCapture.iCathode[positionIMeasureMax - 1])
      ) ? positionIMeasureMax : positionIMeasureMax - 1;
    }

    const deltaU = minGridCapture.uAnode[closestImeasureMaxIndex]
      - minGridCapture.uAnode[closestImeasureMinIndex];

    const deltaI = minGridCapture.iCathode[closestImeasureMaxIndex]
      - minGridCapture.iCathode[closestImeasureMinIndex];

    const internalR = deltaU / deltaI;
    const internalResistance = internalR;

    const lowGrid = capturesSorted[1];

    const transductance = Math.abs(
      (iMeasure - lowGrid.iCathode[closestUanodeIndex])
      / (minGridCapture.uGrille - lowGrid.uGrille),
    );

    const positionIMeasureLowGrid = lowGrid.iCathode.findIndex(
      (iCathode) => iCathode > iMeasure,
    );
    if (positionIMeasureLowGrid === -1) {
      throw Error(`Aucun échantillon ne dépasse le point de mesure maximum ${iMeasure}mA pour la capture ${lowGrid.toString()}`);
    }
    let closestImeasureLowGrid: number;
    if (positionIMeasureLowGrid === 0) {
      closestImeasureLowGrid = positionIMeasureLowGrid;
    } else {
      closestImeasureLowGrid = (
        distance(iMeasure, lowGrid.iCathode[positionIMeasureLowGrid])
          < distance(iMeasure, lowGrid.iCathode[positionIMeasureLowGrid - 1])
      ) ? positionIMeasureLowGrid : positionIMeasureLowGrid - 1;
    }
    const amplificationFactor = Math.abs(
      lowGrid.uAnode[closestImeasureLowGrid] - uAnode,
    );

    return {
      internalResistance,
      transductance,
      amplificationFactor,
    };
  }
}

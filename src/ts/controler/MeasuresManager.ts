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
      if (a.uGrid < b.uGrid) {
        return -1;
      } if (a.uGrid > b.uGrid) {
        return 1;
      }
      return 0;
    });

    const minGridCapture: Capture = capturesSorted[0];

    const getClosestIndex = (list: number[], refValue: number): number | null => {
      const roughPosition = list.findIndex(
        (value) => value >= refValue,
      );
      if (roughPosition === -1) {
        return null;
      }
      if (roughPosition === 0) {
        return roughPosition;
      }

      return (
        Math.abs(refValue - list[roughPosition])
          < Math.abs(refValue - list[roughPosition - 1])
      ) ? roughPosition : roughPosition - 1;
    };

    let closestUanodeIndex = getClosestIndex(minGridCapture.uAnode, uAnode);
    if (closestUanodeIndex === null) {
      throw Error(`Aucun échantillon capturé au delà de la tension anode ${uAnode}V`);
    } else if (closestUanodeIndex === 0) {
      closestUanodeIndex += 1;
    } else if (closestUanodeIndex === minGridCapture.uAnode.length - 1) {
      closestUanodeIndex -= 1;
    }

    const lowerMean = (
      (minGridCapture.uAnode[closestUanodeIndex] - minGridCapture.uAnode[closestUanodeIndex - 1])
      / (
        minGridCapture.iCathode[closestUanodeIndex]
        - minGridCapture.iCathode[closestUanodeIndex - 1]
      )
    );
    const upperMean = (
      (minGridCapture.uAnode[closestUanodeIndex + 1] - minGridCapture.uAnode[closestUanodeIndex])
      / (
        minGridCapture.iCathode[closestUanodeIndex + 1]
        - minGridCapture.iCathode[closestUanodeIndex]
      )
    );
    const internalResistance = (lowerMean + upperMean) / 2;

    const iMeasure = minGridCapture.iCathode[closestUanodeIndex];

    const lowGrid = capturesSorted[1];
    const transductance = Math.abs(
      (iMeasure - lowGrid.iCathode[closestUanodeIndex])
      / (minGridCapture.uGrid - lowGrid.uGrid),
    );

    const closestImeasureLowGrid = getClosestIndex(lowGrid.iCathode, iMeasure);
    if (closestImeasureLowGrid === null) {
      throw Error(`Aucun échantillon ne dépasse le point de mesure ${iMeasure}mA pour la capture ${lowGrid.toString()}`);
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

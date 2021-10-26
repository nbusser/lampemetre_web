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

  public performMeasure(uAnode: number, tube: Tube, uGrid: number): MeasureResult {
    if (!this.measureExists(uAnode)) {
      throw Error(`Aucune mesure pour la valeur ${uAnode}V`);
    }

    if (tube.mode !== TubeMode.Triode) {
      throw Error('Seul le mode triode est supporté');
    }

    const gridCapture = tube.captures.get(uGrid);
    if (gridCapture === undefined) {
      throw Error(`No capture ${uGrid}V for tube ${tube.name}`);
    }

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

    let closestUanodeIndex = getClosestIndex(gridCapture.uAnode, uAnode);
    if (closestUanodeIndex === null) {
      throw Error(`Aucun échantillon capturé au delà de la tension anode ${uAnode}V`);
    } else if (closestUanodeIndex === 0) {
      closestUanodeIndex += 1;
    } else if (closestUanodeIndex === gridCapture.uAnode.length - 1) {
      closestUanodeIndex -= 1;
    }

    const lowerMean = (
      (gridCapture.uAnode[closestUanodeIndex] - gridCapture.uAnode[closestUanodeIndex - 1])
      / (
        gridCapture.iCathode[closestUanodeIndex]
        - gridCapture.iCathode[closestUanodeIndex - 1]
      )
    );
    const upperMean = (
      (gridCapture.uAnode[closestUanodeIndex + 1] - gridCapture.uAnode[closestUanodeIndex])
      / (
        gridCapture.iCathode[closestUanodeIndex + 1]
        - gridCapture.iCathode[closestUanodeIndex]
      )
    );
    const internalResistance = (lowerMean + upperMean) / 2;

    // Transductance and amplification factor calculation require at least 2 captures

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

    const iMeasure = gridCapture.iCathode[closestUanodeIndex];

    // Transductance calculation is always possible

    const calculateTransductance = (relativeCapture: Capture): number => Math.abs(
      (iMeasure - relativeCapture.iCathode[<number> closestUanodeIndex])
        / (gridCapture.uGrid - relativeCapture.uGrid),
    );

    const captureIndex = <number> capturesSorted.findIndex((cap) => cap === gridCapture);
    let transductance;
    if (captureIndex !== 0) {
      transductance = calculateTransductance(capturesSorted[captureIndex - 1]);
    } else {
      transductance = calculateTransductance(capturesSorted[captureIndex + 1]);
    }

    // Amplification factor calculation is not always possible

    const calculateAmplificationFactor = (relativeCapture: Capture): number | null => {
      const closestImeasureLowGrid = getClosestIndex(relativeCapture.iCathode, iMeasure);
      if (closestImeasureLowGrid === null) {
        return null;
      }
      return Math.abs(
        relativeCapture.uAnode[closestImeasureLowGrid] - uAnode,
      );
    };

    let amplificationFactor = null;
    if (captureIndex !== 0) {
      amplificationFactor = calculateAmplificationFactor(capturesSorted[captureIndex - 1]);
    }
    if (amplificationFactor === null) {
      amplificationFactor = calculateAmplificationFactor(capturesSorted[captureIndex + 1]);
    }

    if (amplificationFactor === null) {
      throw Error(`Aucun échantillon ne dépasse le point de mesure ${iMeasure}mA parmi les captures secondaires`);
    }

    return {
      internalResistance,
      transductance,
      amplificationFactor,
    };
  }
}

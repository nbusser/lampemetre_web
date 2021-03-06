import Capture from '../model/Capture';
import Tube from '../model/Tube';
import Signal from '../Signal';

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

  public getMeasures(): number[] {
    return [...this.measuresMap.keys()];
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

  private checkAndGetCapture(uAnode: number, tube: Tube, uGrid: number | null): Capture | string {
    if (uGrid === null) {
      throw Error('uGrid is not supposed to be null at this point');
    }

    if (!this.measureExists(uAnode)) {
      throw Error(`No measure for tension value ${uAnode}V`);
    }

    const gridCapture = tube.captures.get(uGrid);
    if (gridCapture === undefined) {
      throw Error(`No capture ${uGrid}V for tube ${tube.name}`);
    }

    return gridCapture;
  }

  private getClosestIndex = (list: number[], refValue: number): number | null => {
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

  private getClosestUanode = (capture: Capture, uAnode: number) => {
    let closestUanodeIndex = this.getClosestIndex(capture.uAnode, uAnode);
    if (closestUanodeIndex === null) {
      throw Error(`Aucun ??chantillon captur?? au del?? de la tension anode ${uAnode}V`);
    } else if (closestUanodeIndex === 0) {
      closestUanodeIndex += 1;
    } else if (closestUanodeIndex === capture.uAnode.length - 1) {
      closestUanodeIndex -= 1;
    }
    return closestUanodeIndex;
  };

  public getSelectedIcathode(uAnode: number, tube: Tube, uGrid: number | null) : number | string {
    if (tube.captures.size < 1) {
      return 'Le tube doit contenir au moins une capture';
    }

    const gridCapture = this.checkAndGetCapture(uAnode, tube, uGrid);
    if (typeof gridCapture === 'string') {
      return gridCapture;
    }

    const closestUanodeIndex = this.getClosestUanode(gridCapture, uAnode);

    return Number.parseFloat(gridCapture.iCathode[closestUanodeIndex].toFixed(2));
  }

  public computeInternalResistance(uAnode: number, tube:Tube, uGrid: number | null)
    : number | string {
    if (tube.captures.size < 1) {
      return 'Le tube doit contenir au moins une capture';
    }

    const gridCapture = this.checkAndGetCapture(uAnode, tube, uGrid);
    if (typeof gridCapture === 'string') {
      return gridCapture;
    }

    const closestUanodeIndex = this.getClosestUanode(gridCapture, uAnode);

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
    return (lowerMean + upperMean) / 2;
  }

  private getSortedCaptures = (tube: Tube) => {
    const capturesSorted = [...tube.captures.values()].sort((a: Capture, b: Capture) => {
      if (a.uGrid < b.uGrid) {
        return -1;
      } if (a.uGrid > b.uGrid) {
        return 1;
      }
      return 0;
    });
    return capturesSorted;
  };

  public computeTransductance(uAnode: number, tube: Tube, uGrid: number | null): number | string {
    // Transductance and amplification factor calculation require at least 2 captures
    if (tube.captures.size < 2) {
      return 'Le tube doit contenir au moins deux captures';
    }

    const gridCapture = this.checkAndGetCapture(uAnode, tube, uGrid);
    if (typeof gridCapture === 'string') {
      return gridCapture;
    }

    const capturesSorted = this.getSortedCaptures(tube);

    const closestUanodeIndex = this.getClosestUanode(gridCapture, uAnode);
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

    return transductance;
  }

  public computeAmplificationFactor(uAnode: number, tube: Tube, uGrid: number | null)
    : number | string {
    // Transductance and amplification factor calculation require at least 2 captures
    if (tube.captures.size < 2) {
      return 'Le tube doit contenir au moins deux captures';
    }

    const gridCapture = this.checkAndGetCapture(uAnode, tube, uGrid);
    if (typeof gridCapture === 'string') {
      return gridCapture;
    }

    // Transductance and amplification factor calculation require at least 2 captures

    if (tube.captures.size < 2) {
      return 'Le tube doit contenir au moins deux captures';
    }

    const capturesSorted = this.getSortedCaptures(tube);

    const closestUanodeIndex = this.getClosestUanode(gridCapture, uAnode);
    const iMeasure = gridCapture.iCathode[closestUanodeIndex];

    // Amplification factor calculation is not always possible

    const calculateAmplificationFactor = (relativeCapture: Capture): number | null => {
      const closestImeasure = this.getClosestIndex(relativeCapture.iCathode, iMeasure);

      if (closestImeasure === null) {
        return null;
      }
      return Math.abs(
        (relativeCapture.uAnode[closestImeasure] - uAnode)
        / (gridCapture.uGrid - relativeCapture.uGrid),
      );
    };

    const captureIndex = <number> capturesSorted.findIndex((cap) => cap === gridCapture);
    let amplificationFactor = null;
    if (captureIndex !== 0) {
      amplificationFactor = calculateAmplificationFactor(capturesSorted[captureIndex - 1]);
    }
    if (amplificationFactor === null) {
      amplificationFactor = calculateAmplificationFactor(capturesSorted[captureIndex + 1]);
    }

    if (amplificationFactor !== null) {
      return amplificationFactor;
    }
    return 'Impossible de calculer le facteur d\'amplification avec ces captures';
  }
}

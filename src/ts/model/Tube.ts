import { FrozenTube } from '../FrozenData';
import Signal from '../Signal';
import Capture from './Capture';

export default class Tube {
  public name: string;

  public captures: Map<number, Capture> = new Map();

  public selectedCapture: Capture | null = null;

  private readonly onCreateCapture = new Signal<Tube, Capture>();

  private readonly onRemoveCapture = new Signal<Tube, Capture>();

  private readonly onSelectedCaptureChange = new Signal<Tube, Capture | null>();

  public get OnCreateCapture(): Signal<Tube, Capture> {
    return this.onCreateCapture;
  }

  public get OnRemoveCapture(): Signal<Tube, Capture> {
    return this.onRemoveCapture;
  }

  public get OnSelectedCaptureChange(): Signal<Tube, Capture | null> {
    return this.onSelectedCaptureChange;
  }

  constructor(name: string) {
    this.name = name;
  }

  createCapture(uAnode: number[], uGrid: number, values: number[]) {
    const createdCapture = new Capture(uAnode, uGrid, values);

    if (this.captures.has(uGrid)) {
      this.deleteCaptureByUgrid(uGrid);
    }

    this.captures.set(uGrid, createdCapture);
    this.onCreateCapture.trigger(this, createdCapture);
  }

  deleteCapture(capture: Capture) {
    this.deleteCaptureByUgrid(capture.uGrid);
    if (capture === this.selectedCapture) {
      this.selectedCapture = null;
      this.onSelectedCaptureChange.trigger(this, null);
    }
  }

  deleteCaptureByUgrid(uGrid: number) {
    const toDelete = this.captures.get(uGrid);

    if (toDelete === undefined) {
      throw Error(`Capture for tension grid ${uGrid} does not belong to tube ${this.name}`);
    }
    this.captures.delete(uGrid);
    this.onRemoveCapture.trigger(this, toDelete);
  }

  changeSelectedCapture(newSelectedCapture: Capture) {
    if (!this.captures.has(newSelectedCapture.uGrid)) {
      throw Error(`No capture ${newSelectedCapture.toString()} for tube ${this.name}`);
    }
    this.selectedCapture = newSelectedCapture;
    this.onSelectedCaptureChange.trigger(this, newSelectedCapture);
  }

  public toJSON(): FrozenTube {
    const captures = [...this.captures.values()];
    let selectedCaptureIndex = -1;
    if (this.selectedCapture !== null) {
      selectedCaptureIndex = captures.findIndex((capture) => capture === this.selectedCapture);
    }

    return {
      name: this.name,
      captures,
      selectedCaptureIndex,
    };
  }
}

import Signal from '../Signal';
import TubeMode from '../TubeMode';
import Capture from './Capture';

export default class Tube {
  public name: string;

  public mode: TubeMode;

  public captures: Map<number, Capture> = new Map();

  private readonly onModeChange = new Signal<Tube, TubeMode>();

  private readonly onCreateCapture = new Signal<Tube, Capture>();

  private readonly onRemoveCapture = new Signal<Tube, Capture>();

  public get OnModeChange(): Signal<Tube, TubeMode> {
    return this.onModeChange;
  }

  public get OnCreateCapture(): Signal<Tube, Capture> {
    return this.onCreateCapture;
  }

  public get OnRemoveCapture(): Signal<Tube, Capture> {
    return this.onRemoveCapture;
  }

  constructor(name: string, mode: TubeMode) {
    this.name = name;
    this.mode = mode;
  }

  changeMode(newMode: TubeMode) {
    this.mode = newMode;
    this.OnModeChange.trigger(this, newMode);
  }

  createCapture(uAnode: number[], uGrille: number, values: number[]) {
    const createdCapture = new Capture(uAnode, uGrille, values);

    if (this.captures.has(uGrille)) {
      this.deleteCaptureByUgrid(uGrille);
    }

    this.captures.set(uGrille, createdCapture);
    this.onCreateCapture.trigger(this, createdCapture);
  }

  deleteCapture(capture: Capture) {
    this.deleteCaptureByUgrid(capture.uGrille);
  }

  deleteCaptureByUgrid(uGrid: number) {
    const toDelete = this.captures.get(uGrid);

    if (toDelete === undefined) {
      throw Error(`Capture for tension grid ${uGrid} does not belong to tube ${this.name}`);
    }
    this.captures.delete(uGrid);
    this.onRemoveCapture.trigger(this, toDelete);
  }
}

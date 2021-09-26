import Signal from '../Signal';
import TubeMode from '../TubeMode';
import Capture from './Capture';

export default class Tube {
  public name: string;

  public mode: TubeMode;

  public captures: Capture[] = [];

  private readonly onCreateCapture = new Signal<Tube, Capture>();

  private readonly onRemoveCapture = new Signal<Tube, Capture>();

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

  createCapture(uAnode: number[], uGrille: number, values: number[]) {
    const createdCapture = new Capture(uAnode, uGrille, values);
    this.captures.push(createdCapture);
    this.onCreateCapture.trigger(this, createdCapture);
  }

  deleteCapture(capture: Capture) {
    const index = this.captures.indexOf(capture);
    if (index === -1) {
      throw Error(`Capture ${capture.toString()} does not belong to tube ${this.name}`);
    } else {
      this.captures.splice(index, 1);
    }
    this.onRemoveCapture.trigger(this, capture);
  }
}

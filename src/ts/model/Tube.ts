import TubeMode from '../TubeMode';
import Capture from './Capture';

export default class Tube {
  public name: string;

  public mode: TubeMode;

  public captures: Capture[] = [];

  constructor(name: string, mode: TubeMode) {
    this.name = name;
    this.mode = mode;
  }

  createCapture(uAnode: number[], uGrille: number, values: number[]): Capture {
    const createdCapture = new Capture(uAnode, uGrille, values);
    this.captures.push(createdCapture);
    return createdCapture;
  }

  deleteCapture(capture: Capture) {
    const index = this.captures.indexOf(capture);
    if (index === -1) {
      throw Error(`Capture ${capture.toString()} does not belong to tube ${this.name}`);
    } else {
      this.captures.splice(index, 1);
    }
  }
}

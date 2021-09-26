import Signal from '../Signal';
import Tube from './Tube';

export default class TubeMeasure {
  public uAnode: number;

  public tube: Tube;

  private readonly onChange = new Signal<TubeMeasure, undefined>();

  public get OnChange(): Signal<TubeMeasure, undefined> {
    return this.onChange;
  }

  constructor(uAnode: number, tube: Tube) {
    this.uAnode = uAnode;
    this.tube = tube;

    this.tube.OnCreateCapture.on((t: Tube, c: Capture) => this.performMeasure());
    this.tube.OnRemoveCapture.on((t: Tube, c: Capture) => this.performMeasure());
    this.tube.OnModeChange.on((t: Tube, c: Capture) => this.performMeasure());
  }

  private performMeasure() {
    this.onChange.trigger(this, undefined);
  }
}

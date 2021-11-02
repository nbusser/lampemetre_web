import Tube from '../model/Tube';
import Signal from '../Signal';

export default class TubesManager {
  private tubesList: Array<Tube> = [];

  private nextTubeId = 0;

  private tubeToTubeId: Map<Tube, number> = new Map();

  private readonly onCreateTube = new Signal<TubesManager, Tube>();

  private readonly onRemoveTube = new Signal<TubesManager, Tube>();

  public get OnCreateTube(): Signal<TubesManager, Tube> {
    return this.onCreateTube;
  }

  public get OnRemoveTube(): Signal<TubesManager, Tube> {
    return this.onRemoveTube;
  }

  public createTube(name: string) {
    const tube = new Tube(name);
    this.tubesList.push(tube);
    this.onCreateTube.trigger(this, tube);

    this.tubeToTubeId.set(tube, this.nextTubeId);
    this.nextTubeId += 1;
  }

  public getTubes(): Array<Tube> {
    return [...this.tubesList];
  }

  public removeTube(tube: Tube) {
    this.tubesList.splice(this.tubesList.indexOf(tube), 1);
    this.tubeToTubeId.delete(tube);
    this.onRemoveTube.trigger(this, tube);
  }

  public clearTubes() {
    while (this.tubesList.length !== 0) {
      this.removeTube(this.tubesList[0]);
    }
  }

  public getTubeId(tube: Tube) {
    if (!this.tubeToTubeId.has(tube)) {
      throw Error(`No such tube ${tube.name}`);
    }
    return this.tubeToTubeId.get(tube);
  }
}

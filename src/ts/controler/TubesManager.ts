import Tube from '../model/Tube';
import Signal from '../Signal';
import TubeMode from '../TubeMode';

export default class TubesManager {
  private tubesList: Array<Tube> = [];

  private readonly onCreateTube = new Signal<TubesManager, Tube>();

  private readonly onRemoveTube = new Signal<TubesManager, Tube>();

  public get OnCreateTube(): Signal<TubesManager, Tube> {
    return this.onCreateTube;
  }

  public get OnRemoveTube(): Signal<TubesManager, Tube> {
    return this.onRemoveTube;
  }

  public createTube(name: string, mode: TubeMode) {
    const tube = new Tube(name, mode);
    this.tubesList.push(tube);
    this.onCreateTube.trigger(this, tube);
  }

  public getTubes(): Array<Tube> {
    return [...this.tubesList];
  }

  public removeTube(tube: Tube) {
    this.tubesList.splice(this.tubesList.indexOf(tube), 1);
    this.onRemoveTube.trigger(this, tube);
  }

  public clearTubes() {
    while (this.tubesList.length !== 0) {
      this.removeTube(this.tubesList[0]);
    }
  }
}

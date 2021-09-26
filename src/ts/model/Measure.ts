import TubesManager from '../controler/TubesManager';
import Signal from '../Signal';
import Tube from './Tube';
import TubeMeasure from './TubeMeasure';

export default class Measure {
  public uAnode: number;

  public tubeMeasures :Map<Tube, TubeMeasure> = new Map();

  private readonly onTubeMeasureCreate = new Signal<Measure, TubeMeasure>();

  public get OnTubeMeasureCreate(): Signal<Measure, TubeMeasure> {
    return this.onTubeMeasureCreate;
  }

  private readonly onTubeMeasureRemove = new Signal<Measure, TubeMeasure>();

  public get OnTubeMeasureRemove(): Signal<Measure, TubeMeasure> {
    return this.onTubeMeasureRemove;
  }

  private readonly onTubeMeasureChange = new Signal<Measure, TubeMeasure>();

  public get OnTubeMeasureChange(): Signal<Measure, TubeMeasure> {
    return this.onTubeMeasureChange;
  }

  constructor(uAnode: number, tubeManager: TubesManager) {
    this.uAnode = uAnode;

    tubeManager.getTubes().forEach((tube: Tube) => {
      this.createTubeMeasure(tube);
    });

    const onCreateTubeHandler = ((_: TubesManager, tube: Tube) => {
      this.createTubeMeasure(tube);
    });
    tubeManager.OnCreateTube.on(onCreateTubeHandler);

    const onRemoveTubeHandler = ((_: TubesManager, tube: Tube) => {
      this.removeTubeMeasure(tube);
    });
    tubeManager.OnCreateTube.on(onRemoveTubeHandler);
  }

  private createTubeMeasure(tube: Tube) {
    const tubeMeasure = new TubeMeasure(this.uAnode, tube);
    this.tubeMeasures.set(tube, tubeMeasure);

    const tubeMeasureOnChangeHandler = ((t: TubeMeasure, _: undefined) => {
      this.onTubeMeasureChange.trigger(this, t);
    });
    tubeMeasure.OnChange.on(tubeMeasureOnChangeHandler);

    this.onTubeMeasureCreate.trigger(this, tubeMeasure);
  }

  private removeTubeMeasure(tube: Tube) {
    const tubeMeasure: TubeMeasure = <TubeMeasure> this.tubeMeasures.get(tube);
    this.tubeMeasures.delete(tube);

    this.onTubeMeasureRemove.trigger(this, tubeMeasure);
  }
}

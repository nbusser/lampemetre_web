import Measure from '../model/Measure';
import Signal from '../Signal';
import TubesManager from './TubesManager';

export default class MeasuresManager {
  private measuresMap: Map<number, Measure> = new Map();

  private tubesManager: TubesManager;

  private readonly onCreateMeasure = new Signal<MeasuresManager, Measure>();

  private readonly onRemoveMeasure = new Signal<MeasuresManager, Measure>();

  public get OnCreateMeasure(): Signal<MeasuresManager, Measure> {
    return this.onCreateMeasure;
  }

  public get OnRemoveMeasure(): Signal<MeasuresManager, Measure> {
    return this.onRemoveMeasure;
  }

  constructor(tubesManager: TubesManager) {
    this.tubesManager = tubesManager;
  }

  public createMeasure(uAnode: number) {
    if (this.measuresMap.has(uAnode)) {
      throw Error(`A measure for ${uAnode} has already been created`);
    }
    const measure = new Measure(uAnode);
    this.measuresMap.set(uAnode, measure);
    this.onCreateMeasure.trigger(this, measure);
  }

  public removeMeasure(uAnode: number) {
    const measure: Measure = <Measure> this.measuresMap.get(uAnode);
    this.measuresMap.delete(uAnode);
    this.onRemoveMeasure.trigger(this, measure);
  }

  public getMeasure(uAnode: number): Measure | undefined {
    return this.measuresMap.get(uAnode);
  }

  public clearMeasures() {
    this.measuresMap.forEach((measure, uAnode) => {
      this.removeMeasure(uAnode);
    });
  }
}

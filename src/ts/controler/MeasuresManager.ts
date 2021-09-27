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
}

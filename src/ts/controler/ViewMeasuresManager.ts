import { Stack } from 'stack-typescript';
import Color from '../chart/Color';
import ViewMeasure from '../chart/ViewMeasure';
import Measure from '../model/Measure';
import Signal from '../Signal';
import MeasuresManager from './MeasuresManager';

export default class ViewMeasuresManager {
  private measuresMap: Map<Measure, ViewMeasure> = new Map();

  private colors: Stack<Color> = new Stack<Color>(
    new Color(0, 0, 255, 1.0),
    new Color(255, 0, 0, 1.0),
    new Color(0, 255, 0, 1.0),
    new Color(255, 255, 0, 1.0),
    new Color(255, 0, 255, 1.0),
  );

  private defaultColor: Color = new Color(0, 0, 0, 1.0);

  private readonly onCreateViewMeasure = new Signal<ViewMeasuresManager, ViewMeasure>();

  private readonly onRemoveViewMeasure = new Signal<ViewMeasuresManager, ViewMeasure>();

  public get OnCreateViewMeasure(): Signal<ViewMeasuresManager, ViewMeasure> {
    return this.onCreateViewMeasure;
  }

  public get OnRemoveViewMeasure(): Signal<ViewMeasuresManager, ViewMeasure> {
    return this.onRemoveViewMeasure;
  }

  constructor(measuresManager: MeasuresManager) {
    const onCreateMeasureHandler = (_: MeasuresManager, measure: Measure) => {
      this.createViewMeasure(measure);
    };
    measuresManager.OnCreateMeasure.on(onCreateMeasureHandler);

    const onRemoveMeasureHandler = (_: MeasuresManager, measure: Measure) => {
      this.removeViewMeasure(measure);
    };
    measuresManager.OnRemoveMeasure.on(onRemoveMeasureHandler);
  }

  private createViewMeasure(measure: Measure) {
    if (this.measuresMap.get(measure) !== undefined) {
      throw Error(`There is already a ViewMeasure for ${measure.uAnode} measure`);
    }

    let color: Color = this.colors.pop();
    if (color === undefined) {
      color = this.defaultColor;
    }

    const createdViewMeasure = new ViewMeasure(measure, color);
    this.measuresMap.set(measure, createdViewMeasure);

    this.onCreateViewMeasure.trigger(this, createdViewMeasure);
  }

  private removeViewMeasure(measure: Measure) {
    const viewMeasure: ViewMeasure = <ViewMeasure> this.measuresMap.get(measure);

    this.colors.push(viewMeasure.getColor());

    viewMeasure.removeDiv();

    this.onRemoveViewMeasure.trigger(this, viewMeasure);
  }

  public getViewMeasure(measure: Measure): ViewMeasure | undefined {
    return this.measuresMap.get(measure);
  }
}

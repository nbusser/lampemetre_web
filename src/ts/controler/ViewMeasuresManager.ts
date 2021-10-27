import { Stack } from 'stack-typescript';
import Color from '../chart/Color';
import ViewMeasure from '../chart/ViewMeasure';
import Signal from '../Signal';
import MeasuresManager from './MeasuresManager';
import TubesManager from './TubesManager';

export default class ViewMeasuresManager {
  private allMeasuresDiv: HTMLDivElement = <HTMLDivElement>document.getElementById('measures');

  private measuresManager: MeasuresManager;

  private tubesManager: TubesManager;

  private measuresMap: Map<number, ViewMeasure> = new Map();

  private colors: Stack<Color> = new Stack<Color>(
    new Color(0, 0, 255, 1.0), // Blue
    new Color(255, 0, 0, 1.0), // Red
    new Color(0, 128, 21, 1.0), // Dark green
    new Color(77, 0, 153, 1.0), // Purple
    new Color(230, 191, 0, 1.0), // Orange
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

  constructor(measuresManager: MeasuresManager, tubesManager: TubesManager) {
    this.measuresManager = measuresManager;
    this.tubesManager = tubesManager;

    const onCreateMeasureHandler = (_: MeasuresManager, uAnodeMeasure: number) => {
      this.createViewMeasure(uAnodeMeasure);
    };
    this.measuresManager.OnCreateMeasure.on(onCreateMeasureHandler);

    const onRemoveMeasureHandler = (_: MeasuresManager, uAnodeMeasure: number) => {
      this.removeViewMeasure(uAnodeMeasure);
    };
    this.measuresManager.OnRemoveMeasure.on(onRemoveMeasureHandler);

    document.getElementById('btn_clear_measures')?.addEventListener('click', () => {
      this.measuresManager.clearMeasures();
    });
  }

  private createViewMeasure(uAnodeMeasure: number) {
    if (this.measuresMap.get(uAnodeMeasure) !== undefined) {
      throw Error(`There is already a ViewMeasure for ${uAnodeMeasure}V measure`);
    }

    let color: Color = this.colors.pop();
    if (color === undefined) {
      color = this.defaultColor;
    }

    const createdViewMeasure = new ViewMeasure(
      uAnodeMeasure, color, this.allMeasuresDiv, this.tubesManager, this.measuresManager,
    );
    this.measuresMap.set(uAnodeMeasure, createdViewMeasure);

    this.onCreateViewMeasure.trigger(this, createdViewMeasure);
  }

  private removeViewMeasure(uAnodeMeasure: number) {
    const viewMeasure: ViewMeasure = <ViewMeasure> this.measuresMap.get(uAnodeMeasure);

    this.measuresMap.delete(uAnodeMeasure);

    if (viewMeasure.getColor() !== this.defaultColor) {
      this.colors.push(viewMeasure.getColor());
    }

    viewMeasure.removeDiv();

    this.onRemoveViewMeasure.trigger(this, viewMeasure);
  }

  public getViewMeasure(uAnodeMeasure: number): ViewMeasure | undefined {
    return this.measuresMap.get(uAnodeMeasure);
  }
}

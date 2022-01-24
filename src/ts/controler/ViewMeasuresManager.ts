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
    new Color(93, 206, 216, 1.0), // Cyan
    new Color(93, 216, 165, 1.0), // Pale green
    new Color(252, 230, 60, 1.0), // Yellow
    new Color(252, 126, 233, 1.0), // Pink
    new Color(156, 167, 252, 1.0), // Lila
    new Color(130, 69, 5, 1.0), // Brown
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

    document.getElementById('btn_add_custom_measure')?.addEventListener('click', () => {
      const uMeasuresPrompt = prompt('Tension grille', '');
      if (uMeasuresPrompt === null) {
        return;
      }
      const uMeasures = uMeasuresPrompt.split(' ');

      for (let i = 0; i < uMeasures.length; i += 1) {
        const prompted = uMeasures[i];

        const parsed = Number.parseFloat(prompted);
        if (!Number.isNaN(parsed)) {
          this.measuresManager.createMeasure(parsed);
        }
      }
    });

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

    viewMeasure.remove();

    this.onRemoveViewMeasure.trigger(this, viewMeasure);
  }

  public getViewMeasure(uAnodeMeasure: number): ViewMeasure | undefined {
    return this.measuresMap.get(uAnodeMeasure);
  }
}

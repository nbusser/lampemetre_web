import { Stack } from 'stack-typescript';
import Color from '../chart/Color';
import ViewMeasure from '../chart/ViewMeasure';
import Measure from '../model/Measure';

export default abstract class ViewMeasuresManager {
  private static measuresMap: Map<number, ViewMeasure> = new Map();

  private static colors: Stack<Color> = new Stack<Color>(
    new Color(0, 0, 255, 1.0),
    new Color(255, 0, 0, 1.0),
    new Color(0, 255, 0, 1.0),
    new Color(255, 255, 0, 1.0),
    new Color(255, 0, 255, 1.0),
  );

  private static defaultColor: Color = new Color(0, 0, 0, 1.0);

  public static createViewMeasure(measure: Measure): ViewMeasure {
    if (ViewMeasuresManager.measuresMap.get(measure.uAnode) !== undefined) {
      throw Error(`There is already a ViewMeasure for ${measure.uAnode}`);
    }

    let color: Color = ViewMeasuresManager.colors.pop();
    if (color === undefined) {
      color = ViewMeasuresManager.defaultColor;
    }

    const createdViewMeasure = new ViewMeasure(measure, color);
    ViewMeasuresManager.measuresMap.set(measure.uAnode, createdViewMeasure);

    return createdViewMeasure;
  }

  public static removeViewMeasure(viewMeasure: ViewMeasure) {
    const { uAnode } = viewMeasure.measure;
    if (!ViewMeasuresManager.measuresMap.delete(uAnode)) {
      throw Error(`There is not ViewMeasure for ${uAnode}`);
    }

    viewMeasure.removeDiv();
    this.colors.push(viewMeasure.getColor());
  }

  public static getViewMeasure(uAnode: number): ViewMeasure | undefined {
    return ViewMeasuresManager.measuresMap.get(uAnode);
  }

  public static clearViewMeasure() {
    ViewMeasuresManager.measuresMap.clear();
  }
}

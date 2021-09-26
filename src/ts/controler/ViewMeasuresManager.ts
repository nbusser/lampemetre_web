import { Stack } from 'stack-typescript';
import Color from '../chart/Color';
import ViewMeasure from '../chart/ViewMeasure';
import Measure from '../model/Measure';

export default class ViewMeasuresManager {
  private measuresMap: Map<number, ViewMeasure> = new Map();

  private colors: Stack<Color> = new Stack<Color>(
    new Color(0, 0, 255, 1.0),
    new Color(255, 0, 0, 1.0),
    new Color(0, 255, 0, 1.0),
    new Color(255, 255, 0, 1.0),
    new Color(255, 0, 255, 1.0),
  );

  private defaultColor: Color = new Color(0, 0, 0, 1.0);

  public createViewMeasure(measure: Measure): ViewMeasure {
    if (this.measuresMap.get(measure.uAnode) !== undefined) {
      throw Error(`There is already a ViewMeasure for ${measure.uAnode}`);
    }

    let color: Color = this.colors.pop();
    if (color === undefined) {
      color = this.defaultColor;
    }

    const createdViewMeasure = new ViewMeasure(measure, color);
    this.measuresMap.set(measure.uAnode, createdViewMeasure);

    return createdViewMeasure;
  }

  public removeViewMeasure(viewMeasure: ViewMeasure) {
    const { uAnode } = viewMeasure.measure;
    if (!this.measuresMap.delete(uAnode)) {
      throw Error(`There is not ViewMeasure for ${uAnode}`);
    }

    viewMeasure.removeDiv();
    this.colors.push(viewMeasure.getColor());
  }

  public getViewMeasure(uAnode: number): ViewMeasure | undefined {
    return this.measuresMap.get(uAnode);
  }

  public clearViewMeasure() {
    this.measuresMap.forEach((viewMeasure) => {
      this.removeViewMeasure(viewMeasure);
    });
  }
}

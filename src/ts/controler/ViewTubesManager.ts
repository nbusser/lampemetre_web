import { Stack } from 'stack-typescript';
import Color from '../chart/Color';
import ViewTube from '../chart/ViewTube';
import Tube from '../model/Tube';
import Signal from '../Signal';
import TubeMode from '../TubeMode';

export default class ViewTubesManager {
  public defaultMode: TubeMode = TubeMode.Triode;

  private tubesList: Array<ViewTube> = [];

  private tubeColors: Stack<Color> = new Stack<Color>(
    new Color(0, 0, 255, 1.0),
    new Color(255, 0, 0, 1.0),
    new Color(0, 255, 0, 1.0),
    new Color(255, 255, 0, 1.0),
    new Color(255, 0, 255, 1.0),
  );

  private defaultColor: Color = new Color(0, 0, 0, 1.0);

  private readonly onCreateViewTube = new Signal<ViewTubesManager, ViewTube>();

  private readonly onRemoveViewTube = new Signal<ViewTubesManager, ViewTube>();

  public get OnCreateViewTube(): Signal<ViewTubesManager, ViewTube> {
    return this.onCreateViewTube;
  }

  public get OnRemoveViewTube(): Signal<ViewTubesManager, ViewTube> {
    return this.onRemoveViewTube;
  }

  public createViewTube(name: string): ViewTube {
    const tube = new Tube(name, this.defaultMode);

    let color: Color = this.tubeColors.pop();
    if (color === undefined) {
      color = this.defaultColor;
    }

    const createdViewTube = new ViewTube(tube, color);
    createdViewTube.OnRemoveViewTube.on(
      (viewTube: ViewTube, _) => this.removeViewTube(viewTube),
    );

    this.tubesList.push(createdViewTube);

    this.onCreateViewTube.trigger(this, createdViewTube);

    return createdViewTube;
  }

  public removeViewTube(viewTube: ViewTube) {
    this.tubesList.splice(this.tubesList.indexOf(viewTube), 1);
    this.tubeColors.push(viewTube.getColor());

    this.onRemoveViewTube.trigger(this, viewTube);
  }

  public getViewTube(viewTube: ViewTube): ViewTube | undefined {
    const index = this.tubesList.indexOf(viewTube);
    if (index !== -1) {
      return undefined;
    }
    return this.tubesList[index];
  }

  public clearViewTubes() {
    while (this.tubesList.length !== 0) {
      this.removeViewTube(this.tubesList[0]);
    }
  }
}

import { Stack } from 'stack-typescript';
import Color from '../chart/Color';
import ViewTube from '../chart/ViewTube';
import Tube from '../model/Tube';
import TubeMode from '../TubeMode';

export default abstract class ViewTubesManager {
  public static defaultMode: TubeMode = TubeMode.Triode;

  private static tubesList: Array<ViewTube> = [];

  private static tubeColors: Stack<Color> = new Stack<Color>(
    new Color(0, 0, 255, 1.0),
    new Color(255, 0, 0, 1.0),
    new Color(0, 255, 0, 1.0),
    new Color(255, 255, 0, 1.0),
    new Color(255, 0, 255, 1.0),
  );

  private static defaultColor: Color = new Color(0, 0, 0, 1.0);

  public static createViewTube(name: string): ViewTube {
    const tube = new Tube(name, ViewTubesManager.defaultMode);

    let color: Color = ViewTubesManager.tubeColors.pop();
    if (color === undefined) {
      color = ViewTubesManager.defaultColor;
    }

    const createdViewTube = new ViewTube(tube, color, ViewTubesManager.removeViewTube);

    ViewTubesManager.tubesList.push(createdViewTube);

    return createdViewTube;
  }

  public static removeViewTube(viewTube: ViewTube) {
    ViewTubesManager.tubesList.splice(ViewTubesManager.tubesList.indexOf(viewTube), 1);
    viewTube.deleteTube();
    ViewTubesManager.tubeColors.push(viewTube.getColor());
  }

  public static getViewTube(viewTube: ViewTube): ViewTube | undefined {
    const index = ViewTubesManager.tubesList.indexOf(viewTube);
    if (index !== -1) {
      return undefined;
    }
    return ViewTubesManager.tubesList[index];
  }

  public static clearViewTubes() {
    while (ViewTubesManager.tubesList.length !== 0) {
      ViewTubesManager.removeViewTube(ViewTubesManager.tubesList[0]);
    }
  }
}

import { Stack } from 'stack-typescript';
import Color from '../chart/Color';
import ViewTube from '../chart/ViewTube';
import Tube from '../model/Tube';
import Signal from '../Signal';
import TubesManager from './TubesManager';

export default class ViewTubesManager {
  private tubesList: Map<Tube, ViewTube> = new Map();

  private tubeColors: Stack<Color> = new Stack<Color>(
    new Color(0, 0, 255, 1.0),
    new Color(255, 0, 0, 1.0),
    new Color(0, 255, 0, 1.0),
    new Color(255, 255, 0, 1.0),
    new Color(255, 0, 255, 1.0),
  );

  private defaultColor: Color = new Color(0, 0, 0, 1.0);

  private tubesManager: TubesManager;

  private readonly onCreateViewTube = new Signal<ViewTubesManager, ViewTube>();

  private readonly onRemoveViewTube = new Signal<ViewTubesManager, ViewTube>();

  public get OnCreateViewTube(): Signal<ViewTubesManager, ViewTube> {
    return this.onCreateViewTube;
  }

  public get OnRemoveViewTube(): Signal<ViewTubesManager, ViewTube> {
    return this.onRemoveViewTube;
  }

  constructor(tubesManager: TubesManager) {
    this.tubesManager = tubesManager;

    const createTubeHandler = (_: TubesManager, tube: Tube) => {
      this.createViewTube(tube);
    };
    this.tubesManager.OnCreateTube.on(createTubeHandler);

    const removeTubeHandler = (_: TubesManager, tube: Tube) => {
      this.removeViewTube(tube);
    };
    this.tubesManager.OnRemoveTube.on(removeTubeHandler);
  }

  public createViewTube(tube: Tube): ViewTube {
    let color: Color = this.tubeColors.pop();
    if (color === undefined) {
      color = this.defaultColor;
    }

    const createdViewTube = new ViewTube(tube, color, this.tubesManager);

    this.tubesList.set(tube, createdViewTube);

    this.onCreateViewTube.trigger(this, createdViewTube);

    return createdViewTube;
  }

  public getViewTube(tube: Tube): ViewTube | undefined {
    return this.tubesList.get(tube);
  }

  public removeViewTube(tube: Tube) {
    const viewTube: ViewTube = <ViewTube> this.tubesList.get(tube);
    this.tubesList.delete(viewTube.tube);
    this.tubeColors.push(viewTube.getColor());

    viewTube.deleteTube();
  }
}

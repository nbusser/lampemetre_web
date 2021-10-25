import { Stack } from 'stack-typescript';
import Color from '../chart/Color';
import ViewTube from '../chart/ViewTube';
import Tube from '../model/Tube';
import Signal from '../Signal';
import TubeMode from '../TubeMode';
import TubesManager from './TubesManager';

export default class ViewTubesManager {
  private tubesList: Map<Tube, ViewTube> = new Map();

  private tubeColors: Stack<Color> = new Stack<Color>(
    new Color(0, 0, 255, 1.0), // Blue
    new Color(255, 0, 0, 1.0), // Red
    new Color(0, 128, 21, 1.0), // Dark green
    new Color(77, 0, 153, 1.0), // Purple
    new Color(230, 191, 0, 1.0), // Orange
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

    document.getElementById('btn_add_tube')?.addEventListener('click', () => {
      const name = prompt('Nom du tube', '');
      if (name !== null && name !== ' ') {
        this.tubesManager.createTube(name, TubeMode.Triode);
      }
    });

    document.getElementById('btn_clear')?.addEventListener('click', () => {
      this.tubesManager.clearTubes();
    });
  }

  private createViewTube(tube: Tube) {
    let color: Color = this.tubeColors.pop();
    if (color === undefined) {
      color = this.defaultColor;
    }

    const createdViewTube = new ViewTube(tube, color, this.tubesManager);

    this.tubesList.set(tube, createdViewTube);

    this.onCreateViewTube.trigger(this, createdViewTube);
  }

  private removeViewTube(tube: Tube) {
    const viewTube: ViewTube = <ViewTube> this.tubesList.get(tube);
    this.tubesList.delete(viewTube.tube);
    this.tubeColors.push(viewTube.getColor());

    viewTube.deleteViewTube();

    this.onRemoveViewTube.trigger(this, viewTube);
  }

  public getViewTube(tube: Tube): ViewTube | undefined {
    return this.tubesList.get(tube);
  }
}

import ViewTubesManager from '../controler/ViewTubesManager';
import Plot from './Plot';

export default class ControlPanel {
  private static instance: ControlPanel;

  public static getInstance(): ControlPanel {
    Plot.getInstance();

    if (!ControlPanel.instance) {
      ControlPanel.instance = new ControlPanel();
    }
    return ControlPanel.instance;
  }

  private constructor() {
    document.getElementById('btn_add_tube')?.addEventListener('click', () => {
      const name = prompt('Nom du tube', '');
      if (name !== null && name !== ' ') {
        ViewTubesManager.createViewTube(name);
      }
    });
  }
}

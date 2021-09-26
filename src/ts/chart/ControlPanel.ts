import ViewTubesManager from '../controler/ViewTubesManager';
import ViewMeasuresManager from '../controler/ViewMeasuresManager';
import Plot from './Plot';

export default class ControlPanel {
  constructor(
    plot: Plot,
    viewTubesManager: ViewTubesManager,
    viewMeasuresManager: ViewMeasuresManager,
  ) {
    document.getElementById('btn_add_tube')?.addEventListener('click', () => {
      const name = prompt('Nom du tube', '');
      if (name !== null && name !== ' ') {
        viewTubesManager.createViewTube(name);
      }
    });

    document.getElementById('btn_clear')?.addEventListener('click', () => {
      viewTubesManager.clearViewTubes();
    });

    document.getElementById('btn_clear_measures')?.addEventListener('click', () => {
      plot.clearMeasures();
      viewMeasuresManager.clearViewMeasure();
    });
  }
}

import Plot from './Plot';
import TubesManager from '../controler/TubesManager';
import TubeMode from '../TubeMode';
import MeasuresManager from '../controler/MeasuresManager';

export default class ControlPanel {
  constructor(
    plot: Plot,
    tubesManager: TubesManager,
    measuresManager: MeasuresManager,
  ) {
    document.getElementById('btn_add_tube')?.addEventListener('click', () => {
      const name = prompt('Nom du tube', '');
      if (name !== null && name !== ' ') {
        tubesManager.createTube(name, TubeMode.Triode);
      }
    });

    document.getElementById('btn_clear')?.addEventListener('click', () => {
      tubesManager.clearTubes();
    });

    document.getElementById('btn_clear_measures')?.addEventListener('click', () => {
      measuresManager.clearMeasures();
    });
  }
}

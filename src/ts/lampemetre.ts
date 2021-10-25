import Plot from './chart/Plot';
import MeasuresManager from './controler/MeasuresManager';
import TubesManager from './controler/TubesManager';
import ViewMeasuresManager from './controler/ViewMeasuresManager';
import ViewTubesManager from './controler/ViewTubesManager';

const tubesManager: TubesManager = new TubesManager();
const measureManager: MeasuresManager = new MeasuresManager();

const viewTubesManager = new ViewTubesManager(tubesManager);
const viewMeasureManager = new ViewMeasuresManager(measureManager, tubesManager);

const rootHtml: HTMLElement = <HTMLElement>document.getElementById('chart');
const _ = new Plot(rootHtml, viewTubesManager, viewMeasureManager, measureManager);

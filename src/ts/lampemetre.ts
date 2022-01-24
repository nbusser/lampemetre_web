import Plot from './chart/Plot';
import MeasuresManager from './controler/MeasuresManager';
import TubesManager from './controler/TubesManager';
import ViewMeasuresManager from './controler/ViewMeasuresManager';
import ViewTubesManager from './controler/ViewTubesManager';
import Export from './Export';

const tubesManager: TubesManager = new TubesManager();
const measureManager: MeasuresManager = new MeasuresManager();

const viewTubesManager = new ViewTubesManager(tubesManager);
const viewMeasureManager = new ViewMeasuresManager(measureManager, tubesManager);

const rootHtml: HTMLElement = <HTMLElement>document.getElementById('chart');
const _ = new Plot(rootHtml, tubesManager, viewTubesManager, viewMeasureManager, measureManager);

const exporter = new Export(tubesManager, measureManager);

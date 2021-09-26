import ControlPanel from './chart/ControlPanel';
import Plot from './chart/Plot';
import TubesManager from './controler/TubesManager';
import ViewMeasuresManager from './controler/ViewMeasuresManager';
import ViewTubesManager from './controler/ViewTubesManager';
import TubeMode from './TubeMode';

const tubesManager: TubesManager = new TubesManager();

const viewTubesManager = new ViewTubesManager(tubesManager);
const viewMeasureManager = new ViewMeasuresManager();

const rootHtml: HTMLElement = <HTMLElement>document.getElementById('chart');
const plot = new Plot(rootHtml, viewTubesManager, viewMeasureManager);
const _ = new ControlPanel(plot, tubesManager, viewMeasureManager);

tubesManager.createTube('Test', TubeMode.Triode);
tubesManager.createTube('Test2', TubeMode.Pentode);
import ControlPanel from './chart/ControlPanel';
import Plot from './chart/Plot';
import ViewMeasuresManager from './controler/ViewMeasuresManager';
import ViewTubesManager from './controler/ViewTubesManager';

const viewTubesManager = new ViewTubesManager();
const viewMeasureManager = new ViewMeasuresManager();

const rootHtml: HTMLElement = <HTMLElement>document.getElementById('chart');
const plot = new Plot(rootHtml, viewTubesManager, viewMeasureManager);
const controlPanel = new ControlPanel(plot, viewTubesManager, viewMeasureManager);

viewTubesManager.createViewTube('Test');
viewTubesManager.createViewTube('Test2');

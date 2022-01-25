import Plot from './chart/Plot';
import MeasuresManager from './controler/MeasuresManager';
import TubesManager from './controler/TubesManager';
import ViewMeasuresManager from './controler/ViewMeasuresManager';
import ViewTubesManager from './controler/ViewTubesManager';
import Export from './Export';
import Import from './Import';
import SaveLoad from './SaveLoad';
import Timer from './Timer';

const timerText: HTMLParagraphElement = <HTMLParagraphElement>document.getElementById('timer_text');
const resetTimerBtn: HTMLButtonElement = <HTMLButtonElement>document.getElementById('btn_timer');
const blockCheckbox: HTMLInputElement = <HTMLInputElement>document.getElementById('timer_alert');
const timer = new Timer(timerText, resetTimerBtn, blockCheckbox, 60);

const tubesManager: TubesManager = new TubesManager();
const measureManager: MeasuresManager = new MeasuresManager();

const viewTubesManager = new ViewTubesManager(tubesManager, timer);
const viewMeasureManager = new ViewMeasuresManager(measureManager, tubesManager);

const rootHtml: HTMLElement = <HTMLElement>document.getElementById('chart');
const _ = new Plot(rootHtml, viewTubesManager, viewMeasureManager, measureManager);

const csvFileInput: HTMLInputElement = <HTMLInputElement>document.getElementById('input_import_excel');
const btnImport: HTMLButtonElement = <HTMLButtonElement>document.getElementById('btn_import');
const importer = new Import(csvFileInput, btnImport, tubesManager);

const btnExport: HTMLButtonElement = <HTMLButtonElement>document.getElementById('btn_export');
const exporter = new Export(btnExport, tubesManager, measureManager);

const btnSave: HTMLButtonElement = <HTMLButtonElement>document.getElementById('btn_save');
const inputLoadFile: HTMLInputElement = <HTMLInputElement>document.getElementById('input_load');
const btnLoad: HTMLButtonElement = <HTMLButtonElement>document.getElementById('btn_load');
const notesTextArea: HTMLTextAreaElement = <HTMLTextAreaElement>document.getElementById('notes');
const saveLoad = new SaveLoad(
  btnSave, inputLoadFile, btnLoad, notesTextArea,
  tubesManager, measureManager,
);

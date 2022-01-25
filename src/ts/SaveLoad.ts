import * as fs from 'file-saver';
import MeasuresManager from './controler/MeasuresManager';
import TubesManager from './controler/TubesManager';
import { FrozenData, FrozenTube } from './FrozenData';
import Capture from './model/Capture';
import Tube from './model/Tube';

// This module handles save and load of the workspace via JSON files
export default class SaveLoad {
  private measuresManager: MeasuresManager;

  private tubesManager: TubesManager;

  private btnSave: HTMLButtonElement;

  private fileInput: HTMLInputElement;

  private btnLoad: HTMLButtonElement;

  private notesTextArea: HTMLTextAreaElement;

  // Triggered when file is selected in the file browser
  private readSelectedFile = (evt: any) => {
    const errorMessage = 'Une erreur est survenue pendant la lecture du fichier';
    if (evt.target === null) {
      alert(errorMessage);
      return;
    }

    // Selected file object
    const file = evt.target.files[0];

    // Triggered when the file reader finished to read the file
    const fileReaderFinished = (event: any) => {
      if (event.target === null
        || event.target.result === null) {
        alert(errorMessage);
        return;
      }
      // If no error, sends the array buffer to perform input and resets the file browser input
      this.load(event.target.result);
      this.fileInput.value = '';
    };

    // Reads the selected file
    const reader = new FileReader();
    reader.addEventListener('load', fileReaderFinished);

    reader.readAsText(file);
  };

  constructor(
    btnSave: HTMLButtonElement,
    inputLoadFile: HTMLInputElement,
    btnLoad: HTMLButtonElement,
    notesTextArea: HTMLTextAreaElement,
    tubesManager: TubesManager,
    measuresManager: MeasuresManager,
  ) {
    this.btnSave = btnSave;
    this.fileInput = inputLoadFile;
    this.btnLoad = btnLoad;
    this.notesTextArea = notesTextArea;

    this.measuresManager = measuresManager;

    this.tubesManager = tubesManager;

    this.btnSave.addEventListener('click', () => this.save());

    this.btnLoad.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', (evt) => this.readSelectedFile(evt));
  }

  // Save all the workspace's information to a JSON file
  private save() {
    const tubes = this.tubesManager.getTubes();
    const measures = this.measuresManager.getMeasures();

    /*
    Prepares a frozen version of all the tubes via toJSON
    These frozen data get rid of all the handlers and complex objects such maps
    */
    const frozenTubes: FrozenTube[] = [];
    tubes.forEach((tube: Tube) => {
      frozenTubes.push(tube.toJSON());
    });
    // Prepares then a frozen version of all data
    const frozenData: FrozenData = {
      tubes: frozenTubes,
      measures,
      notes: this.notesTextArea.value,
    };

    // Stringifies those frozen data and save it to a file
    const saveJson: string = JSON.stringify(frozenData);

    const saveName = `$save-${new Date().valueOf()}.json`;
    fs.saveAs(new Blob([saveJson]), saveName);
  }

  // Load a workspace from a JSON string
  private load(jsonContent: string) {
    try {
      /*
      We assume jsonContent is a valid FrozenData
      We made no verification. Uploading a random JSON file is under user's responsibility
      */
      const frozenData: FrozenData = JSON.parse(jsonContent);

      frozenData.tubes.forEach((frozenTube: FrozenTube) => {
        const tube = this.tubesManager.createTube(frozenTube.name);

        frozenTube.captures.forEach((capture: Capture) => {
          tube.createCapture(capture.uAnode, capture.uGrid, capture.iCathode);
        });

        // Sadly, we cannot cleanly 'click' the matching radio button
        // We would need to switch to a proper frontend framework to allow this
        if (frozenTube.selectedCaptureIndex !== -1
          && frozenTube.selectedCaptureIndex < frozenTube.captures.length) {
          tube.changeSelectedCapture(frozenTube.captures[frozenTube.selectedCaptureIndex]);
        }
      });

      frozenData.measures.forEach((uAnode: number) => {
        this.measuresManager.createMeasure(uAnode);
      });

      this.notesTextArea.value = frozenData.notes;
    } catch (Error) {
      alert('Une erreur est survenue durant le chargement du fichier. Le fichier est invalide.');
    }
  }
}

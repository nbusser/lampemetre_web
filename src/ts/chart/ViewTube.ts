import TubesManager from '../controler/TubesManager';
import Capture from '../model/Capture';
import Tube from '../model/Tube';
import performCapture from '../Serial';
import TubeMode from '../TubeMode';
import Color from './Color';

export default class ViewTube {
  private static tubesUlHtml: HTMLUListElement = <HTMLUListElement>document.getElementById('ul_tubes');

  private capturesMap: Map<Capture, HTMLElement> = new Map();

  public tube: Tube;

  private color: Color;

  private tubesManager: TubesManager;

  private tubeLi: HTMLElement;

  private tubeCapturesList: HTMLUListElement;

  constructor(tube: Tube, color: Color, tubesManager: TubesManager) {
    this.tubesManager = tubesManager;

    this.tube = tube;

    const tubeCreateCaptureHandler = (t: Tube, capture: Capture) => {
      this.addCapture(capture);
    };
    this.tube.OnCreateCapture.on(tubeCreateCaptureHandler);

    const tubeRemoveCaptureHandler = (t: Tube, capture: Capture) => {
      this.removeCapture(capture);
    };
    this.tube.OnRemoveCapture.on(tubeRemoveCaptureHandler);

    this.color = color;

    this.tubeLi = document.createElement('li');
    this.tubeLi.className = 'li_tube';

    const tubeHeaderDiv = document.createElement('div');
    tubeHeaderDiv.classList.add('tube_capture_header_div');
    tubeHeaderDiv.classList.add('tube_capture_button_inline');
    tubeHeaderDiv.classList.add('div_tube_header');
    this.tubeLi.appendChild(tubeHeaderDiv);

    const title = document.createElement('h2');
    title.textContent = tube.name;
    title.style.color = this.color.toString();
    title.classList.add('tube_name');
    title.classList.add('header_text');
    tubeHeaderDiv.appendChild(title);

    const removeTubeBtn = document.createElement('button');
    removeTubeBtn.classList.add('btn_tube_capture');
    removeTubeBtn.classList.add('btn_tube');
    removeTubeBtn.classList.add('btn_remove_tube');
    removeTubeBtn.textContent = '-';
    removeTubeBtn.addEventListener('click', () => {
      this.tubesManager.removeTube(this.tube);
    });
    tubeHeaderDiv.appendChild(removeTubeBtn);

    const modeDiv = document.createElement('div');
    modeDiv.classList.add('div_select_mode');
    const selectMode: HTMLSelectElement = document.createElement('select');
    Object.keys(TubeMode).forEach((modeStr) => {
      if (Number.isNaN(Number.parseInt(modeStr, 10))) {
        const option: HTMLOptionElement = document.createElement('option');
        option.value = modeStr;
        option.text = modeStr;
        option.defaultSelected = modeStr === TubeMode[tube.mode];
        selectMode.options.add(option);
      }
    });
    selectMode.addEventListener('change', () => {
      const newMode = TubeMode[selectMode.selectedOptions[0].value as keyof typeof TubeMode];
      if (newMode !== undefined) {
        this.tube.changeMode(newMode);
      }
    });
    modeDiv.appendChild(selectMode);
    this.tubeLi.appendChild(modeDiv);

    const capturesDiv = document.createElement('div');
    capturesDiv.className = 'div_tube_captures';
    this.tubeLi.appendChild(capturesDiv);

    const newCaptureDiv = document.createElement('div');
    newCaptureDiv.classList.add('tube_capture_header_div');
    newCaptureDiv.classList.add('tube_capture_button_inline');
    capturesDiv.appendChild(newCaptureDiv);

    const catpuresHeader = document.createElement('h3');
    catpuresHeader.textContent = 'Captures:';
    catpuresHeader.classList.add('captures_list_header');
    catpuresHeader.classList.add('header_text');
    newCaptureDiv.appendChild(catpuresHeader);

    const addCaptureBtn = document.createElement('button');
    addCaptureBtn.textContent = '+';
    addCaptureBtn.classList.add('btn_tube_capture');
    addCaptureBtn.classList.add('btn_capture');
    addCaptureBtn.classList.add('btn_new_capture');
    addCaptureBtn.addEventListener('click', () => this.createNewCapture());
    newCaptureDiv.appendChild(addCaptureBtn);

    this.tubeCapturesList = document.createElement('ul');
    this.tubeCapturesList.className = 'capture_list';
    capturesDiv.appendChild(this.tubeCapturesList);

    this.tube.captures.forEach((capture) => {
      this.addCapture(capture);
    });
    ViewTube.tubesUlHtml.appendChild(this.tubeLi);
  }

  private async createNewCapture() {
    const uGridPrompt = prompt('Tension grille', '');
    if (uGridPrompt !== null && !Number.isNaN(parseFloat(uGridPrompt))) {
      const uGrid = Math.abs(Number.parseFloat(uGridPrompt));
      const result = await performCapture(2, uGrid);
      this.tube.createCapture(
        result.tensionsAnode,
        uGrid,
        result.currentsCathode,
      );
    }
  }

  private addCapture(capture: Capture) {
    const element: HTMLElement = document.createElement('li');
    element.classList.add('li_capture');
    this.tubeCapturesList.appendChild(element);

    const divCapture: HTMLDivElement = document.createElement('div');
    divCapture.classList.add('tube_capture_button_inline');
    divCapture.classList.add('div_listed_capture');
    element.appendChild(divCapture);

    const text: HTMLElement = document.createElement('span');
    text.textContent = capture.toString();
    text.className = 'capture_value';
    divCapture.appendChild(text);

    const deleteButton: HTMLButtonElement = document.createElement('button');
    deleteButton.classList.add('btn_tube_capture');
    deleteButton.classList.add('btn_capture');
    deleteButton.classList.add('btn_remove_capture');
    deleteButton.textContent = '-';
    deleteButton.addEventListener('click', () => this.tube.deleteCapture(capture));

    divCapture.appendChild(deleteButton);

    this.capturesMap.set(capture, element);
  }

  private removeCapture(capture: Capture) {
    const captureHtml = this.capturesMap.get(capture);

    if (captureHtml === undefined) {
      throw Error(`Capture ${capture.toString()} is not in tube ${this.tube.name}`);
    }

    this.tubeCapturesList.removeChild(captureHtml);

    this.capturesMap.delete(capture);
  }

  getHtml(): HTMLElement {
    return this.tubeLi;
  }

  getColor(): Color {
    return this.color;
  }

  deleteViewTube() {
    ViewTube.tubesUlHtml.removeChild(this.tubeLi);
    this.capturesMap.forEach((value, key) => {
      this.tube.deleteCapture(key);
    });
  }
}

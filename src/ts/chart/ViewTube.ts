import TubesManager from '../controler/TubesManager';
import Capture from '../model/Capture';
import Tube from '../model/Tube';
import performCapture from '../Serial';
import Timer from '../Timer';
import Color from './Color';

export default class ViewTube {
  private static tubesUlHtml: HTMLUListElement = <HTMLUListElement>document.getElementById('ul_tubes');

  private capturesMap: Map<Capture, HTMLElement> = new Map();

  public tube: Tube;

  private color: Color;

  private tubesManager: TubesManager;

  private tubeLi: HTMLElement;

  private tubeCapturesList: HTMLUListElement;

  private slider: HTMLInputElement;

  private timer: Timer;

  constructor(tube: Tube, color: Color, tubesManager: TubesManager, timer: Timer) {
    this.tubesManager = tubesManager;

    this.tube = tube;

    this.timer = timer;

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
    removeTubeBtn.classList.add('inline_btn');
    removeTubeBtn.classList.add('btn_remove_tube');
    removeTubeBtn.textContent = '-';
    removeTubeBtn.addEventListener('click', () => {
      this.tubesManager.removeTube(this.tube);
    });
    tubeHeaderDiv.appendChild(removeTubeBtn);

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
    addCaptureBtn.classList.add('inline_btn');
    addCaptureBtn.classList.add('btn_new_capture');
    addCaptureBtn.addEventListener('click', () => this.createNewCapture());
    newCaptureDiv.appendChild(addCaptureBtn);

    this.tubeCapturesList = document.createElement('ul');
    this.tubeCapturesList.className = 'capture_list';
    capturesDiv.appendChild(this.tubeCapturesList);

    this.tube.captures.forEach((capture) => {
      this.addCapture(capture);
    });

    const sliderDiv = document.createElement('div');
    sliderDiv.classList.add('slider_container');
    this.tubeLi.appendChild(sliderDiv);

    const sliderName = document.createElement('span');
    sliderName.textContent = 'Lissage:';
    sliderDiv.appendChild(sliderName);

    const slider = document.createElement('input');
    slider.classList.add('slider');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '10';
    slider.value = '4';
    sliderDiv.appendChild(slider);
    this.slider = slider;
    this.updateSlider();

    ViewTube.tubesUlHtml.appendChild(this.tubeLi);
  }

  private updateSlider() {
    this.slider.disabled = this.capturesMap.size > 0;
  }

  private async createNewCapture() {
    if (this.timer.blockIfNecessary()) {
      return;
    }

    const uGridPrompt = prompt('Tension grille', '');
    if (uGridPrompt === null) {
      return;
    }
    const uGrids = uGridPrompt.split(' ');

    for (let i = 0; i < uGrids.length; i += 1) {
      const prompted = uGrids[i];

      const parsed = Number.parseFloat(prompted);
      if (!Number.isNaN(parsed)) {
        const uGrid = Math.abs(parsed);
        const result = await performCapture(uGrid, Number.parseInt(this.slider.value, 10));
        this.tube.createCapture(
          result.tensionsAnode,
          uGrid,
          result.currentsCathode,
        );
      }
    }
  }

  private addCapture(capture: Capture) {
    const { children } = this.tubeCapturesList;
    let insertBefore = null;
    for (let i = 0; i < children.length; i += 1) {
      const child = children[i];
      const currentGrid = child.getAttribute('uGrid');
      if (currentGrid === null) {
        throw Error('Capture has no HTML field value indicating its uGrid');
      } else if (Number.parseFloat(currentGrid) > capture.uGrid) {
        insertBefore = child;
        break;
      }
    }

    const element: HTMLElement = document.createElement('li');
    element.classList.add('li_capture');
    element.setAttribute('uGrid', capture.uGrid.toString());
    this.tubeCapturesList.insertBefore(element, insertBefore);

    const divCapture: HTMLDivElement = document.createElement('div');
    divCapture.classList.add('tube_capture_button_inline');
    divCapture.innerHTML = `<label class="radio_select_capture">
    <input type="radio" name="selectedCapture${this.tubesManager.getTubeId(this.tube)}" value=${capture.toString()}>
    <div class="tube_capture_button_inline">
      <span class="capture_value">${capture.toString()}</span>
      <button class="inline_btn btn_remove_capture">-</button>
    </div>
    </label>`;
    // Radio button
    divCapture.children[0].children[0].addEventListener('change', () => { this.tube.changeSelectedCapture(capture); });
    // Delete button
    divCapture.children[0].children[1].children[1].addEventListener('click', () => this.tube.deleteCapture(capture));

    element.appendChild(divCapture);

    this.capturesMap.set(capture, element);

    this.updateSlider();
  }

  private removeCapture(capture: Capture) {
    const captureHtml = this.capturesMap.get(capture);

    if (captureHtml === undefined) {
      throw Error(`Capture ${capture.toString()} is not in tube ${this.tube.name}`);
    }

    this.tubeCapturesList.removeChild(captureHtml);

    this.capturesMap.delete(capture);

    this.updateSlider();
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

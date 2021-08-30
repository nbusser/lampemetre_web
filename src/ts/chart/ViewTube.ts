import Capture from '../model/Capture';
import Tube from '../model/Tube';
import Color from './Color';
import Plot from './Plot';

export default class ViewTube {
  private static tubesUlHtml: HTMLUListElement = <HTMLUListElement>document.getElementById('ul_tubes');

  private capturesMap: Map<Capture, HTMLElement> = new Map();

  public tube: Tube;

  private color: Color;

  private tubeDiv: HTMLElement;

  private tubeCapturesList: HTMLUListElement;

  constructor(tube: Tube, color: Color, removeTubeCallback: Function) {
    this.tube = tube;

    this.color = color;

    this.tubeDiv = document.createElement('div');

    const tubeHeaderDiv = document.createElement('div');
    tubeHeaderDiv.className = 'div_tube_header';
    this.tubeDiv.appendChild(tubeHeaderDiv);

    const title = document.createElement('p');
    title.textContent = tube.name;
    title.style.color = this.color.toString();
    title.className = 'tube_name';
    tubeHeaderDiv.appendChild(title);

    const removeTubeBtn = document.createElement('button');
    removeTubeBtn.className = 'remove_tube_btn';
    removeTubeBtn.textContent = '-';
    removeTubeBtn.addEventListener('click', () => removeTubeCallback(this));
    tubeHeaderDiv.appendChild(removeTubeBtn);

    const capturesDiv = document.createElement('div');
    capturesDiv.className = 'div_tube_captures';
    this.tubeDiv.appendChild(capturesDiv);

    this.tubeCapturesList = document.createElement('ul');
    this.tubeCapturesList.className = 'capture_list';
    capturesDiv.appendChild(this.tubeCapturesList);

    const newCaptureDiv = document.createElement('div');
    newCaptureDiv.className = 'div_new_capture';
    capturesDiv.appendChild(newCaptureDiv);

    const newCaptureText = document.createElement('p');
    newCaptureText.textContent = 'Nouvelle capture:';
    newCaptureDiv.appendChild(newCaptureText);

    const addCaptureBtn = document.createElement('button');
    addCaptureBtn.textContent = '+';
    addCaptureBtn.className = 'new_capture_btn';
    addCaptureBtn.addEventListener('click', () => {
      const capture = this.tube.createCapture([1, 2, 3], 1, [4, 5, 6]);
      this.addCapture(capture);
    });
    newCaptureDiv.appendChild(addCaptureBtn);

    this.tube.captures.forEach((capture) => {
      this.addCapture(capture);
    });
    ViewTube.tubesUlHtml.appendChild(this.tubeDiv);
  }

  private addCapture(capture: Capture) {
    Plot.getInstance().drawCapture(capture, this.color);

    const element: HTMLElement = document.createElement('li');
    this.tubeCapturesList.appendChild(element);

    const divCapture: HTMLDivElement = document.createElement('div');
    divCapture.className = 'div_listed_capture';
    element.appendChild(divCapture);

    const text: HTMLParagraphElement = document.createElement('p');
    text.textContent = capture.toString();
    divCapture.appendChild(text);

    const deleteButton: HTMLButtonElement = document.createElement('button');
    deleteButton.textContent = '-';
    deleteButton.addEventListener('click', () => this.removeCapture(capture));

    divCapture.appendChild(deleteButton);

    this.capturesMap.set(capture, element);
  }

  private removeCapture(capture: Capture) {
    Plot.getInstance().removeCapture(capture);

    const captureHtml = this.capturesMap.get(capture);

    if (captureHtml === undefined) {
      throw Error(`Capture ${capture.toString()} is not in tube ${this.tube.name}`);
    }

    this.tubeCapturesList.removeChild(captureHtml);

    this.capturesMap.delete(capture);

    this.tube.deleteCapture(capture);
  }

  getHtml(): HTMLElement {
    return this.tubeDiv;
  }

  getColor(): Color {
    return this.color;
  }

  deleteTube() {
    ViewTube.tubesUlHtml.removeChild(this.tubeDiv);
    this.capturesMap.forEach((value, key) => {
      this.removeCapture(key);
    });
  }
}

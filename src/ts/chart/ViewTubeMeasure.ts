import MeasuresManager from '../controler/MeasuresManager';
import Tube from '../model/Tube';

export default class ViewTubeMeasure {
  private uAnode: number;

  private tube: Tube;

  private measuresManager: MeasuresManager;

  private measureTableHtml: HTMLElement;

  private tableRowHtml: HTMLTableRowElement = <HTMLTableRowElement> document.createElement('tr');

  private invalidResultHtml: HTMLDivElement = <HTMLDivElement> document.createElement('div');

  private invalidReasonHtml: HTMLSpanElement = <HTMLSpanElement> document.createElement('span');

  constructor(
    uAnode: number,
    tube: Tube,
    measuresManager: MeasuresManager,
    measureTableHtml: HTMLElement,
  ) {
    this.uAnode = uAnode;
    this.tube = tube;
    this.measuresManager = measuresManager;
    this.measureTableHtml = measureTableHtml;

    this.measureTableHtml.appendChild(this.tableRowHtml);
    this.tableRowHtml.innerHTML = `
    <tr>
      <th>${this.tube.name}</th>
    </tr>
    `;
    this.tableRowHtml.classList.add('measure_result_row');

    this.invalidReasonHtml.classList.add('warning_sign');
    this.invalidResultHtml.appendChild(this.invalidReasonHtml);
    this.updateInvalid('/');

    this.tube.OnCreateCapture.on(this.updateDomHandler);
    this.tube.OnRemoveCapture.on(this.updateDomHandler);
    this.tube.OnSelectedCaptureChange.on(this.updateDomHandler);

    this.updateDom();
  }

  private updateDomHandler = () => { this.updateDom(); };

  private deleteHtml() {
    this.measureTableHtml.removeChild(this.tableRowHtml);
  }

  public remove() {
    this.tube.OnCreateCapture.off(this.updateDomHandler);
    this.tube.OnRemoveCapture.off(this.updateDomHandler);
    this.tube.OnSelectedCaptureChange.off(this.updateDomHandler);
    this.deleteHtml();
  }

  private updateDom() {
    this.tableRowHtml.innerHTML = `<th>${this.tube.name}</th>`;

    let uGrid = null;
    if (this.tube.captures.size !== 0) {
      if (this.tube.selectedCapture === null) {
        this.updateInvalid('Selectionnez une capture en cliquant dessus dans le panneau Tubes');
        return;
      }
      uGrid = this.tube.selectedCapture.uGrid;
    }

    try {
      const iCathode = this.measuresManager.getSelectedIcathode(
        this.uAnode,
        this.tube,
        uGrid,
      );

      const internalResistance = this.measuresManager.computeInternalResistance(
        this.uAnode,
        this.tube,
        uGrid,
      );

      const transductance = this.measuresManager.computeTransductance(
        this.uAnode,
        this.tube,
        uGrid,
      );

      const amplificationFactor = this.measuresManager.computeAmplificationFactor(
        this.uAnode,
        this.tube,
        uGrid,
      );

      if (typeof iCathode === 'number') {
        this.tableRowHtml.innerHTML += `<td>${iCathode} mA</td>`;
      } else {
        this.tableRowHtml.innerHTML += this.getInvalidFieldHTML(iCathode);
      }

      if (typeof internalResistance === 'number') {
        this.tableRowHtml.innerHTML += `<td>${internalResistance.toFixed(1)} kOhm</td>`;
      } else {
        this.tableRowHtml.innerHTML += this.getInvalidFieldHTML(internalResistance);
      }

      if (typeof transductance === 'number') {
        this.tableRowHtml.innerHTML += `<td>${transductance.toFixed(1)} mA/V (mS)</td>`;
      } else {
        this.tableRowHtml.innerHTML += this.getInvalidFieldHTML(transductance);
      }

      if (typeof amplificationFactor === 'number') {
        this.tableRowHtml.innerHTML += `<td>${(<number>amplificationFactor).toFixed(1)}</td>`;
      } else {
        this.tableRowHtml.innerHTML += this.getInvalidFieldHTML(amplificationFactor);
      }
    } catch (e: any) {
      console.error(e.message);
      this.updateInvalid('Un comportement inatendu est survenu. Consultez la console pour plus d\'information');
    }
  }

  private updateInvalid(reason: string) {
    this.tableRowHtml.innerHTML = `<th>${this.tube.name}</th>`;
    for (let i = 0; i < 4; i += 1) {
      this.tableRowHtml.innerHTML += this.getInvalidFieldHTML(reason);
    }
  }

  private getInvalidFieldHTML = (reason: string): string => `<td>
  <span class="warning_sign" title="${reason}">
  </span>
  </td>`;
}

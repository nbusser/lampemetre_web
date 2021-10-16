import MeasuresManager, { MeasureResult } from '../controler/MeasuresManager';
import Capture from '../model/Capture';
import Tube from '../model/Tube';
import TubeMode from '../TubeMode';

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

    this.invalidReasonHtml.classList.add('warning_sign');
    this.invalidResultHtml.appendChild(this.invalidReasonHtml);
    this.updateInvalid('/');

    const initMeasureResults: MeasureResult = {
      internalTR: -1,
      slopeI: -1,
      coefI: -1,
      iRefy: -1,
      uRefx: -1,
    };
    this.updateValid(initMeasureResults);

    this.tube.OnCreateCapture.on((tube: Tube, capture: Capture) => this.updateDom());
    this.tube.OnRemoveCapture.on((tube: Tube, capture: Capture) => this.updateDom());
    this.tube.OnModeChange.on((tube: Tube, mode: TubeMode) => this.updateDom());

    this.updateDom();
  }

  public deleteHtml() {
    this.measureTableHtml.removeChild(this.tableRowHtml);
  }

  private updateDom() {
    try {
      const result = this.measuresManager.performMeasure(this.uAnode, this.tube);
      this.updateValid(result);
    } catch (Error) {
      this.updateInvalid(Error.message);
    }
  }

  private updateValid(result: MeasureResult) {
    this.tableRowHtml.innerHTML = `
      <th>${this.tube.name}</th>
      <td>${result.internalTR} kOhm</td>
      <td>${result.slopeI} mA/V</td>
      <td>${result.coefI} mA</td>
      <td>${result.iRefy} mA</td>
      <td>${result.uRefx} mA</td>
    `;
  }

  private updateInvalid(reason: string) {
    this.tableRowHtml.innerHTML = '';
    const header = document.createElement('th');
    header.textContent = this.tube.name;

    this.tableRowHtml.appendChild(header);

    for (let i = 0; i < 5; i += 1) {
      const td = document.createElement('td');
      td.style.textAlign = 'center';
      const warningSpan = document.createElement('span');
      warningSpan.title = reason;
      warningSpan.classList.add('warning_sign');
      td.appendChild(warningSpan);
      this.tableRowHtml.appendChild(td);
    }
  }
}

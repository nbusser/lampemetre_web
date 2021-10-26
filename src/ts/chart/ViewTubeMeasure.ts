import MeasuresManager from '../controler/MeasuresManager';
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
    this.tableRowHtml.classList.add('measure_result_row');

    this.invalidReasonHtml.classList.add('warning_sign');
    this.invalidResultHtml.appendChild(this.invalidReasonHtml);
    this.updateInvalid('/');

    this.tube.OnCreateCapture.on((tube: Tube, capture: Capture) => this.updateDom());
    this.tube.OnRemoveCapture.on((tube: Tube, capture: Capture) => this.updateDom());
    this.tube.OnModeChange.on((tube: Tube, mode: TubeMode) => this.updateDom());

    this.updateDom();
  }

  public deleteHtml() {
    this.measureTableHtml.removeChild(this.tableRowHtml);
  }

  private updateDom() {
    this.tableRowHtml.innerHTML = `<th>${this.tube.name}</th>`;

    let uGrid = -1;
    if (this.tube.captures.size !== 0) {
      uGrid = [...this.tube.captures.values()][0].uGrid;
    }

    try {
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
        this.tableRowHtml.innerHTML += `<td>${(<number>amplificationFactor).toFixed(1)} mA/V (mS)</td>`;
      } else {
        this.tableRowHtml.innerHTML += this.getInvalidFieldHTML(amplificationFactor);
      }
    } catch (e: any) {
      console.error(e.message);
      this.updateInvalid('Un comportement inatendu est survenu. Consultez la console pour plus d\'information');
    }
  }

  private getInvalidFieldHTML = (reason: string): string => `<td>
    <span class="warning_sign" title="${reason}">
    </span>
    </td>`;

  private updateInvalid(reason: string) {
    this.tableRowHtml.innerHTML = '';
    const header = document.createElement('th');
    header.textContent = this.tube.name;

    this.tableRowHtml.appendChild(header);

    for (let i = 0; i < 3; i += 1) {
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

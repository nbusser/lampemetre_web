import * as Excel from 'exceljs';
import * as fs from 'file-saver';
import MeasuresManager from './controler/MeasuresManager';
import TubesManager from './controler/TubesManager';
import Capture from './model/Capture';
import Tube from './model/Tube';

export default class Export {
  private tubeManager: TubesManager;

  private measuresManager: MeasuresManager;

  private exportFilename = 'export.csv';

  constructor(tubesManager: TubesManager, measuresManager: MeasuresManager) {
    this.tubeManager = tubesManager;
    this.measuresManager = measuresManager;
    document.getElementById('btn_export')?.addEventListener('click', () => this.performExport());
  }

  private async performExport() {
    const workbook = new Excel.Workbook();
    workbook.creator = 'Lampemetre-web';
    workbook.created = new Date();
    workbook.modified = new Date();

    this.tubeManager.getTubes().forEach((tube: Tube) => {
      const worksheet = workbook.addWorksheet(tube.name);

      let iter = 1;
      tube.captures.forEach((capture: Capture) => {
        const table: Excel.Table = worksheet.addTable({
          name: `${this.tubeManager.getTubeId(tube)} ${capture.toString()}`,
          ref: worksheet.getCell(1, iter).address,
          headerRow: true,
          totalsRow: true,
          columns: [
            { name: 'Tension Anode', totalsRowLabel: '', filterButton: false },
            { name: `Intensité cathode (uGrid ${capture.uGrid})`, totalsRowFunction: 'none', filterButton: false },
          ],
          rows: [
          ],
        });
        for (let i = 0; i < capture.uAnode.length; i += 1) {
          table.addRow([capture.uAnode[i], capture.iCathode[i]]);
        }
        table.commit();
        iter += 3;
      });
    });

    const worksheet = workbook.addWorksheet('Mesures');
    const measuresTable: Excel.Table = worksheet.addTable({
      name: 'Measures',
      ref: 'A1',
      headerRow: true,
      totalsRow: true,
      columns: [
        { name: 'Tension anode mesure', totalsRowLabel: '', filterButton: false },
        { name: 'Nom du tube', totalsRowLabel: '', filterButton: false },
        { name: 'Tension grille', totalsRowFunction: 'none', filterButton: false },
        { name: 'Résistance interne', totalsRowFunction: 'none', filterButton: false },
        { name: 'Transductance', totalsRowFunction: 'none', filterButton: false },
        { name: 'Facteur d\'amplification', totalsRowFunction: 'none', filterButton: false },
      ],
      rows: [
      ],
    });
    this.measuresManager.getMeasures().forEach((uAnode) => {
      this.tubeManager.getTubes().forEach((tube: Tube) => {
        try {
          const measureGrid: Capture | null = tube.selectedCapture;
          if (measureGrid !== null) {
            const values = [uAnode, tube.name, measureGrid.uGrid];

            const resistance = this.measuresManager.computeInternalResistance(
              uAnode, tube, measureGrid.uGrid,
            );
            let val = typeof resistance === 'string' ? '/' : resistance;
            values.push(val);

            const transductance = this.measuresManager.computeTransductance(
              uAnode, tube, measureGrid.uGrid,
            );
            val = typeof transductance === 'string' ? '/' : transductance;
            values.push(val);

            const factor = this.measuresManager.computeAmplificationFactor(
              uAnode, tube, measureGrid.uGrid,
            );
            val = typeof factor === 'string' ? '/' : factor;
            values.push(val);

            measuresTable.addRow(values);
            measuresTable.commit();
          }
        } catch (e: Error) {
          console.log(e.message);
        }
      });
    });

    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, `${this.exportFilename}-${new Date().valueOf()}.xlsx`);
    });
  }
}

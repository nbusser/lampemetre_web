import * as Excel from 'exceljs';
import TubesManager from './controler/TubesManager';
import { ReadMethod, setupFileLoader } from './LoadFileHelper';
import Capture from './model/Capture';

// Very clumsy excel file importer
export default class Import {
  private tubeManager: TubesManager;

  constructor(
    csvFileInput: HTMLInputElement,
    btnImport: HTMLButtonElement,
    tubesManager: TubesManager,
  ) {
    this.tubeManager = tubesManager;

    setupFileLoader(
      csvFileInput,
      btnImport,
      ReadMethod.ArrayBuffer,
      (content: ArrayBuffer) => this.performImport(content),
    );
  }

  // Parses selected xlsx file
  private async performImport(excelFile: ArrayBuffer) {
    const wb = new Excel.Workbook();

    const workbook = await wb.xlsx.load(excelFile);

    // Each sheet is a tube, except for the 'last' sheet, which is measures sheet
    workbook.eachSheet((worksheet: Excel.Worksheet) => {
      // Ignore sheets named 'Mesures'
      if (worksheet.name !== 'Mesures') {
        const tube = this.tubeManager.createTube(worksheet.name);

        const captures: Capture[] = [];

        /*
        First, creates all the captures by parsing the header
        The header of each sheet contains n times the following sequence:
        'Tension Anode' | 'Intensité cathode (uGrid x)' | Blank cell
        Each of these sequences define capture for a single grid tension (here labeled 'x').
        */
        const headerRow: Excel.Row = worksheet.getRow(1);
        const regex = /[-+]?\d+(\.\d*)?/; // Used to parse the grid tension from the table header
        const uGridErrorMessage = `Valeur de tension de grille non trouvée dans l'en-tête du tube ${worksheet.name}`;
        for (let c = 2; c < worksheet.columnCount + 1; c += 3) {
          const cellValue = headerRow.getCell(c).value;
          if (cellValue === null || cellValue === undefined) {
            alert(uGridErrorMessage);
            return;
          }

          // See if uGrid is properly defined in the table header
          const foundUGrid = cellValue.toString().match(regex);
          if (foundUGrid === null || foundUGrid === undefined) {
            alert(uGridErrorMessage);
            return;
          }

          // Creates a capture with this uGrid
          const uGrid = Number.parseFloat(foundUGrid.toString());
          captures.push(new Capture([], uGrid, []));
        }

        // Then, the program iterates each rows and extracts the values for each captures in the row
        worksheet.eachRow((row: Excel.Row, rowNumber: number) => {
          if (rowNumber !== 1) {
            for (let c = 1; c < worksheet.columnCount; c += 3) {
              // Gets the correct capture
              const capture = captures[Math.floor(c / 3)];

              // Extracts the content of 'Tension Anode' and 'Intensité cathode' cells
              const uAnodeCellValue = row.getCell(c).value;
              const iCathodeCellValue = row.getCell(c + 1).value;

              if (uAnodeCellValue !== null && uAnodeCellValue !== undefined
                && iCathodeCellValue !== null && iCathodeCellValue !== undefined) {
                // Tries to parse values to float
                const uAnode = Number.parseFloat(uAnodeCellValue.toString());
                const iCathode = Number.parseFloat(iCathodeCellValue.toString());

                // Ends function here if we cannot parse the read values to float
                const parseError = `Erreur lors de la lecture de la catpure de tension grille ${capture.uGrid}.\n
                Valeur non numérique trouvée: `;
                if (Number.isNaN(uAnode)) {
                  alert(`${parseError}'${uAnodeCellValue}' (tension anode)`);
                  return;
                }
                if (Number.isNaN(iCathode)) {
                  alert(`${parseError}'${iCathodeCellValue}' (intensité cathode)`);
                  return;
                }

                capture.uAnode.push(uAnode);
                capture.iCathode.push(iCathode);
              }
            }
          }
        });

        // Adds capture to the tube
        captures.forEach((capture) => {
          tube.createCapture(capture.uAnode, capture.uGrid, capture.iCathode);
        });
      }
    });
  }
}

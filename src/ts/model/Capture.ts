export default class Capture {
  public uGrille: number;

  public yValues: number[];

  public tube: any;

  constructor(uGrille: number, yValues: number[], tube: any) {
    this.uGrille = uGrille;
    this.yValues = yValues;

    if (tube.constructor.name !== 'Tube') {
      throw TypeError(`Expected Tube, got ${tube.constructor.name}`);
    }
    this.tube = tube;
  }
}

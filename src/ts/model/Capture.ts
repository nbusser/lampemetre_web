export default class Capture {
  public uAnode: number[];

  public uGrille: number;

  public iCathode: number[];

  public tube: any;

  constructor(uAnode: number[], uGrille: number, iCathode: number[], tube: any) {
    this.uAnode = uAnode;
    this.uGrille = uGrille;
    this.iCathode = iCathode;

    if (tube.constructor.name !== 'Tube') {
      throw TypeError(`Expected Tube, got ${tube.constructor.name}`);
    }
    this.tube = tube;
  }
}

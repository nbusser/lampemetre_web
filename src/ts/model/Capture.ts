export default class Capture {
  public uAnode: number[];

  public uGrille: number;

  public iCathode: number[];

  constructor(uAnode: number[], uGrille: number, iCathode: number[]) {
    this.uAnode = uAnode;
    this.uGrille = uGrille;
    this.iCathode = iCathode;
  }

  toString(): string {
    return `-${this.uGrille}V`;
  }
}

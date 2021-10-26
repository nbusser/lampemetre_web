export default class Capture {
  public uAnode: number[];

  public uGrid: number;

  public iCathode: number[];

  constructor(uAnode: number[], uGrid: number, iCathode: number[]) {
    this.uAnode = uAnode;
    this.uGrid = uGrid;
    this.iCathode = iCathode;
  }

  toString(): string {
    return `-${this.uGrid}V`;
  }
}

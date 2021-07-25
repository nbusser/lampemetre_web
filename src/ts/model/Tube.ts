import Capture from './Capture';

export default class Tube {
  public name: string;

  public captures: Capture[] = [];

  constructor(name: string) {
    this.name = name;
  }

  createCapture(uGrille: number, values: number[]): Capture {
    const createdCapture = new Capture(uGrille, values, this);
    this.captures.push(createdCapture);
    return createdCapture;
  }
}

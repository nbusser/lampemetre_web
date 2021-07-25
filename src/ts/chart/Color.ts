export default class Color {
  public red: number;

  public green: number;

  public blue: number;

  public transparency: number;

  constructor(red:number, green:number, blue:number, transparency: number) {
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.transparency = transparency;
  }

  toString(): string {
    return `rgba(${this.red},${this.green},${this.blue},${this.transparency})`;
  }
}

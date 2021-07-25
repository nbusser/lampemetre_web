import Tube from '../model/Tube';

export default abstract class TubeManager {
  private static tubes: Tube[] = [];

  public static createTube(name: string): Tube {
    const createdTube = new Tube(name);
    this.tubes.push(createdTube);

    return createdTube;
  }

  public static removeTube(tube: Tube) {
    this.tubes.splice(this.tubes.indexOf(tube));
  }

  public static getTube(index: number): Tube {
    return this.tubes[index];
  }

  public static getTubeIndex(tube: Tube): number {
    return this.tubes.indexOf(tube);
  }

  public static getNumberOfTubes(): number {
    return this.tubes.length;
  }

  public static clearTubes() {
    this.tubes = [];
  }
}

import Tube from './model/Tube';
import Capture from './model/Capture';
import TubeManager from './controler/TubesManager';
import Plot from './chart/Plot';

const plot = Plot.getInstance();

const xValues: number[] = [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150];

const yValues: number[] = [7, 8, 8, 9, 9, 9, 10, 11, 14, 14, 15];
const yValues2: number[] = [15, 3, 1, 15, 4, 3, 0, 1, 4, 6, 15];
const yValues3: number[] = [5, 2, 5, 9, 2, 6, 9, 1, 14, 7, 3];

const tube0: Tube = TubeManager.createTube('Tubi');
const tube1: Tube = TubeManager.createTube('Tuba');

const capture0: Capture = tube0.createCapture(xValues, 0, yValues);
const capture1: Capture = tube0.createCapture(xValues, 1, yValues2);
const capture2: Capture = tube1.createCapture(xValues, -5, yValues3);

plot.drawCapture(capture0);
plot.drawCapture(capture1);
plot.drawCapture(capture2);

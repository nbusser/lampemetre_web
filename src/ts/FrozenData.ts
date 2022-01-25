import Capture from './model/Capture';

/*
Frozen data is the bare representation of user's workspace
It gets rid of all the handlers and maps the maps' values to arrays
It is used by SaveLoad object to save or load the workspace to JSON file
*/
export interface FrozenData {
  tubes: FrozenTube[],
  measures: number[],
  notes: string,
}

/*
Frozen representation of a tube
Note that Capture object does not need to be frozen since default toJSON stringify will
automatically remove its methods and it has no superfluous attributes such as handlers
*/
export interface FrozenTube {
  name: string,
  captures: Capture[],
  selectedCaptureIndex: number,
}

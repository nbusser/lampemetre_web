export enum ReadMethod {
  ArrayBuffer,
  Text,
}

/*
This helper handles file loading
It is used by both Import and SaveLoad modules
These two features are activated by simply clicking a button.
This function actually manages an hidden input field used to open the file browser.
It then handles the several steps for loading the file and finally runs a callback.
*/
export const setupFileLoader = (
  hiddenInput: HTMLInputElement,
  loadButton: HTMLButtonElement,
  readMethod: ReadMethod,
  callback: Function,
) => {
  // Redirects click to the load button to click to the import browser
  loadButton.addEventListener('click', () => hiddenInput.click());

  // When the file is chosen
  hiddenInput.addEventListener('change', (evt: any) => {
    const errorMessage = 'Une erreur est survenue pendant la lecture du fichier';
    if (evt.target === null) {
      alert(errorMessage);
      return;
    }

    // Selected file object
    const file = evt.target.files[0];

    // Reads the selected file
    const reader = new FileReader();

    // Triggered when the file reader finished to read the file
    reader.addEventListener('load', (event) => {
      if (event.target === null
              || event.target.result === null) {
        alert(errorMessage);
        return;
      }
      // Resets input field
      // eslint-disable-next-line no-param-reassign
      hiddenInput.value = '';

      // If no error, sends the opened file to the callback
      callback(event.target.result);
    });

    // Reads the file using the appropriate method
    if (readMethod === ReadMethod.ArrayBuffer) {
      reader.readAsArrayBuffer(file);
    } else if (readMethod === ReadMethod.Text) {
      reader.readAsText(file);
    }
  });
};

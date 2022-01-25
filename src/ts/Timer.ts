/*
This class acts as a simple timer 'widget'
The user can use it to know if his lamps are hot enough
It also allows an option to block any capture before it reached 0
*/
export default class Timer {
  private timerText: HTMLParagraphElement;

  private isBlockingCheckbox: HTMLInputElement;

  private maxDuration: number;

  private secondsLeft: number = 0;

  constructor(
    timerText: HTMLParagraphElement,
    resetButton: HTMLButtonElement,
    isBlockingCheckbox: HTMLInputElement,
    duration: number,
  ) {
    this.timerText = timerText;

    this.isBlockingCheckbox = isBlockingCheckbox;

    this.maxDuration = duration;

    resetButton.addEventListener('click', () => this.resetTimer());

    this.updateTimer(false);
    setInterval(() => this.updateTimer(true), 1000);
  }

  private resetTimer() {
    this.secondsLeft = this.maxDuration;
    this.updateTimer(false);
  }

  // Called every second and when initializing Timer class
  private updateTimer(decrement: boolean) {
    // Prints the timer value on two digits
    this.timerText.textContent = this.secondsLeft.toLocaleString('fr', {
      minimumIntegerDigits: 2,
      useGrouping: false,
    });

    if (this.secondsLeft === 0) {
      this.timerText.style.color = '#000000';
    } else {
      this.timerText.style.color = '#CF2400';

      if (decrement) {
        this.secondsLeft -= 1;
      }
    }
  }

  public isOver(): boolean {
    return this.secondsLeft === 0;
  }

  public shouldBlock(): boolean {
    return this.isBlockingCheckbox.checked;
  }

  // Called by ViewTube when '+' button is clicked
  // If the timer is not 0 and the user checked the checkbox, we pop an alert window and return true
  public blockIfNecessary(): boolean {
    if (this.shouldBlock() && !this.isOver()) {
      alert('Les lampes de sont pas encore chaudes. Veuillez attendre la fin du minuteur');
      return true;
    }
    return false;
  }
}

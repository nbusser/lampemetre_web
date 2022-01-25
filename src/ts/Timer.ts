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

  private updateTimer(decrement: boolean) {
    this.timerText.textContent = this.secondsLeft.toString();

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

  public blockIfNecessary(): boolean {
    if (this.shouldBlock() && !this.isOver()) {
      alert('Les lampes de sont pas encore chaudes. Veuillez attendre la fin du minuteur');
      return true;
    }
    return false;
  }
}

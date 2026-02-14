import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-intro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.css']
})
export class IntroComponent {
  @Output() next = new EventEmitter<void>();
  isClaimed = false;
  animateOut = false;
  animationDone = false;

  claimGift() {
    this.isClaimed = true;

    // Trigger animation
    setTimeout(() => {
      this.animateOut = true;
    }, 50);

    // Transition
    setTimeout(() => {
      this.animationDone = true;
      this.next.emit();
    }, 2400); // Matches new animation duration (slightly less to prevent flash)
  }
}

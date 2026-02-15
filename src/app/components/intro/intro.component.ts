import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import confetti from 'canvas-confetti';

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

    // Trigger Confetti
    const colors = ['#ffccd5', '#ffb7b2', '#ff9aa2', '#e2f0cb', '#b5ead7'];

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors,
      zIndex: 100
    });

    // Fire a second burst for good measure
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
        zIndex: 100
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
        zIndex: 100
      });
    }, 250);


    
    this.animateOut = true;

    // Transition
    setTimeout(() => {
      this.animationDone = true;
      this.next.emit();
    }, 2400);
  }
}

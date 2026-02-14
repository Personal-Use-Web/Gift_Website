import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-intro',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-pink-50 to-white overflow-hidden relative">
      <div *ngIf="!isClaimed" class="text-center z-10 animate-fade-in-up">
        <h1 class="text-4xl md:text-6xl font-serif text-pink-600 mb-8 drop-shadow-sm">For You, My Love</h1>
        
        <div class="cursor-pointer group relative transition-transform duration-500 hover:scale-105" (click)="claimGift()">
          <!-- Placeholder bouquet/chocolates -->
          <div class="text-9xl filter drop-shadow-md animate-bounce-slow">💐 🍫</div>
          
          <p class="mt-8 text-xl text-slate-600 animate-pulse font-light tracking-wide">
            Click to accept
          </p>
        </div>
      </div>

      <!-- Animation Container -->
      <div *ngIf="isClaimed" class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div class="text-[15rem] transition-all duration-[1500ms] ease-in-out transform"
             [class.scale-[5]]="animateOut"
             [class.translate-y-full]="false" 
             [class.opacity-0]="animationDone">
             <!-- The item moves "towards" the user (scales up massively) -->
          💐 🍫
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-bounce-slow {
      animation: bounce 3s infinite;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(-5%); }
      50% { transform: translateY(0); }
    }
    .animate-fade-in-up {
        animation: fadeInUp 1s ease-out;
    }
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class IntroComponent {
  @Output() next = new EventEmitter<void>();
  isClaimed = false;
  animateOut = false;
  animationDone = false;

  claimGift() {
    this.isClaimed = true;

    // Trigger the "move towards screen" animation
    setTimeout(() => {
      this.animateOut = true;
    }, 50);

    // After animation, emit next
    setTimeout(() => {
      this.animationDone = true;
      this.next.emit();
    }, 1500);
  }
}

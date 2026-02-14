import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-screen w-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-teal-50 overflow-hidden relative">
      <div class="max-w-4xl w-full p-8 relative min-h-[400px] flex items-center justify-center">
        
        <div *ngFor="let note of notes; let i = index" 
             class="absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ease-in-out transform p-8 bg-white/40 backdrop-blur-sm rounded-2xl shadow-xl card-glow border border-white/50"
             [class.translate-x-0]="i === currentIndex"
             [class.opacity-100]="i === currentIndex"
             [class.translate-x-full]="i > currentIndex"
             [class.translate-x-[-100%]]="i < currentIndex"
             [class.opacity-0]="i !== currentIndex"
             [class.scale-100]="i === currentIndex"
             [class.scale-90]="i !== currentIndex">
             
          <h2 class="text-3xl md:text-5xl font-serif text-pink-700 mb-6 text-center italic leading-tight">{{ note.title }}</h2>
          <p class="text-lg md:text-2xl text-slate-700 text-center font-light leading-relaxed max-w-2xl">
            {{ note.content }}
          </p>
          <div class="mt-8 text-pink-400 text-sm tracking-widest uppercase">Slide {{ i + 1 }} / {{ notes.length }}</div>
        </div>

      </div>
      
      <!-- Navigation Buttons -->
      <button (click)="prevSlide()" class="absolute left-4 md:left-12 z-20 p-4 text-pink-600 bg-white/30 hover:bg-white/60 rounded-full transition-all backdrop-blur-sm shadow-sm" [class.opacity-0]="currentIndex === 0" [disabled]="currentIndex === 0">
        <span class="text-2xl">&#10094;</span>
      </button>

      <button (click)="nextSlide()" class="absolute right-4 md:right-12 z-20 p-4 text-pink-600 bg-white/30 hover:bg-white/60 rounded-full transition-all backdrop-blur-sm shadow-sm">
        <span class="text-2xl">&#10095;</span>
      </button>

      <!-- Progress Bar -->
      <div class="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div class="h-full bg-pink-500 transition-all duration-300" [style.width.%]="((currentIndex + 1) / notes.length) * 100"></div>
      </div>
    </div>
  `,
  styles: [`
    .card-glow {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
  `]
})
export class CarouselComponent implements OnInit, OnDestroy {
  @Output() next = new EventEmitter<void>();

  notes = [
    { title: "My Dearest", content: "Every moment with you feels like a beautiful dream I never want to wake up from." },
    { title: "The Little Things", content: "I love the way your eyes light up when you smile, and how you make even the mundane days feel special." },
    { title: "Better Together", content: "We've had our ups and downs, but every challenge only makes us stronger. I choose you, every single day." },
    { title: "My Promise", content: "I promise to be better, to listen more, and to love you even when things are tough." },
    { title: "Forever", content: "You are my best friend, my soulmate, and my greatest adventure." }
  ];

  currentIndex = 0;
  intervalId: any;

  ngOnInit() {
    this.startCarousel();
  }

  ngOnDestroy() {
    this.stopCarousel();
  }

  startCarousel() {
    this.stopCarousel();
    this.intervalId = setInterval(() => {
      this.nextSlide(true);
    }, 60000); // 60 seconds
  }

  stopCarousel() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  prevSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.startCarousel(); // Reset timer
    }
  }

  nextSlide(auto = false) {
    if (this.currentIndex < this.notes.length - 1) {
      this.currentIndex++;
      if (!auto) this.startCarousel(); // Reset timer on manual click
    } else if (!auto) {
      // Manual click on last slide triggers next section immediately
      this.stopCarousel();
      this.next.emit();
    } else {
      // Auto slide ended
      this.stopCarousel();
      setTimeout(() => this.next.emit(), 2000);
    }
  }
}

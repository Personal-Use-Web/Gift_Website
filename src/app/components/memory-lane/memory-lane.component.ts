import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-memory-lane',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-screen w-full bg-slate-50 overflow-hidden relative flex flex-col">
      <div class="absolute top-0 left-0 w-full z-10 bg-gradient-to-b from-white via-white/80 to-transparent p-6 pb-12">
        <h2 class="text-4xl md:text-6xl font-serif text-slate-800 text-center tracking-tight">Our Memories</h2>
      </div>

      <div class="flex-1 grid grid-cols-3 gap-4 p-4 overflow-hidden h-full mt-20">
        <!-- Column 1: Moves Up -->
        <div class="flex flex-col gap-4 animate-scroll-up">
          <div *ngFor="let img of col1" class="w-full aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden shadow-md transform hover:scale-105 transition-transform duration-300">
             <!-- Placeholder images using colors or text -->
             <div class="w-full h-full flex items-center justify-center text-4xl bg-rose-100 text-rose-300 font-bold">Photo {{img}}</div>
          </div>
           <!-- Duplicate for infinite scroll illusion -->
           <div *ngFor="let img of col1" class="w-full aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden shadow-md">
             <div class="w-full h-full flex items-center justify-center text-4xl bg-rose-100 text-rose-300 font-bold">Photo {{img}}</div>
          </div>
        </div>

        <!-- Column 2: Moves Down -->
        <div class="flex flex-col gap-4 animate-scroll-down">
          <div *ngFor="let img of col2" class="w-full aspect-[4/5] bg-gray-200 rounded-lg overflow-hidden shadow-md transform hover:scale-105 transition-transform duration-300">
             <div class="w-full h-full flex items-center justify-center text-4xl bg-teal-100 text-teal-300 font-bold">Moment {{img}}</div>
          </div>
          <!-- Duplicate -->
           <div *ngFor="let img of col2" class="w-full aspect-[4/5] bg-gray-200 rounded-lg overflow-hidden shadow-md">
             <div class="w-full h-full flex items-center justify-center text-4xl bg-teal-100 text-teal-300 font-bold">Moment {{img}}</div>
          </div>
        </div>

        <!-- Column 3: Moves Up -->
        <div class="flex flex-col gap-4 animate-scroll-up-slow">
          <div *ngFor="let img of col3" class="w-full aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden shadow-md transform hover:scale-105 transition-transform duration-300">
            <div class="w-full h-full flex items-center justify-center text-4xl bg-indigo-100 text-indigo-300 font-bold">Snap {{img}}</div>
          </div>
          <!-- Duplicate -->
          <div *ngFor="let img of col3" class="w-full aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden shadow-md">
            <div class="w-full h-full flex items-center justify-center text-4xl bg-indigo-100 text-indigo-300 font-bold">Snap {{img}}</div>
          </div>
        </div>
      </div>

      <div class="absolute bottom-8 right-8 z-20">
         <button (click)="next.emit()" class="px-8 py-3 bg-white/90 backdrop-blur text-slate-800 font-serif rounded-full shadow-lg hover:bg-rose-50 transition-colors duration-300 flex items-center gap-2">
           Next Chapter <span>→</span>
         </button>
      </div>
    </div>
  `,
  styles: [`
    /* Optimized animations */
    .animate-scroll-up {
      animation: scrollUp 40s linear infinite;
      will-change: transform;
    }
    .animate-scroll-down {
      animation: scrollDown 50s linear infinite;
      will-change: transform;
    }
    .animate-scroll-up-slow {
      animation: scrollUp 60s linear infinite;
      will-change: transform;
    }

    @keyframes scrollUp {
      0% { transform: translateY(0); }
      100% { transform: translateY(-50%); }
    }
    
    @keyframes scrollDown {
      0% { transform: translateY(-50%); }
      100% { transform: translateY(0); }
    }
  `]
})
export class MemoryLaneComponent {
  @Output() next = new EventEmitter<void>();

  col1 = [1, 2, 3, 4, 5];
  col2 = [6, 7, 8, 9, 10];
  col3 = [11, 12, 13, 14, 15];
}

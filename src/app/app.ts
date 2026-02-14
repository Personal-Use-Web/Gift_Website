import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntroComponent } from './components/intro/intro.component';
import { CarouselComponent } from './components/carousel/carousel.component';
import { MemoryLaneComponent } from './components/memory-lane/memory-lane.component';
import { TimeCounterComponent } from './components/time-counter/time-counter.component';
import { CardsComponent } from './components/cards/cards.component';
import { GlobeComponent } from './components/globe/globe.component';

type Section = 'intro' | 'carousel' | 'memory' | 'cards' | 'globe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    IntroComponent,
    CarouselComponent,
    MemoryLaneComponent,
    TimeCounterComponent,
    CardsComponent,
    GlobeComponent
  ],
  template: `
    <main class="w-full h-screen overflow-hidden font-sans text-slate-800 bg-white">
      <!-- Persistent Time Counter (Visible after intro) -->
      <app-time-counter *ngIf="currentSection !== 'intro'"></app-time-counter>

      <!-- Sections -->
      <ng-container [ngSwitch]="currentSection">
        
        <app-intro *ngSwitchCase="'intro'" (next)="goTo('carousel')"></app-intro>
        
        <app-carousel *ngSwitchCase="'carousel'" (next)="goTo('memory')"></app-carousel>
        
        <app-memory-lane *ngSwitchCase="'memory'" (next)="goTo('cards')"></app-memory-lane>

        <app-cards *ngSwitchCase="'cards'" (next)="goTo('globe')"></app-cards>

        <app-globe *ngSwitchCase="'globe'" (restart)="restart()"></app-globe>

      </ng-container>
    </main>
  `,
  styles: []
})
export class App {
  currentSection: Section = 'intro';

  goTo(section: Section) {
    this.currentSection = section;
  }

  restart() {
    this.currentSection = 'intro';
  }
}

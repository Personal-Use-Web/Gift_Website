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
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
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

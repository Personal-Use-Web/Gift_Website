import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit, OnDestroy {
  @Output() next = new EventEmitter<void>();

  notes = [
    { title: "My Dear", content: "I Enjoy every moment with you, it feels like a beautiful dream I never want to wake up from." },
    { title: "The Little Things", content: "I love the way your eyes light up when you smile, and how you make me feel special." },
    { title: "Better Together", content: "We've had our ups and downs, but every fights only makes us stronger." },
    { title: "My Promise", content: "I promise to be better, to understand more, and to love you even when things are tough." },
    { title: "Forever I Love You", content: "You are my best friend, my soulmate, and my greatest strength." }
  ];

  currentIndex = 0;
  intervalId: any;

  // Touch/Swipe Logic
  private touchStartX = 0;
  private touchEndX = 0;
  private minSwipeDistance = 50;

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
      if (!auto) this.startCarousel(); // Reset timer on manual swipe
    } else if (!auto) {
      // Manual swipe on last slide triggers next section
      this.stopCarousel();
      this.next.emit();
    } else {
      // Auto slide ended
      this.stopCarousel();
      setTimeout(() => this.next.emit(), 2000);
    }
  }

  // Swipe Handlers
  onTouchStart(e: TouchEvent) {
    this.touchStartX = e.changedTouches[0].screenX;
  }

  onTouchEnd(e: TouchEvent) {
    this.touchEndX = e.changedTouches[0].screenX;
    this.handleSwipe();
  }

  onMouseDown(e: MouseEvent) {
    this.touchStartX = e.screenX;
  }

  onMouseUp(e: MouseEvent) {
    this.touchEndX = e.screenX;
    this.handleSwipe();
  }

  private handleSwipe() {
    const swipeDistance = this.touchEndX - this.touchStartX;

    if (Math.abs(swipeDistance) > this.minSwipeDistance) {
      if (swipeDistance < 0) {
        // Swipe Left -> Next
        this.nextSlide();
      } else {
        // Swipe Right -> Prev
        this.prevSlide();
      }
    }
  }
}

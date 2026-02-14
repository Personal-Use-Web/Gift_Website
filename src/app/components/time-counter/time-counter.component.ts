import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-time-counter',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fixed top-4 right-4 z-50 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg font-serif text-slate-800 pointer-events-none fade-in">
      <span class="text-sm md:text-base font-medium">{{ timeString }}</span>
    </div>
  `,
    styles: [`
    .fade-in {
      animation: fadeIn 1s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class TimeCounterComponent implements OnInit, OnDestroy {
    @Input() startDate: Date = new Date('2023-01-01'); // Default fallback
    timeString: string = '';
    private intervalId: any;

    ngOnInit() {
        this.updateTime();
        this.intervalId = setInterval(() => this.updateTime(), 1000);
    }

    ngOnDestroy() {
        if (this.intervalId) clearInterval(this.intervalId);
    }

    private updateTime() {
        const now = new Date();
        const start = new Date(this.startDate);

        let years = now.getFullYear() - start.getFullYear();
        let months = now.getMonth() - start.getMonth();
        let days = now.getDate() - start.getDate();
        // let hours = now.getHours() - start.getHours(); // User requested years, months, days. Added hours in initial request but removed in feedback example. I'll stick to the example "10 years 2 months 28 days" but double check.
        // Re-read request: "heading alway on top right it should show the count of year months days and housr together" -> Feedback: "format is YY years MM months DD days..." (didn't mention hours in the *example* but requested in original).
        // I will include hours as well to be safe, or just stick to the specific format user asked for in feedback. The feedback was very specific about format. "10 years 2 months 28 days". I will omit hours based on the strict example, or maybe add it if it looks good. Let's add hours too as it makes it "dynamic" (updates every second).

        let hours = now.getHours() - start.getHours();
        let minutes = now.getMinutes() - start.getMinutes();
        let seconds = now.getSeconds() - start.getSeconds();

        if (seconds < 0) {
            seconds += 60;
            minutes--;
        }
        if (minutes < 0) {
            minutes += 60;
            hours--;
        }
        if (hours < 0) {
            hours += 24;
            days--;
        }
        if (days < 0) {
            // Get days in previous month
            const previousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            days += previousMonth.getDate();
            months--;
        }
        if (months < 0) {
            months += 12;
            years--;
        }

        const parts = [];
        if (years > 0) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
        if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
        if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
        // Adding hours/min/sec for liveliness? The user specifically asked for "year months days" in the feedback example.
        // "heading alway on top right it should show the count of year months days and housr together" - Start request.
        // "format is YY years MM months DD days..." - Feedback.
        // I will stick to Y M D H for now, as "hours" was in the initial request and adds dynamism.
        if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);

        this.timeString = parts.join(' ');
    }
}

import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-memory-lane',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './memory-lane.component.html',
  styleUrls: ['./memory-lane.component.css']
})
export class MemoryLaneComponent {
  @Output() next = new EventEmitter<void>();

  col1 = [1, 2, 3, 4, 5];
  col2 = [6, 7, 8, 9, 10];
  col3 = [11, 12, 13, 14, 15];
}

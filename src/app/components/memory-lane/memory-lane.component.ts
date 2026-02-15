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

  col1 = ["photo_6091182620340325648_y.jpg", "photo_6158738027791370560_y.jpg", "photo_6091182620340325659_x.jpg", "photo_6091182620340325653_y.jpg", "photo_6158738027791370671_y.jpg"];
  col2 = ["photo_6091182620340325645_y.jpg", "photo_6091182620340325663_y.jpg", "photo_6091182620340325658_y.jpg", "photo_6091182620340325657_y.jpg", "photo_6091182620340325656_y.jpg", "photo_6091182620340325664_y.jpg", "Screenshot_2025_08_13_21_49_01_61_6012fa4d4ddec268fc5c7112cbb265e7.jpg", "IMG20250615173631.jpg"];
  col3 = ["photo_6091182620340325661_y.jpg", "photo_6091182620340325662_x.jpg", "photo_6091182620340325646_y.jpg", "photo_6091182620340325644_y.jpg", "photo_6091182620340325655_y.jpg"];
}

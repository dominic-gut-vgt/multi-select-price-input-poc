import { CommonModule } from '@angular/common';
import { Component, computed, input, model, signal } from '@angular/core';

@Component({
  selector: 'app-one-hour-block',
  imports: [CommonModule],
  templateUrl: './one-hour-block.component.html',
  styleUrl: './one-hour-block.component.scss'
})
export class OneHourBlockComponent {
  //inputs
  hour = input.required<number>();
  maxInterdayValue = input.required<number>();
  quarterHouerValues = model.required<number[]>(); // 4 quarter hours in an hour
  quarterHourChangeAllowed = model.required<boolean[]>(); //4 booleans if hour could be changed

  protected quarterHourValuesAsPercentages = computed(() => {
    return this.quarterHouerValues().map(val => val / this.maxInterdayValue()*100);
  });

}

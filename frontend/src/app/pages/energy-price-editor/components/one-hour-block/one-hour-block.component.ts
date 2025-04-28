import { CommonModule } from '@angular/common';
import { Component, computed, input, model, output, signal } from '@angular/core';

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
  quarterHourChangeAllowed = input.required<boolean[]>(); //4 booleans if hour could be changed
  quarterHourValues = model.required<number[]>(); // 4 quarter hours in an hour
  quarterHoursSelection = model.required<boolean[]>(); // 4 values if quarter hour is selected

  protected quarterHourValuesAsPercentages = computed(() => {
    return this.quarterHourValues().map(val => val / this.maxInterdayValue() * 100);
  });

  protected toggleQuarterHourSelection(ind: number): void {
    this.quarterHoursSelection.update((state) => {
      const newState: boolean[] = [...state];
      newState[ind] = !newState[ind];
      return newState;
    });
  }

  protected setSelectedOfFullHour(isSelected:boolean): void {
    this.quarterHoursSelection.update((state) => {
      return Array.from({ length: state.length }, () => isSelected);
    });
  }

}

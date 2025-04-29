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
  index = input.required<number>();
  maxInterdayValue = input.required<number>();
  quarterHourEditAllowed = input.required<boolean[]>(); //4 booleans if hour could be changed
  quarterHourValues = model.required<number[]>(); // 4 quarter hour values (prices) in an hour
  quarterHoursSelection = model.required<boolean[]>(); // 4 booleans if quarter hour is selected

  protected quarterHourValuesAsPercentages = computed(() => {
    return this.quarterHourValues().map(val => val / this.maxInterdayValue() * 100);
  });

  protected toggleQuarterHourSelection(ind: number): void {
   if(this.quarterHourEditAllowed()[ind]){
    this.quarterHoursSelection.update((state) => {
      const newState: boolean[] = [...state];
      newState[ind] = !newState[ind];
      return newState;
    });
   }
  }

  public setSelectedOfFullHour(force:boolean=false,isSelected:boolean=true): void {
    if(!force){
      if (this.quarterHoursSelection().find(s => !s) === undefined) {
        isSelected = false;
      }
    }
   
    this.quarterHoursSelection.update((state) => {
      const newState:boolean[]=[];
      for(let i=0;i<state.length;i++){
        newState.push(isSelected && this.quarterHourEditAllowed()[i]);
      }
      return newState;
    });
  }

  public getAllQuarterHoursSelected(): boolean {
    return this.quarterHoursSelection().find((s,i) => !s && this.quarterHourEditAllowed()[i]) === undefined;
  }

}

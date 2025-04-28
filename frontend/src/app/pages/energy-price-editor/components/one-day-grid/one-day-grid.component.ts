import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { OneHourBlockComponent } from '../one-hour-block/one-hour-block.component';
import { OneDayData } from '../../interfaces/one-day-data.interface';


@Component({
  selector: 'app-one-day-grid',
  templateUrl: './one-day-grid.component.html',
  styleUrl: './one-day-grid.component.scss',
  imports: [CommonModule, OneHourBlockComponent],
})
export class OneDayGridComponent {
  //inputs
  oneDayData = input<OneDayData | undefined>();

  //derived data
  protected maxInterdayValue = computed(() => {
    return Math.max(...this.oneDayData()?.prices?.flat() ?? [0]);
  });

  // flags
  private quarterHourSelectionMap: boolean[][] = Array.from({ length: 24 }, () => Array.from({ length: 4 }, () => false));

  //derived flags
  protected quarterHourChangeAllowedMap = computed(() => {
    const allowedMap = Array.from({ length: 24 }, () => Array.from({ length: 4 }, () => false));
    const oneDayData = this.oneDayData();
    if (oneDayData) {
      const now = new Date();
      const currentDayOfData = new Date(oneDayData.date);

      for (let i = 0; i < 24; i++) {
        for (let j = 0; j < 4; j++) {
          const isBeforeNow = currentDayOfData.getTime() < now.getTime(); //todo correct check
          if (isBeforeNow) {
            allowedMap[i][j] = false;
          } else {
            allowedMap[i][j] = true;
          }
        }
      }
    }

    return allowedMap
  });


  protected selectRow(rowInd: number): void {

  }

  protected selectCol(colInd: number): void {

  }


}

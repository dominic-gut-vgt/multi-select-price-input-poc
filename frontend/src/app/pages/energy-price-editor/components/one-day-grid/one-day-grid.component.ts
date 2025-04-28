import { CommonModule } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { OneHourBlockComponent } from '../one-hour-block/one-hour-block.component';
import { OneDayData } from '../../interfaces/one-day-data.interface';

interface RowBounds {
  min: number,
  max: number
}

@Component({
  selector: 'app-one-day-grid',
  templateUrl: './one-day-grid.component.html',
  styleUrl: './one-day-grid.component.scss',
  imports: [CommonModule, OneHourBlockComponent],
})
export class OneDayGridComponent {
  //inputs
  oneDayData = input.required<OneDayData>();

  //consts
  private readonly itemsPerRow = 4;

  //derived data
  protected maxInterdayValue = computed(() => {
    return Math.max(...this.oneDayData().prices.flat() ?? [0]);
  });
  protected rowBounds = computed<RowBounds[]>(() => {
    const groupedMaxes: RowBounds[] = [];
    for (let i = 0; i < this.oneDayData().prices.length; i += this.itemsPerRow) {
      const group = this.oneDayData().prices.slice(i, i + this.itemsPerRow);
      const flatGroup = group.flat(); // flatten 4 rows into one array
      groupedMaxes.push({
        min: Math.min(...flatGroup),
        max: Math.max(...flatGroup),
      });
    }
    return groupedMaxes;
  });

  // flags
  protected quarterHourSelection= signal<boolean[][]>(Array.from({ length: 24 }, () => Array.from({ length: 4 }, () => false)));

  //derived flags
  protected quarterHourChangeAllowedMap = computed(() => {
    const allowedMap = Array.from({ length: 24 }, () => Array.from({ length: 4 }, () => false));
    const now = new Date();
    const currentDayOfData = new Date(this.oneDayData().date);

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


    return allowedMap
  });


  protected selectRow(rowInd: number): void {
    
  }

  protected selectCol(colInd: number): void {

  }


}

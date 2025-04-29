import { CommonModule } from '@angular/common';
import { Component, computed, input, output, signal, viewChildren } from '@angular/core';
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
  protected readonly itemsPerRow = 4;

  //viewchildren
  private oneHourBlocks = viewChildren(OneHourBlockComponent);

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
  protected quarterHoursSelection = signal<boolean[][]>(Array.from({ length: 24 }, () => Array.from({ length: 4 }, () => false))); // which quarter hours are selected

  //derived flags
  protected quarterHourChangeAllowed = computed(() => {
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
    const oneHourBlocksToSelect = this.oneHourBlocks()?.filter(block => block.index() >= rowInd * this.itemsPerRow && block.index() < rowInd * this.itemsPerRow + this.itemsPerRow);
    const isSelected = !this.getAllQuarterHoursOfOneHourBlocksAreSelected(oneHourBlocksToSelect);
    oneHourBlocksToSelect.forEach(block => block?.setSelectedOfFullHour(true, isSelected))
  }

  protected selectCol(colInd: number): void {
    const oneHourBlocksToSelect = this.oneHourBlocks()?.filter(block => block.index() % this.itemsPerRow === colInd);
    const isSelected = !this.getAllQuarterHoursOfOneHourBlocksAreSelected(oneHourBlocksToSelect);
    oneHourBlocksToSelect.forEach(block => block?.setSelectedOfFullHour(true, isSelected))
  }

  //special selectors
  protected selectQuartet(ind: number): void {
    const oneHourBlocksToSelect = [
      this.oneHourBlocks()?.at(ind),
      this.oneHourBlocks()?.at(ind + 1),
      this.oneHourBlocks()?.at(ind + this.itemsPerRow),
      this.oneHourBlocks()?.at(ind + this.itemsPerRow + 1),
    ]
    const isSelected = !this.getAllQuarterHoursOfOneHourBlocksAreSelected(oneHourBlocksToSelect);
    oneHourBlocksToSelect.forEach(block => block?.setSelectedOfFullHour(true, isSelected))
  }

  protected selectTwoVertical(ind: number): void {
    const oneHourBlocksToSelect = [
      this.oneHourBlocks()?.at(ind),
      this.oneHourBlocks()?.at(ind + this.itemsPerRow),
    ]
    const isSelected = !this.getAllQuarterHoursOfOneHourBlocksAreSelected(oneHourBlocksToSelect);
    oneHourBlocksToSelect.forEach(block => block?.setSelectedOfFullHour(true, isSelected))
  }

  protected selectTwoHorizontal(ind: number): void {
    const oneHourBlocksToSelect = [
      this.oneHourBlocks()?.at(ind),
      this.oneHourBlocks()?.at(ind + 1),
    ]
    const isSelected = !this.getAllQuarterHoursOfOneHourBlocksAreSelected(oneHourBlocksToSelect);
    oneHourBlocksToSelect.forEach(block => block?.setSelectedOfFullHour(true, isSelected))
  }

  //events
  protected onOneHourQuarterHoursSelecionChange(quarterHoursSelection: boolean[], hour: number): void {
    this.quarterHoursSelection.update((state) => {
      const newState: boolean[][] = JSON.parse(JSON.stringify(state));
      newState[hour] = quarterHoursSelection;
      return newState;
    })
  }

  //getters
  getQuarterHoursSelection(): boolean[][] {
    return this.quarterHoursSelection();
  }

  getAllQuarterHoursOfOneHourBlocksAreSelected(oneHourBlocks: (OneHourBlockComponent | undefined)[]): boolean {
    return oneHourBlocks.find(block => !block?.getAllQuarterHoursSelected()) === undefined
  }
}

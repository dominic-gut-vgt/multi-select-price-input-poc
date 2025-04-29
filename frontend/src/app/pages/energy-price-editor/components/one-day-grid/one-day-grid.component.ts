import { CommonModule } from '@angular/common';
import { Component, computed, input, output, signal, viewChildren } from '@angular/core';
import { OneHourBlockComponent } from '../one-hour-block/one-hour-block.component';
import { OneDayData } from '../../interfaces/one-day-data.interface';

interface RowBounds {
  min: number,
  max: number
}

enum SpecialSelectorType {
  Quartet,
  DuoVertical,
  DuoHorizontal,
  Row,
  Col
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
  protected readonly specialSelectorType = SpecialSelectorType;
  private readonly changeAllowedAfterThresholdMS = 15 * 60 * 1000; //15 min. Values more than this time in the future are editable. 

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
  protected quarterHoursEditAllowed = computed(() => {
    const allowedMap = Array.from({ length: 24 }, () => Array.from({ length: 4 }, () => false));
    const now = new Date();
    const nowWithThreshold = new Date(now.getTime() + this.changeAllowedAfterThresholdMS);
    const dayOfCurrentData = new Date(this.oneDayData().date);

    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 4; j++) {
        const hours = i;
        const minutes = 15 * j;
        dayOfCurrentData.setHours(hours, minutes);
        const isBeforeNow = dayOfCurrentData.getTime() < nowWithThreshold.getTime(); //todo correct check
        if (isBeforeNow) {
          allowedMap[i][j] = false;
        } else {
          allowedMap[i][j] = true;
        }
      }
    }
    return allowedMap
  });

  //selection----------------------------------------
  protected selectRow(rowInd: number): void {
    const oneHourBlocksToSelect = this.getOneHourBlocksRow(rowInd);
    const isSelected = !this.getAllQuarterHoursOfOneHourBlocksAreSelected(oneHourBlocksToSelect);
    oneHourBlocksToSelect.forEach(block => block?.setSelectedOfFullHour(true, isSelected))
  }

  protected selectCol(colInd: number): void {
    const oneHourBlocksToSelect = this.getOneHourBlocksCol(colInd);
    const isSelected = !this.getAllQuarterHoursOfOneHourBlocksAreSelected(oneHourBlocksToSelect);
    oneHourBlocksToSelect.forEach(block => block?.setSelectedOfFullHour(true, isSelected))
  }

  //special selectors
  protected selectQuartet(ind: number): void {
    const oneHourBlocksToSelect = this.getOneHourBlocksQuartet(ind);
    const isSelected = !this.getAllQuarterHoursOfOneHourBlocksAreSelected(oneHourBlocksToSelect);
    oneHourBlocksToSelect.forEach(block => block?.setSelectedOfFullHour(true, isSelected))
  }

  protected selectTwoVertical(ind: number): void {
    const oneHourBlocksToSelect = this.getOneHourBlocksDuoVertical(ind);
    const isSelected = !this.getAllQuarterHoursOfOneHourBlocksAreSelected(oneHourBlocksToSelect);
    oneHourBlocksToSelect.forEach(block => block?.setSelectedOfFullHour(true, isSelected))
  }

  protected selectTwoHorizontal(ind: number): void {
    const oneHourBlocksToSelect = this.getOneHourBlocksDuoHorizontal(ind);
    const isSelected = !this.getAllQuarterHoursOfOneHourBlocksAreSelected(oneHourBlocksToSelect);
    oneHourBlocksToSelect.forEach(block => block?.setSelectedOfFullHour(true, isSelected))
  }

  //sepcial selectors on hover
  specialSelectorHoverChange(ind: number, isOver: boolean, specialSelectorType: SpecialSelectorType): void {
    console.log(ind, isOver, specialSelectorType);
    let oneHourBlocksToHighlight: (OneHourBlockComponent | undefined)[] = [];
    switch (specialSelectorType) {
      case SpecialSelectorType.Row: oneHourBlocksToHighlight = this.getOneHourBlocksRow(ind); break;
      case SpecialSelectorType.Col: oneHourBlocksToHighlight = this.getOneHourBlocksCol(ind); break;
      case SpecialSelectorType.Quartet: oneHourBlocksToHighlight = this.getOneHourBlocksQuartet(ind); break;
      case SpecialSelectorType.DuoVertical: oneHourBlocksToHighlight = this.getOneHourBlocksDuoVertical(ind); break;
      case SpecialSelectorType.DuoHorizontal: oneHourBlocksToHighlight = this.getOneHourBlocksDuoHorizontal(ind); break;
    }

    oneHourBlocksToHighlight.forEach(block => block?.setIsHighlighted(isOver));
  }

  //events
  protected onOneHourQuarterHoursSelecionChange(quarterHoursSelection: boolean[], hour: number): void {
    this.quarterHoursSelection.update((state) => {
      const newState: boolean[][] = JSON.parse(JSON.stringify(state));
      newState[hour] = quarterHoursSelection;
      return newState;
    })
  }

  //getters---------------------------------------------
  getOneHourBlocksRow(rowInd: number): (OneHourBlockComponent | undefined)[] {
    return this.oneHourBlocks()?.filter(block => block.index() >= rowInd * this.itemsPerRow && block.index() < rowInd * this.itemsPerRow + this.itemsPerRow);
  }
  getOneHourBlocksCol(colInd: number): (OneHourBlockComponent | undefined)[] {
    return this.oneHourBlocks()?.filter(block => block.index() % this.itemsPerRow === colInd);
  }
  getOneHourBlocksQuartet(ind: number): (OneHourBlockComponent | undefined)[] {
    return [
      this.oneHourBlocks()?.at(ind),
      this.oneHourBlocks()?.at(ind + 1),
      this.oneHourBlocks()?.at(ind + this.itemsPerRow),
      this.oneHourBlocks()?.at(ind + this.itemsPerRow + 1),
    ]
  }

  getOneHourBlocksDuoVertical(ind: number): (OneHourBlockComponent | undefined)[] {
    return [
      this.oneHourBlocks()?.at(ind),
      this.oneHourBlocks()?.at(ind + this.itemsPerRow),
    ]
  }

  getOneHourBlocksDuoHorizontal(ind: number): (OneHourBlockComponent | undefined)[] {
    return [
      this.oneHourBlocks()?.at(ind),
      this.oneHourBlocks()?.at(ind + 1),
    ]
  }

  getQuarterHoursSelection(): boolean[][] {
    return this.quarterHoursSelection();
  }

  getAllQuarterHoursOfOneHourBlocksAreSelected(oneHourBlocks: (OneHourBlockComponent | undefined)[]): boolean {
    return oneHourBlocks.find(block => !block?.getAllQuarterHoursSelected()) === undefined
  }
}

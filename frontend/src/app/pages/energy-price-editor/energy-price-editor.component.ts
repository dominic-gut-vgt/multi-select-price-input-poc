import { CommonModule } from '@angular/common';
import { Component, computed, effect, model, signal, viewChild, viewChildren } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SelectionConfiguratorComponent } from './components/selection-configurator/selection-configurator.component';
import { OneDayGridComponent } from './components/one-day-grid/one-day-grid.component';
import { OneDayData } from './interfaces/one-day-data.interface';
import { PRICE_VALUES_DUMMY_DATA_ONE, PRICE_VALUES_DUMMY_DATA_TWO } from './components/dummy-data/price-values-dummy-data';

@Component({
  selector: 'app-energy-price-editor',
  templateUrl: './energy-price-editor.component.html',
  styleUrl: './energy-price-editor.component.scss',
  imports: [CommonModule, SelectionConfiguratorComponent, OneDayGridComponent, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, MatIconModule],
})
export class EnergyPriceEditorComponent {

  //viewchildren
  private oneDayGrid = viewChild(OneDayGridComponent);

  //data
  protected price = model(0);
  protected allDaysData = signal<OneDayData[]>([
    {
      date: new Date('2025-04-28T00:00:00.588Z').toISOString(),
      prices: PRICE_VALUES_DUMMY_DATA_ONE,
    },
    {
      date: new Date('2025-04-27T00:00:00.588Z').toISOString(),
      prices: PRICE_VALUES_DUMMY_DATA_TWO,
    }
  ])

  //derived data

  protected currentSelectedDayData = computed<OneDayData>(() => {
    return this.allDaysData()[this.currentSelectedDataInd()];
  });

  //flags
  protected currentSelectedDataInd = signal(0);


  protected onPriceInputChange(): void {
    const quarterHoursSelection = this.oneDayGrid()?.getQuarterHoursSelection();
    if (quarterHoursSelection) {
      this.allDaysData.update(state => {
        const newState:OneDayData[] = JSON.parse(JSON.stringify(state));
        const prices = this.currentSelectedDayData().prices;
        const result: number[][] = [];

        for (let i = 0; i < prices.length; i++) {
          const row: number[] = [];
          for (let j = 0; j < prices[i].length; j++) {
            row.push(quarterHoursSelection[i][j] ? this.price() : prices[i][j]);
          }
          result.push(row);
        }

        newState[this.currentSelectedDataInd()].prices = result;

        return newState;
      });
    }
  }
}




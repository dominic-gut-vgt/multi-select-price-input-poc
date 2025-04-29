import { CommonModule } from '@angular/common';
import { Component, computed, inject, model, OnInit, signal, viewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule, MatLabel } from '@angular/material/input';
import { OneDayGridComponent } from './components/one-day-grid/one-day-grid.component';
import { OneDayData } from './interfaces/one-day-data.interface';
import { PRICE_VALUES_DUMMY_DATA_ONE, PRICE_VALUES_DUMMY_DATA_TWO } from './components/dummy-data/price-values-dummy-data';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';

enum FormGroupKeys {
  ProductGroup = 'productGroup',
  Date = 'date',
  Price = 'price',
}

@Component({
  selector: 'app-energy-price-editor',
  templateUrl: './energy-price-editor.component.html',
  styleUrl: './energy-price-editor.component.scss',
  imports: [CommonModule, ReactiveFormsModule, MatDatepickerModule, MatSelectModule, OneDayGridComponent, MatLabel, MatInputModule, FormsModule, MatButtonModule, MatIconModule],
})
export class EnergyPriceEditorComponent implements OnInit {

  //injections
  private readonly fb = inject(FormBuilder);

  //consts
  protected readonly FGK = FormGroupKeys;

  //viewchildren
  private oneDayGrid = viewChild(OneDayGridComponent);

  //formgroup
  protected form!: FormGroup;


  //data
  protected buildingGroups = signal(['Option 1', 'Option 2', 'Option 3']);
  protected allDaysData = signal<OneDayData[]>([
    {
      date: new Date('2025-04-29T00:00:00.588Z').toISOString(),
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


  ngOnInit(): void {
    this.createForm();

  }

  createForm(): void {
    this.form = this.fb.group({
      [this.FGK.ProductGroup]: [null],
      [this.FGK.Date]: [null],
      [this.FGK.Price]: [0],
    });

    this.form.get(this.FGK.Price)?.valueChanges.subscribe((price) => {
      this.onPriceInputChange(price);
    });
  }


  protected onPriceInputChange(price: number): void {
    const quarterHoursSelection = this.oneDayGrid()?.getQuarterHoursSelection();
    if (quarterHoursSelection) {
      this.allDaysData.update(state => {
        const newState: OneDayData[] = JSON.parse(JSON.stringify(state));
        const prices = this.currentSelectedDayData().prices;
        const result: number[][] = [];

        for (let i = 0; i < prices.length; i++) {
          const row: number[] = [];
          for (let j = 0; j < prices[i].length; j++) {
            row.push(quarterHoursSelection[i][j] ? price : prices[i][j]);
          }
          result.push(row);
        }

        newState[this.currentSelectedDataInd()].prices = result;

        return newState;
      });
    }
  }
}




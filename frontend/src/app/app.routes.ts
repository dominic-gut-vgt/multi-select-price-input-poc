import { Routes } from '@angular/router';

export const routes: Routes = [
  {path: '', redirectTo: 'energy-price-editor', pathMatch: 'full'},
  {
    path: 'energy-price-editor',
    loadComponent: () => import('./pages/energy-price-editor/energy-price-editor.component').then(m => m.EnergyPriceEditorComponent),
  }
];

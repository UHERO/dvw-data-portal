import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TourismModuleComponent } from './tourism-module/tourism-module.component';

const routes: Routes = [
  { path: 'module/:id', component: TourismModuleComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

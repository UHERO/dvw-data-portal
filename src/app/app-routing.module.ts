import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TourismModuleComponent } from './tourism-module/tourism-module.component';
import { ModuleListComponent } from './module-list/module-list.component';

const routes: Routes = [
  { path: '', component: ModuleListComponent },
  { path: 'module/:id', component: TourismModuleComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

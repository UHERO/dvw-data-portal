import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DimensionSelectorComponent } from './dimension-selector/dimension-selector.component';
import { DvwApiService } from './dvw-api.service';
import { FrequencySelectorComponent } from './frequency-selector/frequency-selector.component';
import { HelperService } from './helper.service';
import { ModuleListItemComponent } from './module-list-item/module-list-item.component';
import { ModuleListComponent } from './module-list/module-list.component';
import { ModuleTableComponent } from './module-table/module-table.component';
import { MonthSelectorComponent } from './month-selector/month-selector.component';
import { QuarterSelectorComponent } from './quarter-selector/quarter-selector.component';
import { TourismModuleComponent } from './tourism-module/tourism-module.component';
import { YearSelectorComponent } from './year-selector/year-selector.component';

@NgModule({
  declarations: [
    AppComponent,
    TourismModuleComponent,
    ModuleListComponent,
    ModuleListItemComponent,
    DimensionSelectorComponent,
    FrequencySelectorComponent,
    ModuleTableComponent,
    YearSelectorComponent,
    MonthSelectorComponent,
    QuarterSelectorComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    DvwApiService,
    HelperService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

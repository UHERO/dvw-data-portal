import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { TourismModuleComponent } from './tourism-module/tourism-module.component';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { DvwApiService } from './dvw-api.service';
import { HelperService } from './helper.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModuleListComponent } from './module-list/module-list.component';
import { DimensionSelectorComponent } from './dimension-selector/dimension-selector.component';
import { FrequencySelectorComponent } from './frequency-selector/frequency-selector.component';
import { ModuleTableComponent } from './module-table/module-table.component';
import { YearSelectorComponent } from './year-selector/year-selector.component';
import { MonthSelectorComponent } from './month-selector/month-selector.component';
import { QuarterSelectorComponent } from './quarter-selector/quarter-selector.component';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  declarations: [
    AppComponent,
    TourismModuleComponent,
    ModuleListComponent,
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

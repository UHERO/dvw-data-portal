import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TourismModuleComponent } from './tourism-module/tourism-module.component';
import { MatSelectModule } from '@angular/material/select'; 
import { DvwApiService } from './dvw-api.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModuleListComponent } from './module-list/module-list.component';

@NgModule({
  declarations: [
    AppComponent,
    TourismModuleComponent,
    ModuleListComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    DvwApiService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

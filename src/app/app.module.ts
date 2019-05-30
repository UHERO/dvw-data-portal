import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TourismModuleComponent } from './tourism-module/tourism-module.component';
import { DvwApiService } from './dvw-api.service';

@NgModule({
  declarations: [
    AppComponent,
    TourismModuleComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule
  ],
  providers: [
    DvwApiService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

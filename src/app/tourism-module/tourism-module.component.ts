import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Subscription } from 'rxjs';
import { DvwApiService } from '../dvw-api.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-tourism-module',
  templateUrl: './tourism-module.component.html',
  styleUrls: ['./tourism-module.component.scss']
})
export class TourismModuleComponent implements OnInit, OnDestroy {
  private selectedModule: string;
  routeSub: Subscription
  dimensionSelector = new FormControl();
  selectors;

  constructor(private route: ActivatedRoute, private apiService: DvwApiService) {}

  ngOnInit() {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      this.selectedModule = params.get('id');
      this.selectors = this.apiService.getDimensionsWithOptions(this.selectedModule)
    });
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }
}

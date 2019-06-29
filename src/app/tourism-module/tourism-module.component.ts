import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tourism-module',
  templateUrl: './tourism-module.component.html',
  styleUrls: ['./tourism-module.component.scss']
})
export class TourismModuleComponent implements OnInit, OnDestroy {
  selectedModule: string;
  selectedDimensions: any;
  selectedFrequency: string;
  routeSub: Subscription

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      this.selectedModule = params.get('id');
    });
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }

  updateDimensions(event: any) {
    this.selectedDimensions = Object.assign({}, event);
  }

  updateFrequency(event: any) {
    this.selectedFrequency = event;
  }
}

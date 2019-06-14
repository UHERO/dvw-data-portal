import { Component, OnInit, Input } from '@angular/core';
import { DvwApiService } from '../dvw-api.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-dimension-selector',
  templateUrl: './dimension-selector.component.html',
  styleUrls: ['./dimension-selector.component.scss']
})
export class DimensionSelectorComponent implements OnInit {
  @Input() selectedModule: string;
  dimensionSelector = new FormControl();
  selectors$;

  constructor(private apiService: DvwApiService) { }

  ngOnInit() {
    this.selectors$ = this.apiService.getDimensionsWithOptions(this.selectedModule);
  }

}

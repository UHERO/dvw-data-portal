import { Component, OnInit, AfterViewInit, OnDestroy, Input, Output, EventEmitter, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { DvwApiService } from '../dvw-api.service';
import { HelperService } from '../helper.service';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-dimension-selector',
  templateUrl: './dimension-selector.component.html',
  styleUrls: ['./dimension-selector.component.scss']
})
export class DimensionSelectorComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() selectedModule: string;
  @Output() updateDimensionSelection: EventEmitter<any> = new EventEmitter();
  dimensionSelector = new FormControl();
  selectors$;
  @ViewChildren('dimension', { read: ElementRef }) dimensions: QueryList<ElementRef>;
  dimensionIds = {};
  dimensionsList = {};
  //dimensionsSource: Subject<any>;

  constructor(private apiService: DvwApiService) { }

  ngOnInit() {
    this.selectors$ = this.apiService.getDimensionsWithOptions(this.selectedModule);
  }

  ngAfterViewInit() {
    this.dimensions.changes.subscribe(() => {
      this.dimensions.toArray().forEach(el => {
        this.dimensionsList[el.nativeElement.id] = new Array();
      });
    });
  }

  ngOnDestroy() {
    this.updateDimensionSelection.emit({});
  }

  change(event) {
    console.log('change event', event)
    this.dimensionsList[event.source.id] = event.source.value;
    this.updateDimensionSelection.emit(this.dimensionsList);
  }

  toggle(opt) {
    opt.display = !opt.display;
  }

  stopProp(event) {
    event.stopPropagation();
  }
}

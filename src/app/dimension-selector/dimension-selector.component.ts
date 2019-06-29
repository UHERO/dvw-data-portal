import { Component, OnInit, AfterViewInit, OnDestroy, Input, Output, EventEmitter, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { DvwApiService } from '../dvw-api.service';
import { HelperService } from '../helper.service';
import { FormControl } from '@angular/forms';

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
  dimensionsList = {};
  activeClassIndex: any;

  constructor(private apiService: DvwApiService, private _helper: HelperService) { }

  ngOnInit() {
    this.selectors$ = this.apiService.getDimensionsWithOptions(this.selectedModule);
  }

  ngAfterViewInit() {
    const dimSubscription = this.dimensions.changes.subscribe(() => {
      this.dimensions.toArray().forEach((el, index) => {
        this.dimensionsList[el.nativeElement.id] = new Array();
        if (index === this.dimensions.toArray().length - 1) {
          dimSubscription.unsubscribe();
        }
      });
    });
  }

  ngOnDestroy() {
    this.updateDimensionSelection.emit({});
  }

  change(event: any) {
    this.dimensionsList[event.source.id] = event.source.value;
    this.updateDimensionSelection.emit(this.dimensionsList);
  }

  toggle(group: any) {
    group.active = !group.active
  }

  stopProp(event: any) {
    event.stopPropagation();
  }

  checkAllDimensionsSelected = (dimensions) => {
    return Object.keys(dimensions).every((key) => {
      return dimensions[key].length > 0
    }) === true;
  }
}

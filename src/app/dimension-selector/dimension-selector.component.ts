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
  optgroupExpand = String.fromCharCode(0xf0fe);
  optgroupCollapse = String.fromCharCode(0xf146);
  selectedDimensions = [];

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
    console.log('dimensionsList', this.dimensionsList)
  }

  ngOnDestroy() {
    this.updateDimensionSelection.emit({});
  }

  change(event: any, selector: string) {
    console.log('test', event)
    //this.dimensionsList[selector] = event.source.value;
    if (!this.dimensionsList[selector].length) {
      this.dimensionsList[selector].push(event[0]);
    } else {
      const inList = this.dimensionsList[selector].findIndex(d => d.handle === event[0].handle);
      console.log('inList', inList)
      if (inList < 0 ) {
        this.dimensionsList[selector].push(event[0]);
      } else {
        this.dimensionsList[selector].splice(inList, 1);
      }
    }
    console.log('dimensionSelector', this.dimensionsList)
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

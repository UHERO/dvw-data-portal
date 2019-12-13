import { Component, OnInit, AfterViewInit, OnDestroy, Input, Output, EventEmitter, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { DvwApiService } from '../dvw-api.service';

@Component({
  selector: 'app-dimension-selector',
  templateUrl: './dimension-selector.component.html',
  styleUrls: ['./dimension-selector.component.scss']
})
export class DimensionSelectorComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() selectedModule: string;
  @Output() updateDimensionSelection: EventEmitter<any> = new EventEmitter();
  @ViewChildren('dimension', { read: ElementRef }) selects: QueryList<ElementRef>;
  selectors$;
  activeClassIndex: any;
  optgroupExpand = String.fromCharCode(0xf0fe);
  optgroupCollapse = String.fromCharCode(0xf146);
  selectedOptions = {};
  dimensions;

  constructor(private apiService: DvwApiService) { }

  ngOnInit() {
    this.selectors$ = this.apiService.getDimensionsWithOptions(this.selectedModule).subscribe((dimensions) => {
      this.dimensions = dimensions;
    });
  }

  ngAfterViewInit() {
    const dimSubscription = this.selects.changes.subscribe(() => {
      this.selects.toArray().forEach((el, index) => {
        this.selectedOptions[el.nativeElement.id] = new Array();
        if (index === this.selects.toArray().length - 1) {
          dimSubscription.unsubscribe();
        }
      });
    });
  }

  ngOnDestroy() {
    this.selectors$.unsubscribe();
    this.updateDimensionSelection.emit({});
  }

  optSelectMouseDown = (event: any, opt: any, name: string) => {
    if (!this.selectedOptions[name]) {
      this.selectedOptions[name] = [];
    }
    const index = this.selectedOptions[name].findIndex(o => o.handle === opt.handle);
    if (index > -1) {
      this.selectedOptions[name].splice(index, 1);
      opt.selected = false;
    } else {
      this.selectedOptions[name].push(opt);
      opt.selected = true;
    }
    this.updateDimensionSelection.emit(this.selectedOptions);
    return false;
  }

  toggle(event: any, group: any) {
    event.stopPropagation();
    group.active = !group.active
  }

  resetSelections() {
    Object.keys(this.selectedOptions).forEach((key) =>{
      this.selectedOptions[key] = [];
    });
    this.dimensions.forEach((dim)=> {
      dim.options.forEach((opt) => {
        opt.selected = false;
      });
    })
  }
}

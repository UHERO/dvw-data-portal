import { Component, OnInit, AfterViewInit, OnDestroy, Input, Output, EventEmitter, ViewChildren, ElementRef, QueryList, ChangeDetectorRef } from '@angular/core';
import { DvwApiService } from '../dvw-api.service';
import { HelperService } from '../helper.service';

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

  constructor(private apiService: DvwApiService, private _helper: HelperService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.selectors$ = this.apiService.getDimensionsWithOptions(this.selectedModule);
  }

  ngAfterViewInit() {
    const dimSubscription = this.selects.changes.subscribe(() => {
      this.selects.toArray().forEach((el, index) => {
        this.selectedOptions[el.nativeElement.id] = new Array();
        // force change detection
        this.cd.detectChanges();
        if (index === this.selects.toArray().length - 1) {
          dimSubscription.unsubscribe();
        }
      });
    });
  }

  ngOnDestroy() {
    this.updateDimensionSelection.emit({});
  }

  optSelectMouseDown = (event: any, opt: any, name: string) => {
    event.stopPropagation();
    let scrollTop = 0;
    if (event.target.parentNode.tagName === 'SELECT') {
      scrollTop = event.target.parentNode.scrollTop;
    }
    if (event.target.parentNode.parentNode.tagName === 'SELECT') {
      scrollTop = event.target.parentNode.parentNode.scrollTop;
    }
    if (!this.selectedOptions[name]) {
      this.selectedOptions[name] = [];
    }
    const index = this.selectedOptions[name].findIndex(o => o.handle === opt.handle);
    if (index > -1) {
      this.selectedOptions[name].splice(index, 1);
    } else {
      this.selectedOptions[name].push(opt);
    }
    // allow Angular to detect model change
    const temp = this.selectedOptions[name];
    this.selectedOptions[name] = [];
    for (let i = 0; i < temp.length; i++) {
      this.selectedOptions[name][i] = temp[i];
    }
    setTimeout(() => {
      if (event.target.parentNode.parentNode.tagName === 'SELECT') {
        event.target.parentNode.parentNode.scrollTop = scrollTop;
        return;
      }
      if (event.target.parentNode.tagName === 'SELECT') {
        event.target.parentNode.scrollTop = scrollTop;
      }
    }, 0);
    setTimeout(() => {
      event.target.parentNode.focus();
    }, 0);
    this.updateDimensionSelection.emit(this.selectedOptions);
    return false;
  }

  toggle(event: any, group: any) {
    event.stopPropagation();
    group.active = !group.active
  }
}

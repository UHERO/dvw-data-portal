import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-year-selector',
  templateUrl: './year-selector.component.html',
  styleUrls: ['./year-selector.component.scss']
})
export class YearSelectorComponent implements OnInit {
  @Input() dates;
  @Input() rangeLabel;
  @Input() selectedYear;
  @Output() updateYearSelection: EventEmitter<any> = new EventEmitter();
  selectedValue;

  constructor() { }

  ngOnInit() {
  }

  changeYear(event) {
    this.selectedYear = this.dates.find(year => year === event);
    this.updateYearSelection.emit(event)
  }
}

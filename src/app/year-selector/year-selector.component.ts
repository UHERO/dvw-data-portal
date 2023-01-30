import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-year-selector',
  templateUrl: './year-selector.component.html',
  styleUrls: ['./year-selector.component.scss']
})
export class YearSelectorComponent {
  @Input() dates;
  @Input() rangeLabel;
  @Input() selectedYear;
  @Output() updateYearSelection: EventEmitter<any> = new EventEmitter();
  selectedValue;


  changeYear(event) {
    this.selectedYear = this.dates.find(year => year === event);
    this.updateYearSelection.emit(event);
  }
}

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-month-selector',
  templateUrl: './month-selector.component.html',
  styleUrls: ['./month-selector.component.scss']
})
export class MonthSelectorComponent implements OnInit {
  @Input() months: any;
  @Input() selectedMonth: string;
  @Output() updateMonthSelection: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  changeMonth(event) {
    this.selectedMonth = this.months.find(m => m === event);
    this.updateMonthSelection.emit(event);
  }
}

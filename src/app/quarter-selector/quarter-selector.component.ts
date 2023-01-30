import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-quarter-selector',
  templateUrl: './quarter-selector.component.html',
  styleUrls: ['./quarter-selector.component.scss']
})
export class QuarterSelectorComponent {
  @Input() quarters: Array<any>;
  @Input() selectedQuarter: string;
  @Output() updateQuarterSelection: EventEmitter<any> = new EventEmitter();

  changeQuarter(event) {
    this.selectedQuarter = this.quarters.find(q => q === event);
    this.updateQuarterSelection.emit(event);
  }
}

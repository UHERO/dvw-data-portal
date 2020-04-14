import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-frequency-selector',
  templateUrl: './frequency-selector.component.html',
  styleUrls: ['./frequency-selector.component.scss']
})
export class FrequencySelectorComponent implements OnInit {
  selectedValue: string;
  @Input() freqs: Array<any>;
  @Input() invalidDates: string;
  @Output() updateFrequencySelection: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  changeFrequency(event) {
    this.updateFrequencySelection.emit(event);
  }

  resetFrequency() {
    this.selectedValue = null;
  }
}

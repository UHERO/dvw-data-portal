import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-frequency-selector',
  templateUrl: './frequency-selector.component.html',
  styleUrls: ['./frequency-selector.component.scss']
})
export class FrequencySelectorComponent implements OnInit {
  selectedValue: string;
  @Output() updateFrequencySelection: EventEmitter<any> = new EventEmitter();
  frequencies = [
    { value: 'A', label: 'Annual'},
    { value: 'Q', label: 'Quarterly'},
    { value: 'M', label: 'Monthly'},
  ]

  constructor() { }

  ngOnInit() {
  }

  changeFrequency(event) {
    this.updateFrequencySelection.emit(event.value);
  }

}

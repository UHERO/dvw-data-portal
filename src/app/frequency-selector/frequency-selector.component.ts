import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-frequency-selector',
  templateUrl: './frequency-selector.component.html',
  styleUrls: ['./frequency-selector.component.scss']
})
export class FrequencySelectorComponent implements OnInit {
  selectedValue: string;
  frequencies = [
    { value: 'A', label: 'Annual'},
    { value: 'Q', label: 'Quarterly'},
    { value: 'M', label: 'Monthly'},
  ]

  constructor() { }

  ngOnInit() {
  }

}

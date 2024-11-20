// frequency-selector.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

interface Frequency {
  label: string;
  value: string;
}

@Component({
  selector: 'app-frequency-selector',
  templateUrl: './frequency-selector.component.html',
  styleUrls: ['./frequency-selector.component.scss']
})
export class FrequencySelectorComponent implements OnInit {
  @Input() freqs: Frequency[] = [];
  @Input() invalidDates = '';
  @Output() updateFrequencySelection: EventEmitter<string> = new EventEmitter();
  
  selectedValue: string | null = null;

  ngOnInit() {
    console.log('Initial freqs:', this.freqs); // For debugging
  }

  changeFrequency(value: string) {
    if (this.invalidDates) return;
    
    console.log('Changing frequency to:', value); // For debugging
    this.selectedValue = value;
    this.updateFrequencySelection.emit(value);
  }

  isSelected(value: string): boolean {
    return this.selectedValue === value;
  }

  resetFrequency() {
    this.selectedValue = null;
  }
}
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FrequencySelectorComponent } from './frequency-selector.component';

describe('FrequencySelectorComponent', () => {
  let component: FrequencySelectorComponent;
  let fixture: ComponentFixture<FrequencySelectorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FrequencySelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FrequencySelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

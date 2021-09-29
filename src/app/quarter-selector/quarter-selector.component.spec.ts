import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuarterSelectorComponent } from './quarter-selector.component';

describe('QuarterSelectorComponent', () => {
  let component: QuarterSelectorComponent;
  let fixture: ComponentFixture<QuarterSelectorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QuarterSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuarterSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

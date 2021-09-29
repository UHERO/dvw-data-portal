import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DimensionSelectorComponent } from './dimension-selector.component';

describe('DimensionSelectorComponent', () => {
  let component: DimensionSelectorComponent;
  let fixture: ComponentFixture<DimensionSelectorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DimensionSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DimensionSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

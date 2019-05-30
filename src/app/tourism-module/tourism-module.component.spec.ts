import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TourismModuleComponent } from './tourism-module.component';

describe('TourismModuleComponent', () => {
  let component: TourismModuleComponent;
  let fixture: ComponentFixture<TourismModuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TourismModuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TourismModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

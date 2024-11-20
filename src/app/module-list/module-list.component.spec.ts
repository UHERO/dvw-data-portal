// src/app/features/module-list/components/module-list/module-list.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { ModuleListItemComponent } from '../module-list-item/module-list-item.component';
import { ModuleItem, ModuleListComponent } from './module-list.component';

describe('ModuleListComponent', () => {
  let component: ModuleListComponent;
  let fixture: ComponentFixture<ModuleListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [ 
        ModuleListComponent,
        ModuleListItemComponent
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModuleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a title', () => {
    const titleElement = fixture.debugElement.query(By.css('#data-warehouse-title'));
    expect(titleElement.nativeElement.textContent).toBe('Tourism Data Warehouse');
  });

  it('should render correct number of module items', () => {
    const moduleItems = fixture.debugElement.queryAll(By.directive(ModuleListItemComponent));
    expect(moduleItems.length).toBe(component.modules.length);
  });

  it('should pass correct data to module items', () => {
    const firstModuleItem = fixture.debugElement.query(By.directive(ModuleListItemComponent));
    const firstModuleItemInstance = firstModuleItem.componentInstance;
    const expectedData: ModuleItem = component.modules[0];

    expect(firstModuleItemInstance.icon).toBe(expectedData.icon);
    expect(firstModuleItemInstance.title).toBe(expectedData.title);
    expect(firstModuleItemInstance.description).toBe(expectedData.description);
    expect(firstModuleItemInstance.routePath).toBe(expectedData.routePath);
  });

  it('should contain all required modules', () => {
    const expectedModules = [
      'Visitor Trends',
      'Visitor Characteristics',
      'Air Seats',
      'Expenditure Patterns',
      'Hotel Performance'
    ];

    const moduleItems = fixture.debugElement.queryAll(By.directive(ModuleListItemComponent));
    const moduleTitles = moduleItems.map(item => item.componentInstance.title);

    expectedModules.forEach(title => {
      expect(moduleTitles).toContain(title);
    });
  });

  describe('responsive layout', () => {
    it('should have correct column classes', () => {
      const columnElements = fixture.debugElement.queryAll(By.css('.col-12.col-md-6'));
      expect(columnElements.length).toBe(component.modules.length);
    });
  });

  describe('module data integrity', () => {
    it('should have all required properties for each module', () => {
      component.modules.forEach(module => {
        expect(module.icon).toBeTruthy();
        expect(module.title).toBeTruthy();
        expect(module.description).toBeTruthy();
        expect(module.routePath).toBeTruthy();
      });
    });

    it('should have unique route paths', () => {
      const routePaths = component.modules.map(module => module.routePath);
      const uniqueRoutePaths = new Set(routePaths);
      expect(routePaths.length).toBe(uniqueRoutePaths.size);
    });
  });
});
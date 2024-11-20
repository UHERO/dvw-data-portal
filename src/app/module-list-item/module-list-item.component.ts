import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-module-list-item',
  templateUrl: './module-list-item.component.html',
  styleUrls: ['./module-list-item.component.scss']
})
export class ModuleListItemComponent {
  @Input() icon = '';
  @Input() title = '';
  @Input() description = '';
  @Input() routePath = '';
}
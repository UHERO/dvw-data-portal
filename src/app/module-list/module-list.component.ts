// module-list.component.ts
import { Component } from '@angular/core';

export interface ModuleItem {
  icon: string;
  title: string;
  description: string;
  routePath: string;
}

@Component({
  selector: 'app-module-list',
  templateUrl:  './module-list.component.html',
  styleUrls: ['./module-list.component.scss']
})
export class ModuleListComponent {
  modules: ModuleItem[] = [
    {
      icon: 'trending_up',
      title: 'Visitor Trends',
      description: 'This section provides data on the number of visitors, days, expenditure (EXPND), length of stay (LOS), daily census, and per person per day spending by market and by island (PPPD, PPPT) for monthly, quarterly, and annually. Data availability varies by indicator, market and island.',
      routePath: 'trend'
    },
    {
      icon: 'people',
      title: 'Visitor Characteristics',
      description: 'Section gives a basic profile of Hawaii\'s visitors. The profile is available by group defined by where they came from, which island they visited, accommodation choice, purpose and type of their visit, and if they\'ve visited Hawaii before.',
      routePath: 'char'
    },
    {
      icon: 'flight',
      title: 'Air Seats',
      description: 'This section shows the count of air seats to Hawaii\'s commercial airports on Oahu, Hawaii Island, Maui, and Kauai. Data are available for monthly, quarterly, and annually for scheduled flights and charter flights by departing region or country.',
      routePath: 'airseat'
    },
    {
      icon: 'attach_money',
      title: 'Expenditure Patterns',
      description: 'This section includes data on spending habits of visitors, either by market or by island visited. Spending for food, entertainment, transportation, shopping, and lodging are shown as daily spending and as a percent of total spending.',
      routePath: 'exp'
    },
    {
      icon: 'location_city',
      title: 'Hotel Performance',
      description: 'This section tracks hotel occupancy, the average daily rate, and revenue per available room. Where available, data can be viewed by island area or hotel type.',
      routePath: 'hotel'
    }
  ];
}
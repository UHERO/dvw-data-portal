import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { DvwApiService } from '../dvw-api.service';

@Component({
  selector: 'app-tourism-module',
  templateUrl: './tourism-module.component.html',
  styleUrls: ['./tourism-module.component.scss']
})
export class TourismModuleComponent implements OnInit {
  private selectedModule: string;
  constructor(private route: ActivatedRoute, private apiService: DvwApiService) { }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      console.log(params);
      this.selectedModule = params.get('id');
      this.apiService.getDimensions(this.selectedModule).subscribe((dimensions) => {
        console.log('dimensions', dimensions);
      });
    });
  }

}

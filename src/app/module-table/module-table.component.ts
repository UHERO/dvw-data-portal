import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { DvwApiService } from '../dvw-api.service';
import { HelperService } from '../helper.service';
import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-fixedcolumns';
import 'datatables.net-buttons/js/dataTables.buttons.js';
import 'datatables.net-buttons/js/buttons.html5.js';
import 'datatables.net-buttons/js/buttons.flash.js';
import 'datatables.net-buttons/js/buttons.print.js';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-module-table',
  templateUrl: './module-table.component.html',
  styleUrls: ['./module-table.component.scss']
})
export class ModuleTableComponent implements OnInit, OnChanges {
  @Input() dimensions;
  dimensionsSource: Subject<any>;
  firstObservation: string;
  lastObservation: string;
  dateArray: Array<any>;
  //dimensions;
  //@Input() dateArray;
  //@Input() tableData;
  //@Input() datesSelected;
  private tableWidget: any;

  constructor(private apiService: DvwApiService, private _helper: HelperService) { }

  ngOnInit() { }

  ngOnChanges() {
    const tableColumns = [];
    let allDimensionsSelected = false;
    if (this.dimensions && Object.keys(this.dimensions).length) {
      allDimensionsSelected = Object.keys(this.dimensions).every((key) => {
        return this.dimensions[key].length > 0
      }) === true;
    }
    if (allDimensionsSelected) {
      Object.keys(this.dimensions).forEach(key => tableColumns.push({ title: key, data: key }));
      // TODO: FORMAT API URL REQUEST
      const series = this.apiService.getSeries('test', 'M');
      this.firstObservation = this.findFirstObservation(series.series);
      this.lastObservation = this.findLastObservation(series.series);
      console.log('firstObservation', this.firstObservation);
      console.log('lastObservation', this.lastObservation);
      // TODO: ONLY ALLOW SINGLE FREQUENCY
      this.dateArray = this._helper.categoryDateArray({ startDate: this.firstObservation, endDate: this.lastObservation }, ['M']);
      series.series.forEach((serie) => {
        this.identifySeriesColumns(serie);
        serie['dimensions'] = this.dimensions;
        let results = {}
        let valueDatePairs = this.dateArray.forEach((date) => {
          results[date.tableDate] = ' ';
          const dateExists = serie.dates.indexOf(date.date);
          if (dateExists > -1) {
            results[date.tableDate] = serie.values[dateExists].toString();
          }
        });
        serie['observations'] = results;
        console.log('valueDatePairs', valueDatePairs)
      });
      this.dateArray.forEach((date) => {
        tableColumns.push({ title: date.tableDate, data: 'observations.' + date.tableDate });
      });
      console.log(series)
      const moduleTable: any = $('#module-table');
      if (this.tableWidget) {
        // Destroy table if table has already been initialized
        this.tableWidget.destroy();
        moduleTable.empty();
      }
      /* this.dateArray.forEach((date) => {
        tableColumns.push({ title: date.tableDate, data: 'observations.' + date.tableDate });
      }); */
      //const tableData = this.tableData;
      this.tableWidget = moduleTable.DataTable({
        data: series.series,
        dom: 'Bt',
        columns: tableColumns,
        scrollX: true,
        paging: false,
        searching: false,
        info: false,
      });
    }
  }

  identifySeriesColumns(serie: any) {
    serie.columns.forEach((col) => {
      this.findColumnDimension(serie, this.dimensions, col);
    });
  }

  findColumnDimension(serie: any, dimensions: any, column: string) {
    Object.keys(dimensions).forEach((key) => {
      this.matchDimensionAndColumn(dimensions, key, column, serie);
    });
  }

  matchDimensionAndColumn(dimensions: any, key: string, column: string, serie: any) {
    dimensions[key].forEach((opt) => {
      if (opt.handle === column) {
        serie[key] = opt.nameW;
      }
    });
  }

  findFirstObservation(series) {
    let firstObservation;
    series.forEach((serie) => {
      if (!firstObservation || serie.observationStart < firstObservation) {
        firstObservation = serie.observationStart;
      }
    });
    return firstObservation;
  }

  findLastObservation(series) {
    let lastObservation;
    series.forEach((serie) => {
      if (!lastObservation || serie.observationEnd > lastObservation) {
        lastObservation = serie.observationEnd;
      }
    });
    return lastObservation;
  }

  createDateArray(firstDate: string, lastDate: string) {

  }
}

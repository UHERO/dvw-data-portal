import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { DvwApiService } from '../dvw-api.service';
import { HelperService } from '../helper.service';
import { DatesSelected } from '../dates-selected';

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
  @Input() dimensions: any;
  @Input() frequency: string;
  @Input() selectedModule: string;
  dimensionsSource: Subject<any>;
  firstObservation: string;
  lastObservation: string;
  dateArray: Array<any>;
  noData: boolean = false;
  datesSelected: DatesSelected;
  tableData: Array<any>;
  //dimensions;
  //@Input() dateArray;
  //@Input() tableData;
  //@Input() datesSelected;
  private tableWidget: any;

  constructor(private apiService: DvwApiService, private _helper: HelperService) { }

  ngOnInit() { }

  ngOnChanges() {
    const tableColumns = [];
    let series;
    let allDimensionsSelected = false;
    if (this.dimensions && Object.keys(this.dimensions).length) {
      allDimensionsSelected = Object.keys(this.dimensions).every((key) => {
        return this.dimensions[key].length > 0
      }) === true;
    }
    if (allDimensionsSelected && this.frequency) {
      const apiParam = this.formatApiParam(this.dimensions);
      const freq = this.frequency
      this.apiService.getSeries(this.selectedModule, apiParam, this.frequency).subscribe((series) => {
        Object.keys(this.dimensions).forEach(key => tableColumns.push({ title: key, data: key }));
        if (series.module) {
          this.noData = false;
          // TODO: FORMAT API URL REQUEST
          //const series = this.apiService.getSeries('test', 'M');
          this.firstObservation = series.observationStart;
          this.lastObservation = series.observationEnd;
          // TODO: ONLY ALLOW SINGLE FREQUENCY
          this.dateArray = this._helper.categoryDateArray({ startDate: this.firstObservation, endDate: this.lastObservation }, [this.frequency]);
          this.datesSelected = this.datesSelected ? this.datesSelected : <DatesSelected>{};
          this.datesSelected.startDate = this.firstObservation;
          this.datesSelected.endDate = this.lastObservation;
          this.datesSelected.selectedStartYear = this.dateArray[0];
          this.datesSelected.selectedEndYear = this.dateArray[this.dateArray.length - 1];
          this._helper.yearsRange(this.datesSelected);
          if (this.frequency === 'Q') {
            this._helper.quartersRange(this.datesSelected);
            console.log('this.datesSelected', this.datesSelected)
          }
          if (this.frequency === 'M') {
            this._helper.monthsRange(this.datesSelected);
          }
          series.series.forEach((serie) => {
            this.identifySeriesColumns(serie);
            serie['dimensions'] = this.dimensions;
            let results = {}
            this.dateArray.forEach((date) => {
              results[date.tableDate] = ' ';
              const dateExists = serie.dates.indexOf(date.date);
              if (dateExists > -1) {
                results[date.tableDate] = serie.values[dateExists] === Infinity ? ' ' : serie.values[dateExists].toLocaleString('en-US');
              }
            });
            serie['observations'] = results;
          });
          this.dateArray.forEach((date) => {
            tableColumns.push({ title: date.tableDate, data: 'observations.' + date.tableDate });
          });
          this.tableData = series.series;
          //this.createDatatable(tableColumns, this.tableData);
          this.createDatatable(tableColumns, this.tableData);
          console.log('tableColumns', tableColumns);
          console.log('tableData', this.tableData);
          console.log('noData', this.noData)
        }
        if (!series.module) {
          this.createDatatable(tableColumns, []);
          this.noData = true;
        }
      });
    }
  }

  formatApiParam = (dimensions: any) => {
    let apiParam = '';
    const dimensionKeys = Object.keys(dimensions);
    dimensionKeys.forEach((key, index) => {
      apiParam += `${key.substring(0, 1)}=`;
      dimensions[key].forEach((opt, index) => {
        apiParam += `${opt.handle}`;
        if (index !== dimensions[key].length - 1) {
          apiParam += `,`;
        }
      });
      if (index !== dimensionKeys.length - 1) {
        apiParam += `&`;
      }
    });
    return apiParam;
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

  updateStartYear(event: any) {
    this.datesSelected.selectedStartYear = event;
    this.updateDatatable(this.datesSelected, this.frequency, this.tableData);
  }

  updateEndYear(event: any) {
    this.datesSelected.selectedEndYear = event;
    this.updateDatatable(this.datesSelected, this.frequency, this.tableData);
  }

  updateStartQuarter(event: any) {
    this.datesSelected.selectedStartQuarter = event;
    this.updateDatatable(this.datesSelected, this.frequency, this.tableData);
  }

  updateEndQuarter(event: any) {
    this.datesSelected.selectedEndQuarter = event;
    this.updateDatatable(this.datesSelected, this.frequency, this.tableData);
  }

  updateStartMonth(event: any) {
    this.datesSelected.selectedStartMonth = event;
    this.updateDatatable(this.datesSelected, this.frequency, this.tableData);
  }

  updateEndMonth(event: any) {
    this.datesSelected.selectedEndMonth = event;
    this.updateDatatable(this.datesSelected, this.frequency, this.tableData);
  }

  updateDatatable(datesSelected: DatesSelected, freq: string, tableData: Array<any>) {
    const newDateArray = this._helper.categoryDateArray(datesSelected, [freq]);
    const newColumns = [];
    Object.keys(this.dimensions).forEach(key => newColumns.push({ title: key, data: key }));
    newDateArray.forEach((date) => {
      newColumns.push({ title: date.tableDate, data: 'observations.' + date.tableDate });
    });
    this.createDatatable(newColumns, tableData);
  }

  createDatatable(tableColumns: Array<any>, tableData: Array<any>) {
    const moduleTable: any = $('#module-table');
    if (this.tableWidget) {
      // Destroy table if table has already been initialized
      this.tableWidget.clear().destroy();
      //this.tableWidget.destroy();
      moduleTable.empty();
    }
    console.log('this.tableWidget', this.tableWidget)
    console.log('tableColumns', tableColumns);
    console.log(moduleTable)
    this.tableWidget = moduleTable.DataTable({
      data: tableData,
      dom: 'Bt',
      columns: tableColumns,
      scrollX: true,
      paging: false,
      searching: false,
      info: false,
      language: {
        emptyTable: "No data available for current selection"
      },
      buttons: [
        {
          extend: 'excel',
          text: '<i class="fas fa-file-excel" aria-hidden="true" title="Excel"></i>',
          exportOptions: {
            columns: ':visible'
          },
        }, {
          extend: 'csv',
          text: '<i class="fas fa-file-csv" aria-hidden="true" title="CSV"></i>',
          exportOptions: {
            columns: ':visible'
          },
        }, {
          extend: 'pdf',
          text: '<i class="fas fa-file-pdf" aria-hidden="true" title="PDF"></i>',
          exportOptions: {
            columns: ':visible'
          },
        }, {
          extend: 'print',
          text: '<i class="fas fa-print" aria-hidden="true" title="Print"></i>',
          exportOptions: {
            columns: ':visible'
          }
        }
      ]
    });
  }
}

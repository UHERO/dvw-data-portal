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
  noData: boolean = true;
  datesSelected: DatesSelected;
  tableData: Array<any>;
  invalidDates: string;
  private tableWidget: any;

  constructor(private apiService: DvwApiService, private _helper: HelperService) { }

  ngOnInit() { }

  ngOnChanges() {
    let tableColumns = [];
    let series;
    let allDimensionsSelected = false;
    if (this.dimensions && Object.keys(this.dimensions).length) {
      allDimensionsSelected = Object.keys(this.dimensions).every((key) => {
        return this.dimensions[key].length > 0
      }) === true;
    }
    if (allDimensionsSelected && this.frequency && !this.invalidDates) {
      const apiParam = this.formatApiParam(this.dimensions);
      this.apiService.getSeries(this.selectedModule, apiParam, this.frequency).subscribe((series) => {
        if (series) {
          this.datesSelected = this.datesSelected ? this.datesSelected : <DatesSelected>{};
          this.datesSelected.startDate = series.observationStart;
          this.datesSelected.endDate = series.observationEnd;
          this._helper.yearsRange(this.datesSelected);
          if (this.frequency === 'Q') {
            this._helper.quartersRange(this.datesSelected);
          }
          if (this.frequency === 'M') {
            this._helper.monthsRange(this.datesSelected);
          }
          const dateArray = this._helper.categoryDateArray(this.datesSelected, [this.frequency]);
          const formattedSeries = this.formatSeriesData(series, dateArray);
          tableColumns = this.createColumns(dateArray);
          this.tableData = formattedSeries;
          this.createDatatable(tableColumns, this.tableData);
          this.noData = false;
        }
        if (!series) {
          tableColumns = this.createColumns([]);
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

  createColumns = (dates: Array<any>) => {
    const tableColumns = [];
    Object.keys(this.dimensions).forEach(key => tableColumns.push({ title: this.getDimensionColName(key), data: key }));
    tableColumns.forEach((col, index) => {
      if (col.data === 'indicators') {
        tableColumns.splice(index, 1);
        tableColumns.unshift(col);
      }
    });
    dates.forEach((date) => {
      tableColumns.push({ title: date.tableDate, data: 'observations.' + date.tableDate });
    });
    return tableColumns;
  }

  getDimensionColName = (key: string) => {
    const dimension = this._helper.dimensions.find(d => d.key === key);
    return dimension ? dimension.tableName : key;
  }

  formatSeriesData = (series: any, dates: Array<any>) => {
    series.series.forEach((serie) => {
      this.identifySeriesColumns(serie);
      serie['dimensions'] = this.dimensions;
      let results = {}
      dates.forEach((date) => {
        results[date.tableDate] = ' ';
        const dateExists = serie.dates.indexOf(date.date);
        if (dateExists > -1) {
          results[date.tableDate] = serie.values[dateExists] === Infinity ? ' ' : serie.values[dateExists].toLocaleString('en-US');
        }
      });
      serie['observations'] = results;
    });
    return series;
  }

  updateDatatable(datesSelected: DatesSelected, freq: string, tableData: Array<any>) {
    const validDates = this.checkValidDates(this.datesSelected);
    if (validDates) {
      this.invalidDates = null;
      const newDateArray = this._helper.categoryDateArray(datesSelected, [freq]);
      const newColumns = this.createColumns(newDateArray);
      const newTableData = this.formatSeriesData(tableData, newDateArray);
      this.createDatatable(newColumns, newTableData);
    }
    if (!validDates) {
      this.invalidDates = '*Invalid date selection';
    }
  }

  checkValidDates = (dates: DatesSelected) => {
    let valid = true;
    if (dates.selectedStartYear > dates.selectedEndYear) {
      valid = false;
    }
    if (dates.selectedStartYear === dates.selectedEndYear) {
      if (dates.selectedStartQuarter > dates.selectedEndQuarter) {
        valid = false;
      }
      if (dates.selectedStartMonth > dates.selectedEndMonth) {
        valid = false;
      }
    }
    return valid;
  }

  createDatatable(tableColumns: Array<any>, tableData: any) {
    const moduleTable: any = $('#module-table');
    if (this.tableWidget) {
      // Destroy table if table has already been initialized
      this.tableWidget.clear().destroy();
      moduleTable.empty();
    }
    const fixedColumns = Object.keys(this.dimensions);
    this.tableWidget = moduleTable.DataTable({
      data: tableData.series,
      dom: 'Bt',
      columns: tableColumns,
      columnDefs: [
        {
          'className': 'td-right', 'targets': 'td-right',
          'render': function (data, type, row, meta) {
            // If no data is available for a given year, return an empty string
            return data === undefined ? ' ' : data;
          }
        }
      ],
      fixedColumns: {
        // Fixed columns prevents emptyTable language from being displayed
        leftColumns: tableData.length ? fixedColumns.length : ''
      },
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
          customize: function (doc) {
            // Table rows should be divisible by 10
            // Maintain consistant table width (i.e. add empty strings if row has less than 10 data cells)
            function rowRightPad(row) {
              const paddedRow = [];
              row.forEach((item) => {
                paddedRow.push(item);
              });
              const rowDiff = paddedRow.length % 10;
              let addString = 10 - rowDiff;
              while (addString) {
                paddedRow.push({ text: ' ', style: '' });
                addString -= 1;
              }
              return paddedRow;
            }
            function splitTable(array, size) {
              const result = [];
              for (let i = 0; i < array.length; i += size) {
                result.push(array.slice(i, i + size));
              }
              return result;
            }
            function rightAlign(array) {
              array.forEach((cell) => {
                cell.alignment = 'right';
              });
            }
            function noWrap(array) {
              array.forEach((cell) => {
                cell.noWrap = true;
              });
            }
            // Get original table object
            const docContent = doc.content.find(c => c.hasOwnProperty('table'));
            const currentTable = docContent.table.body;
            const sources: Array<any> = [];
            const formattedTable: Array<any> = [];
            currentTable.forEach((row, index) => {
              let counter = currentTable.length;
              // Fixed Columns: Indicator, Area, Units
              const fixed = [];
              fixedColumns.forEach((col, index) => {
                fixed.push(row[index]);
              });
              // Get data from each original row excluding fixed columns and sources
              const nonFixedCols = row.slice(fixedColumns.length, row.length);
              // Split data into groups of arrays with max length == 7
              const maxLength = fixedColumns.length === 3 ? 5 : 4;
              const split = splitTable(nonFixedCols, 7);
              for (let i = 0; i < split.length; i++) {
                // Each group is used as a new row for the formatted tables
                let newRow = split[i];
                // Add the fixed columns to each new row
                fixed.forEach((c) => {
                  let cCopy = Object.assign({}, c);
                  newRow.unshift(cCopy);
                })
                if (newRow.length < 10) {
                  newRow = rowRightPad(newRow);
                }
                // Right align cell text
                rightAlign(newRow);
                noWrap(newRow);
                // Add new rows to formatted table
                if (!formattedTable[index]) {
                  formattedTable[index] = newRow;
                } else {
                  formattedTable[index + counter] = newRow;
                  counter += currentTable.length;
                }
              }
            });
            doc.defaultStyle.fontSize = 10;
            doc.styles.tableHeader.fontSize = 10;
            docContent.table.dontBreakRows = true;
            docContent.table.headerRows = 0;
            docContent.table.body = formattedTable;
            doc.content.push({
              text: 'Compiled by Research & Economic Analysis Division, State of Hawaii Department of Business, Economic Development and Tourism. For more information, please visit: http://dbedt.hawaii.gov/economic',
            });
          }
        }, {
          extend: 'print',
          text: '<i class="fas fa-print" aria-hidden="true" title="Print"></i>',
          exportOptions: {
            columns: ':visible'
          },
          customize: function(win) {
            function sortObsDates(nonSorted, sorted) {
              const result = [];
              for (let i = 0; i < sorted.length; i++) {
                const index = nonSorted.indexOf(sorted[i]);
                result[i] = nonSorted[index];
              }
              return result;
            }
            function splitTable(array, size) {
              const result = [];
              for (let i = 0; i < array.length; i += size) {
                result.push(array.slice(i, i + size));
              }
               return result;
            }
            // Get array of dates from table
            const dates = tableColumns.slice(fixedColumns.length, tableColumns.length);
            const dateArray = [];
            dates.forEach((date) => {
              dateArray.push(date.title);
            });
            // Get array of columns minus fixed columns
            const columns = tableColumns.slice(fixedColumns.length);
            // Split columns into arrays with max length of 7
            const maxLength = fixedColumns.length === 3 ? 7 : 8;
            const tableHeaders = splitTable(columns, maxLength);
            const newTables = [];

            // Add fixed columns to the new table headers and create a new table for each header
            tableHeaders.forEach((header) => {
              for (let i = 0; i < fixedColumns.length; i++) {
                header.unshift(tableColumns[i]);
              }
              let html = '<table class="dataTable no-footer"><tr>';
              header.forEach((col) => {
                html += '<td>' + col.title + '</td>';
              });
              html += '</tr>';
              newTables.push(html);
            });

            // Add data from indicators to each new table
            tableData.series.forEach((ind, index) => {
              let obsCounter = 0;
              const observations = Object.keys(ind.observations);
              // Sort observations keys to match order of table date columns
              const sortedObs = sortObsDates(observations, dateArray);
              for (let i = 0; i < newTables.length; i++) {
                let table = newTables[i];
                table += '<tr>';
                fixedColumns.forEach((dim) => {
                  table += `<td>${ind[dim]}</td>`;
                });
                let colCount = fixedColumns.length;
                while (colCount < 10 && obsCounter < sortedObs.length) {
                  table += '<td>' + ind.observations[sortedObs[obsCounter]] + '</td>';
                  colCount += 1;
                  obsCounter += 1;
                }
                if (index === tableData.series.length - 1) {
                  table += '</table>';
                }
                newTables[i] = table;
              }
            });

            // Original table
            const dtTable = $(win.document.body).find('table');
            newTables.forEach((table) => {
              $(win.document.body).append('<br>');
              $(win.document.body).append(table);
            });

            // Remove original table from print
            dtTable.remove();

            const $tables = $(win.document.body).find('table');
            $tables.each(function (i, table) {
              $(table).find('tr:odd').each(function () {
                $(this).css('background-color', '#F9F9F9');
              });
              $(table).find('td').each(function () {
                $(this).css('text-align', 'right');
                $(this).css('width', '10%');
              });
            });
            $(win.document.body)
              .find('br:last-child')
              .after('<p>Compiled by Research & Economic Analysis Division, State of Hawaii Department of Business, Economic Development and Tourism. For more information, please visit: http://dbedt.hawaii.gov/economic</p>');
          }
        }
      ]
    });
  }
}

import { Component, OnInit, OnChanges, Input } from '@angular/core';

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
  @Input() tableData: any;
  @Input() tableColumns: any;
  @Input() dateArray: Array<any>;
  private tableWidget: any;

  constructor() { }

  ngOnInit() { }

  ngOnChanges() {
    if (this.tableColumns && this.tableData) {
      this.createDatatable(this.tableColumns, this.tableData);
    }
  }

  createDatatable(tableColumns: Array<any>, tableData: any) {
    const moduleTable: any = $('#module-table');
    if (this.tableWidget) {
      // Destroy table if table has already been initialized
      this.tableWidget.clear().destroy();
      moduleTable.empty();
    }
    const fixedColumns = [...Object.keys(this.dimensions), 'units'];
    const fixedColumnsLength = fixedColumns.length // include units column to module dimensions
    this.tableWidget = moduleTable.DataTable({
      data: tableData.series,
      dom: 'Bt',
      columns: tableColumns,
      columnDefs: [
        {
          'className': 'td-left', 'targets': Array.apply(null, { length: fixedColumnsLength }).map(Number.call, Number)
        },
        {
          'className': 'td-right', 'targets': '_all',
          'render': function (data, type, row, meta) {
            // If no data is available for a given year, return an empty string
            return data === undefined ? ' ' : data;
          }
        }
      ],
      fixedColumns: {
        // Fixed columns prevents emptyTable language from being displayed
        leftColumns: !tableData.series ? '' : fixedColumnsLength
      },
      scrollY: '400px',
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
          className: 'btn btn-outline-secondary',
          text: '<span class="fas fa-file-excel" aria-hidden="true" title="Excel"></span>',
          exportOptions: {
            columns: ':visible'
          },
        }, {
          extend: 'csv',
          className: 'btn btn-outline-secondary',
          text: '<span class="fas fa-file-csv" aria-hidden="true" title="CSV"></span>',
          exportOptions: {
            columns: ':visible'
          },
        }, {
          extend: 'pdf',
          className: 'btn btn-outline-secondary',
          text: '<span class="fas fa-file-pdf" aria-hidden="true" title="PDF"></span>',
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
              const fixed = [];
              fixedColumns.forEach((col, index) => {
                fixed.unshift(row[index]);
              });
              // Get data from each original row excluding fixed columns and sources
              const nonFixedCols = row.slice(fixedColumnsLength, row.length);
              // Split data into groups of arrays with max length == 7
              const maxLength = fixedColumnsLength === 4 ? 4 : 3;
              const split = splitTable(nonFixedCols, maxLength);
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
          className: 'btn btn-outline-secondary',
          text: '<span class="fas fa-print" aria-hidden="true" title="Print"></span>',
          exportOptions: {
            columns: ':visible'
          },
          customize: function (win) {
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
            const dates = tableColumns.slice(fixedColumnsLength, tableColumns.length);
            const dateArray = [];
            dates.forEach((date) => {
              dateArray.push(date.title);
            });
            // Get array of columns minus fixed columns
            const columns = tableColumns.slice(fixedColumnsLength);
            // Split columns into arrays with max length of 7 (total of 10 cells per row)
            const maxLength = fixedColumnsLength === 4 ? 6 : 7;
            const tableHeaders = splitTable(columns, maxLength);
            const newTables = [];

            // Add fixed columns to the new table headers and create a new table for each header
            tableHeaders.forEach((header) => {
              for (let i = fixedColumnsLength - 1; i >= 0; i--) {
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
                let colCount = fixedColumnsLength;
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

import { Component, Input, OnChanges, ViewEncapsulation } from '@angular/core';

import 'datatables.net';
import 'datatables.net-buttons/js/buttons.flash.js';
import 'datatables.net-buttons/js/buttons.html5.js';
import 'datatables.net-buttons/js/buttons.print.js';
import 'datatables.net-buttons/js/dataTables.buttons.js';
import 'datatables.net-fixedcolumns';
import * as $ from 'jquery';

@Component({
  selector: 'app-module-table',
  templateUrl: './module-table.component.html',
  styleUrls: ['./module-table.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ModuleTableComponent implements OnChanges {
  @Input() dimensions: any;
  @Input() tableData: any;
  @Input() tableColumns: any;
  @Input() dateArray: Array<any>;
  private tableWidget: any;

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
    const fixedColumnsLength = fixedColumns.length; // include units column to module dimensions
    const sourceInfo = [
      'Data is updated monthly by the Research & Economic Analysis Division, State of Hawaii Department of Business, Economic Development and Tourism (DBEDT)',
      'Source of Data: Hawaii Tourism Authority',
      'Seasonally adjusted series are from DBEDT',
      'Hotel performance data prior to March 2017 are from Hospitality Advisors, LLC.'
    ];
    const tableTitle = 'Hawaii Tourism Data (from DBEDT Data Warehouse)';
    this.tableWidget = moduleTable.DataTable({
      data: tableData.series,
      dom: 'Bt',
      columns: tableColumns,
      columnDefs: [
        // Hide ID column -- used for initial ordering
        { 'visible': false, 'targets': 0 },
        {
          className: 'td-left',
          targets: [...Array(fixedColumnsLength)].map(Number.call, Number) //Array.apply(null, { length: fixedColumnsLength }).map(Number.call, Number)
        },
        {
          className: 'td-right',
          targets: '_all',
          render(data, type, row, meta) {
            // If no data is available for a given year, return an empty string
            return data === undefined ? ' ' : data;
          }
        },
        {
          className: 'px-2 py-1 text-nowrap font-sm',
          targets: '_all',
        }
      ],
      fixedColumns: {
        // Fixed columns prevents emptyTable language from being displayed
        leftColumns: !tableData.series ? '' : fixedColumnsLength
      },
      // scrollY: '464px',
      scrollX: true,
      paging: false,
      searching: false,
      info: false,
      language: {
        emptyTable: 'No data available for current selection'
      },
      buttons: [
        {
          extend: 'excel',
          className: 'btn btn-outline-secondary',
          text: '<span class="fas fa-file-excel" aria-hidden="true" title="Excel"></span>',
          exportOptions: {
            columns: ':visible',
          },
          title: tableTitle,
          customize: function (xlsx) {
            const sheet = xlsx.xl.worksheets['sheet1.xml'];
            $(`c[r="A1"]`, sheet).attr('s', '50');
            const sourceRow = tableData.series.length + 4;
            const lastRow = $(sheet).find('row:last-child');
            lastRow.after(
              `<row r="${sourceRow}"><c t="inlineStr" r="A${sourceRow}"><is><t xml:space="preserve"></t></is></c></row>
              <row r="${sourceRow + 1}"><c t="inlineStr" r="A${sourceRow + 1}"><is><t xml:space="preserve"></t></is></c></row>
              <row r="${sourceRow + 2}"><c t="inlineStr" r="A${sourceRow + 2}"><is><t xml:space="preserve"></t></is></c></row>
              <row r="${sourceRow + 3}"><c t="inlineStr" r="A${sourceRow + 3}"><is><t xml:space="preserve"></t></is></c></row>`
            );
            $(`c[r=A${sourceRow}] t`, sheet).text(sourceInfo[0]);
            $(`c[r=A${sourceRow + 1}] t`, sheet).text(sourceInfo[1]);
            $(`c[r=A${sourceRow + 2}] t`, sheet).text(sourceInfo[2]);
            $(`c[r=A${sourceRow + 3}] t`, sheet).text(sourceInfo[3]);
          },
        }, {
          extend: 'csv',
          className: 'btn btn-outline-secondary',
          text: '<span class="fas fa-file-csv" aria-hidden="true" title="CSV"></span>',
          exportOptions: {
            columns: ':visible'
          },
          title: tableTitle,
          customize(csv) {
            return csv + `\n\n"${sourceInfo[0]}"\n"${sourceInfo[1]}"\n"${sourceInfo[2]}"\n"${sourceInfo[3]}"`
          }
        }, {
          extend: 'pdfHtml5',
          orientation: 'landscape',
          className: 'btn btn-outline-secondary',
          text: '<span class="fas fa-file-pdf" aria-hidden="true" title="PDF"></span>',
          exportOptions: {
            columns: ':visible'
          },
          title: tableTitle,
          customize(doc) {
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
                cell.noWrap = false;
              });
            }
            doc.styles.title.alignment = 'left';
            doc.styles.title.fontSize = 13;
            // Get original table object
            const docContent = doc.content.find(c => Object.prototype.hasOwnProperty.call(c, 'table'));
            const currentTable = docContent.table.body;
            const formattedTable: Array<any> = [];
            currentTable.forEach((row, index) => {
              let counter = currentTable.length;
              const fixed = [];
              fixedColumns.forEach((col, colIndex) => {
                fixed.unshift(row[colIndex]);
              });
              // Get data from each original row excluding fixed columns and sources
              const nonFixedCols = row.slice(fixedColumnsLength, row.length);
              // Split data into groups of arrays with max length == 10
              const maxLength = fixedColumnsLength === 4 ? 6 : 7;
              const split = splitTable(nonFixedCols, maxLength);
              for (let newRow of split) {
                fixed.forEach((c) => {
                  const cCopy = Object.assign({}, c);
                  newRow.unshift(cCopy);
                });
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
            doc.content[1].table.widths = [...new Array(10)].map(() => '10%');
            doc.content.push({
              text: `\n${sourceInfo[0]}\n${sourceInfo[1]}\n${sourceInfo[2]}\n${sourceInfo[3]}`
            });
          }
        }, {
          extend: 'print',
          className: 'btn btn-outline-secondary',
          text: '<span class="fas fa-print" aria-hidden="true" title="Print"></span>',
          exportOptions: {
            columns: ':visible'
          },
          title: tableTitle,
          customize(win) {
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
              for (let i = 1; i < array.length; i += size) {
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
              // skip invisible ID column
              for (let i = fixedColumnsLength; i > 0; i--) {
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
              // start index set to 1 to skip invisible ID column
              let obsCounter = 1;
              const observations = Object.keys(ind.observations);
              // Sort observations keys to match order of table date columns
              const sortedObs = sortObsDates(observations, dateArray);
              for (let i = 0; i < newTables.length; i++) {
                let table = newTables[i];
                table += '<tr>';
                fixedColumns.forEach((dim) => {
                  table += `<td>${ind[dim]}</td>`;
                });
                let colCount = fixedColumnsLength + 1;
                while (colCount < 11 && obsCounter < sortedObs.length) {
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
              .find('table:last-child')
              .after(`<p>${sourceInfo[0]}<br />${sourceInfo[1]}<br />${sourceInfo[2]}<br />${sourceInfo[3]}</p>`);
          }
        }
      ]
    });
  }
}

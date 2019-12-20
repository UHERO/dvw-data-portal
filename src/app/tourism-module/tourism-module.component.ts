import { Component, OnInit, OnDestroy, ViewChild  } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Subscription } from 'rxjs';
import { DvwApiService } from '../dvw-api.service';
import { DatesSelected } from '../dates-selected';
import { HelperService } from '../helper.service';
import { DimensionSelectorComponent } from '../dimension-selector/dimension-selector.component';
import { FrequencySelectorComponent } from '../frequency-selector/frequency-selector.component';

@Component({
  selector: 'app-tourism-module',
  templateUrl: './tourism-module.component.html',
  styleUrls: ['./tourism-module.component.scss']
})
export class TourismModuleComponent implements OnInit, OnDestroy {
  selectedModule: string;
  selectedDimensions: any;
  selectedFrequency: string;
  routeSub: Subscription;
  datesSelected: DatesSelected;
  tableData: Array<any>;
  tableColumns: Array<any> = [];
  noData: boolean = true;
  noSeriesAvailable = false;
  invalidDates: string;
  displayTable: boolean = false;
  loading: boolean = false;
  @ViewChild(DimensionSelectorComponent, { static: false })
  public sidebar: DimensionSelectorComponent;
  @ViewChild(FrequencySelectorComponent, { static: false })
  public freqSelector: FrequencySelectorComponent;



  constructor(private route: ActivatedRoute, private apiService: DvwApiService, private _helper: HelperService) { }

  ngOnInit() {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      this.selectedModule = params.get('id');
    });
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }

  clearSelections() {
    this.displayTable = false;
    this.datesSelected = null;
    this.selectedFrequency = null;
    this.noData = true;
    this.noSeriesAvailable = false;
    this.tableData = [];
    this.sidebar.resetSelections();
    this.freqSelector.resetFrequency();
  }

  updateDimensions(event: any) {
    this.selectedDimensions = Object.assign({}, event);
    this.checkUserSelections(this.selectedDimensions, this.selectedFrequency);
  }

  updateFrequency(event: any) {
    this.selectedFrequency = event;
    this.checkUserSelections(this.selectedDimensions, this.selectedFrequency);
  }

  checkUserSelections(dimensions: any, frequency: string) {
    let allDimensionsSelected = false;
    if (dimensions && Object.keys(dimensions).length) {
      allDimensionsSelected = Object.keys(dimensions).every((key) => {
        return dimensions[key].length > 0
      }) === true;
    }
    if (allDimensionsSelected && frequency && !this.invalidDates) {
      // this.displayInstructions = false;
      this.loading = true;
      this.getSeriesData(dimensions, frequency);
    }
  }

  getSeriesData(dimensions: any, frequency: string) {
    const apiParam = this.formatApiParam(dimensions);
    this.apiService.getSeries(this.selectedModule, apiParam, frequency).subscribe((series) => {
      if (series) {
        this.noSeriesAvailable = false;
        this.datesSelected = this.datesSelected ? this.datesSelected : <DatesSelected>{};
        this.datesSelected.startDate = series.observationStart;
        this.datesSelected.endDate = series.observationEnd;
        this._helper.yearsRange(this.datesSelected);
        if (frequency === 'Q') {
          this._helper.quartersRange(this.datesSelected);
        }
        if (frequency === 'M') {
          this._helper.monthsRange(this.datesSelected);
        }
        // leaving second argument as an array in case frequency needs to be a multiple select
        const dateArray = this._helper.categoryDateArray(this.datesSelected, [frequency]);
        const formattedSeries = this.formatSeriesData(series, dateArray, dimensions);
        this.tableColumns = this.createColumns(dateArray, dimensions);
        this.tableData = formattedSeries;
        console.log('tableData', this.tableData)
        this.noData = false;
      }
      if (!series) {
        this.noSeriesAvailable = true;
        this.tableColumns = this.createColumns([], dimensions);
        this.tableData = [];
        this.noData = true;
      }
    },
    (error) => {
      console.log('get series data error', error);
      this.noSeriesAvailable = true;
    },
    () => {
      this.loading = false;
    });
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

  formatSeriesData = (series: any, dates: Array<any>, dimensions: any) => {
    series.series.forEach((serie) => {
      this.identifySeriesColumns(serie, dimensions);
      serie['dimensions'] = dimensions;
      let results = {}
      dates.forEach((date) => {
        results[date.tableDate] = ' ';
        const dateExists = serie.dates.indexOf(date.date);
        if (dateExists > -1) {
          results[date.tableDate] = serie.values[dateExists] === Infinity ? ' ' : serie.values[dateExists].toLocaleString('en-US', {minimumFractionDigits: serie.decimal, maximumFractionDigits: serie.decimal});
        }
      });
      serie['observations'] = results;
    });
    return series;
  }

  identifySeriesColumns(serie: any, dimensions: any) {
    serie.columns.forEach((col) => {
      this.findColumnDimension(serie, dimensions, col);
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
        serie[key] = opt.nameT ? opt.nameT : opt.nameW;
        if (opt.unit) {
          serie.units = opt.unit;
          serie.decimal = opt.decimal;
        }
      }
    });
  }

  createColumns = (dates: Array<any>, dimensions: any) => {
    const tableColumns = [];
    Object.keys(dimensions).forEach(key => tableColumns.push({ title: this.getDimensionColName(key), data: key }));
    tableColumns.push({ title: 'Units', data: 'units' });
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

  updateDateAndTable(event: any, selectedDate: string) {
    this.datesSelected[selectedDate] = event;
    this.updateDatatable(this.datesSelected, this.selectedFrequency, this.tableData);
  }

  updateDatatable(datesSelected: DatesSelected, freq: string, tableData: Array<any>) {
    const validDates = this.checkValidDates(this.datesSelected);
    if (validDates) {
      this.invalidDates = null;
      this.checkUserSelections(this.selectedDimensions, this.selectedFrequency);
    }
    if (!validDates) {
      this.invalidDates = '*Invalid date selection';
    }
  }

  showTable() {
    this.displayTable = true;
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
}

import { Component, OnInit, OnDestroy, ViewChild  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  moduleName: string;
  selectedDimensions: any;
  selectedFrequency: string;
  routeSub: Subscription;
  datesSelected: DatesSelected;
  tableData: Array<any>;
  tableColumns: Array<any> = [];
  noData = true;
  noSeriesAvailable = false;
  invalidDates: string;
  displayTable = false;
  loading = false;
  frequencies: Array<any>;
  @ViewChild(DimensionSelectorComponent)
  public sidebar: DimensionSelectorComponent;
  @ViewChild(FrequencySelectorComponent)
  public freqSelector: FrequencySelectorComponent;



  constructor(private route: ActivatedRoute, private apiService: DvwApiService, private _helper: HelperService) { }

  ngOnInit() {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      this.selectedModule = params.get('id');
      this.moduleName = this.getModuleName(this.selectedModule);
    });
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }

  getModuleName = (selectedModule: string) => {
    switch(selectedModule) {
      case 'trend':
        return 'Visitor Trends';
      case 'char':
        return 'Visitor Characteristics';
      case 'airseat':
        return 'Air Seats to Hawaii';
      case 'exp':
        return 'Expenditure Patterns';
      case 'hotel':
        return 'Hotel Performance';
      default:
        return '';
    }
  }

  clearSelections() {
    this.displayTable = false;
    this.datesSelected = null;
    this.selectedFrequency = null;
    this.invalidDates = null;
    this.noData = true;
    this.noSeriesAvailable = false;
    this.tableData = [];
    this.frequencies = [];
    this.sidebar.resetSelections();
    this.freqSelector.resetFrequency();
    this.frequencies = [];
  }

  updateDimensions(event: any) {
    this.selectedDimensions = Object.assign({}, event);
    this.datesSelected = {} as DatesSelected;
    this.checkUserSelections(this.selectedDimensions, this.selectedFrequency);
  }

  updateFrequency(event: any) {
    this.selectedFrequency = event;
    this.datesSelected = {} as DatesSelected;
    this.checkUserSelections(this.selectedDimensions, this.selectedFrequency);
  }

  checkUserSelections(dimensions: any, frequency: string) {
    let allDimensionsSelected = false;
    if (dimensions && Object.keys(dimensions).length) {
      allDimensionsSelected = Object.keys(dimensions).every((key) => {
        return dimensions[key].length > 0;
      }) === true;
    }
    if (allDimensionsSelected && !frequency) {
      // API Frequency endpoint has 5 required parameters
      const reqParams = ['i', 'm', 'd', 'g', 'c'];
      const moduleParams = Object.keys(dimensions).map(k => k.substring(0, 1));
      const unusedParams = reqParams.filter(p => !moduleParams.includes(p));
      const freqApiParam = this.formatApiParam(dimensions, unusedParams);
      this.getFrequencies(freqApiParam);
    }
    if (allDimensionsSelected && frequency && !this.invalidDates) {
      this.loading = true;
      this.getSeriesData(dimensions, frequency);
    }
  }

  getFrequencies(apiParam: string) {
    this.apiService.getFrequencies(this.selectedModule, apiParam).subscribe((freqs) => {
      this.frequencies = freqs;
    });
  }

  getSeriesData(dimensions: any, frequency: string) {
    const apiParam = this.formatApiParam(dimensions);
    this.apiService.getSeries(this.selectedModule, apiParam, frequency).subscribe((series) => {
      if (series) {
        this.noSeriesAvailable = false;
        this.datesSelected = this.datesSelected ? this.datesSelected : {} as DatesSelected;
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

  formatApiParam = (dimensions: any, unusedFreqParams?: Array<any>) => {
    let apiParam = '';
    const dimensionKeys = Object.keys(dimensions);
    dimensionKeys.forEach((key, index) => {
      apiParam += `${key.substring(0, 1)}=`;
      dimensions[key].forEach((opt, optIndex) => {
        apiParam += `${opt.handle}`;
        if (optIndex !== dimensions[key].length - 1) {
          apiParam += `,`;
        }
      });
      if (index !== dimensionKeys.length - 1) {
        apiParam += `&`;
      }
    });
    if (unusedFreqParams) {
      unusedFreqParams.forEach((param) => apiParam += `&${param}=0`);
    }
    return apiParam;
  }

  formatSeriesData = (series: any, dates: Array<any>, dimensions: any) => {
    series.series.forEach((serie) => {
      this.identifySeriesColumns(serie, dimensions);
      serie.dimensions = dimensions;
      const results = {};
      dates.forEach((date) => {
        results[date.tableDate] = ' ';
        const dateExists = serie.dates.indexOf(date.date);
        if (dateExists > -1) {
          results[date.tableDate] = serie.values[dateExists] === Infinity ?
            ' ' :
            serie.values[dateExists].toLocaleString('en-US', {minimumFractionDigits: serie.decimal, maximumFractionDigits: serie.decimal});
        }
      });
      serie.observations = results;
      this.setSeriesTableOrder(serie);
    });
    return series;
  }

  setSeriesTableOrder(serie: any) {
    const dimensionKeys = Object.keys(serie.dimensions);
    dimensionKeys.forEach((key) => {
      serie.dimensions[key].forEach((d) => {
        if (serie.columns.includes(d.handle)) {
          serie.order = serie.order ? serie.order + this.formatSeriesOrder(d.level, d.order) : this.formatSeriesOrder(d.level, d.order)
        }
      });
    });
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

  formatSeriesOrder(level:number, index: number) {
    const ordering = [level, index];
    const pad = '00';
    let result = '';
    ordering.forEach((index) => {
      const str = '' + index;
      const paddedStr = pad.substring(0, pad.length - str.length) + str;
      result += paddedStr;
    });
    return result;
  }

  createColumns = (dates: Array<any>, dimensions: any) => {
    const tableColumns = [{ title: 'Id', data: 'order'}];
    Object.keys(dimensions).forEach(key => tableColumns.push({ title: this.getDimensionColName(key), data: key }));
    tableColumns.push({ title: 'Units', data: 'units' });
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
    this.updateDatatable(this.datesSelected);
  }

  updateDatatable(datesSelected: DatesSelected) {
    const validDates = this.checkValidDates(datesSelected);
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
    const {
      selectedStartYear,
      selectedEndYear,
      selectedStartQuarter,
      selectedEndQuarter,
      selectedStartMonth,
      selectedEndMonth
    } = dates;
    if (selectedStartYear > selectedEndYear) {
      return false;
    }
    if (selectedStartYear === selectedEndYear) {
      if ((selectedStartQuarter > selectedEndQuarter) || (selectedStartMonth > selectedEndMonth)) {
        return false;
      }
    }
    return true;
  }
}

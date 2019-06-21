import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelperService {
  
  constructor() { }

  categoryDateArray(selectedDates, selectedFreqs: Array<string>) {
    // Dates used in table header
    const dateArray = [];
    const m = { 1: '01', 2: '02', 3: '03', 4: '04', 5: '05', 6: '06', 7: '07', 8: '08', 9: '09', 10: '10', 11: '11', 12: '12' };
    const q = { 1: 'Q1', 4: 'Q2', 7: 'Q3', 10: 'Q4' };
    let startYear = +selectedDates.startDate.substr(0, 4);
    let endYear = +selectedDates.endDate.substr(0, 4);
    let startMonth = +selectedDates.startDate.substr(5, 2);
    let endMonth = +selectedDates.endDate.substr(5, 2);
    const annualSelected = selectedFreqs.indexOf('A') > -1;
    const monthSelected = selectedFreqs.indexOf('M') > -1;
    const quarterSelected = selectedFreqs.indexOf('Q') > -1;
    // Check if selectedDates' properties have values set (i.e. date range selectors have been used)
    const dates = this.checkSelectedDates(selectedDates, monthSelected, startYear, endYear, startMonth, endMonth, q);
    startYear = dates.startYear;
    endYear = dates.endYear;
    startMonth = dates.startMonth;
    endMonth = dates.endMonth;
    while (startYear + '-' + m[startMonth] + '-01' <= endYear + '-' + m[endMonth] + '-01') {
      // Frequency display order: M, Q, A
      if (monthSelected) {
        dateArray.push({date: startYear.toString() + '-' + m[startMonth] + '-01', tableDate: startYear.toString() + '-' + m[startMonth]});
      }
      if (quarterSelected) {
        const qMonth = this.addQuarterObs(startMonth, monthSelected);
        if (qMonth) {
          dateArray.push({date: startYear.toString() + '-' + m[qMonth] + '-01', tableDate: startYear.toString() + ' ' + q[qMonth]});
        }
      }
      if (annualSelected) {
        const addAnnual = this.addAnnualObs(startMonth, monthSelected, quarterSelected);
        if (addAnnual) {
          dateArray.push({date: startYear.toString() + '-01-01', tableDate: startYear.toString()});
        }
      }
      startYear = startMonth === 12 ? startYear += 1 : startYear;
      startMonth = startMonth === 12 ? 1 : startMonth += 1;
    }
    return dateArray;
  }

  addQuarterObs(startMonth, monthSelected) {
    let monthCheck, qMonth;
    // If M not selected, add Q at months 1, 4, 7, 10 (i.e. startMonth === 1, 4, 7, 10)
    if (!monthSelected) {
      qMonth = startMonth;
      monthCheck = this.checkStartMonth(startMonth + 2);
      if (monthCheck) { return qMonth; };
    }
    // If M is selected, add Q after months 3, 7, 9, 12 (i.e. startMonth === 3, 7, 9, 12)
    if (monthSelected) {
      qMonth = startMonth - 2;
      monthCheck = this.checkStartMonth(startMonth);
      if (monthCheck) { return qMonth; };
    }
  }

  addAnnualObs(startMonth, monthSelected, quarterSelected) {
    // If M selected, add A after month 12
    if (monthSelected && startMonth === 12) {
      return true;
    }
    // If Q selected (w/o M), add A after 4th Quarter
    if (quarterSelected && !monthSelected && startMonth === 10) {
      return true;
    }
    // If only A selected, add to date array
    if (!quarterSelected && !monthSelected && startMonth === 1) {
      return true;
    }
    return false;
  }

  checkSelectedDates(selectedDates, monthSelected, startYear, endYear, startMonth, endMonth, quarters) {
    startYear = selectedDates.selectedStartYear ? +selectedDates.selectedStartYear : startYear;
    endYear = selectedDates.selectedEndYear ? +selectedDates.selectedEndYear : endYear;
    startMonth = selectedDates.selectedStartMonth ? +selectedDates.selectedStartMonth : startMonth;
    endMonth = selectedDates.selectedEndMonth ? +selectedDates.selectedEndMonth : endMonth;
    if (!monthSelected) {
      startMonth = selectedDates.selectedStartQuarter ? this.setStartMonthQ(quarters, selectedDates, startMonth) : startMonth;
      endMonth = selectedDates.selectedEndQuarter ? this.setEndMonthQ(quarters, selectedDates, endMonth) : endMonth;
    }
    return { startYear: startYear, endYear: endYear, startMonth: startMonth, endMonth: endMonth };
  }

  // If returns true, add quarter to date array
  checkStartMonth(month) {
    if (month === 3 || month === 6 || month === 9 || month === 12) {
      return true;
    }
    return false;
  }

  // Get start month based on selected start quarter
  setStartMonthQ(quarters, selectedDates, startMonth) {
    for (const key in quarters) {
      if (quarters[key] === selectedDates.selectedStartQuarter) {
        startMonth = +key;
      }
    }
    return startMonth;
  }

  // Get end month based on selected end quarter
  setEndMonthQ(quarters, selectedDates, endMonth) {
    for (const key in quarters) {
      if (quarters[key] === selectedDates.selectedEndQuarter) {
        endMonth = +key + 2;
      }
    }
    return endMonth;
  }
}

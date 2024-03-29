import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin as observableForkJoin, of as observableOf, Observable } from 'rxjs';
import { tap, map, mergeMap } from 'rxjs/operators';
import { HelperService } from './helper.service';
const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class DvwApiService {
  private cachedDimensions = [];
  private cachedDimensionOptions = [];
  private cachedSeries = [];
  private cachedFrequencies = [];

  constructor(private http: HttpClient, private _helper: HelperService) { }

  mapData = response => response.data;

  mapFrequencies = (response) => {
    const freqs = response.data;
    const freqArray = [];
    freqs?.forEach((f) => {
      if (f === 'A') {
        freqArray.push({ value: 'A', label: 'Annual' });
      }
      if (f === 'Q') {
        freqArray.push({ value: 'Q', label: 'Quarterly' });
      }
      if (f === 'M') {
        freqArray.push({ value: 'M', label: 'Monthly' });
      }
    });
    return freqArray;
  }

  getDimensions(mod: string): any {
    if (this.cachedDimensions[mod]) {
      return observableOf(this.cachedDimensions[mod]);
    } else {
      let moduleDimensions$ = this.http.get(`${API_URL}/dimensions/${mod}`).pipe(
        map(this.mapData),
        tap(val => {
          this.cachedDimensions[mod] = val;
          moduleDimensions$ = null;
        }),
      );
      return moduleDimensions$;
    }
  }

  getOptions(dimension: string, mod: string): Observable<Array<any>> {
    if (this.cachedDimensionOptions[mod]) {
      return observableOf(this.cachedDimensionOptions[dimension + mod]);
    } else {
      let moduleDimensionOptions$ = this.http.get(`${API_URL}/${dimension}/all/${mod}`).pipe(
        map(this.mapData),
        tap(val => {
          this.cachedDimensionOptions[mod] = val;
          moduleDimensionOptions$ = null;
        }),
      );
      return moduleDimensionOptions$;
    }
  }

  getDimensionsWithOptions(mod: string) {
    if (this.cachedDimensionOptions[mod]) {
      this.cachedDimensionOptions[mod].forEach((dim) => {
        // reset selections after navigating away from module
        const selected = dim.options.filter(opt => opt.selected);
        const active = dim.options.filter(opt => opt.active);
        selected.forEach((option) => {
          dim.options.find(opt => opt.handle === option.handle).selected = false;
        });
        active.forEach((option) => {
          dim.options.find(opt => opt.handle === option.handle).active = false;
        });
      });
      return observableOf(this.cachedDimensionOptions[mod]);
    } else {
      const selectors = [];
      let moduleDimensionOptions$ = this.http.get(`${API_URL}/dimensions/${mod}`).pipe(
        map(response => this.mapDimensionOrder(response, mod)),
        mergeMap((dimensions) =>
          observableForkJoin(dimensions.map(d => this.http.get(`${API_URL}/${d}/all/${mod}`).pipe(
            map((res: any) => {
              const mappedResponse = mapDimensionOptions(res);
              const selector = { name: d, options: mappedResponse };
              selectors.push(selector);
              this.cachedDimensionOptions[mod] = moduleDimensionOptions$;
              moduleDimensionOptions$ = null;
              return selector;
            })
          )))
        )
      );
      return moduleDimensionOptions$;
    }
  }

  getFrequencies(mod: string, dimensions: string) {
    if (this.cachedFrequencies[`${mod}:${dimensions}`]) {
      return observableOf(this.cachedFrequencies[`${mod}:${dimensions}`]);
    } else {
      let freqs$ = this.http.get(`${API_URL}/freqavail/${mod}?${dimensions}`).pipe(
        map(this.mapFrequencies),
        tap(val => {
          this.cachedFrequencies[`${mod}:${dimensions}`] = val;
          freqs$ = null;
        }),
      );
      return freqs$;
    }
  }

  getSeries(mod: string, dimensionList: string, freq: string) {
    if (this.cachedSeries[`${mod}:${dimensionList}:${freq}`]) {
      return observableOf(this.cachedSeries[`${mod}:${dimensionList}:${freq}`]);
    } else {
      let series$ = this.http.get(`${API_URL}/series/${mod}?${dimensionList}&f=${freq}`).pipe(
        map(this.mapData),
        tap(val => {
          this.cachedSeries[`${mod}:${dimensionList}:${freq}`] = val;
          series$ = null;
        }),
      );
      return series$;
    }
  }

  mapDimensionOrder = (response: any, mod: string): any => {
    const sortedDimensions = [];
    const order = this._helper.dimensionsOrder.find(module => module.module === mod).order;
    order.forEach((dim) => {
      sortedDimensions.push(response.data.find(r => r === dim));
    });
    return sortedDimensions;
  }
}

function mapDimensionOptions(response): any {
  const options = response.data;
  const dataMap = options.reduce((m, value) => (m[value.handle] = value, m), {});
  const optionTree = [];
  options.forEach((value) => {
    const parent = dataMap[value.parent];
    if (parent) {
      (parent.children || (parent.children = [])).push(value);
    } else {
      optionTree.push(value);
    }
  });
  return optionTree;
}

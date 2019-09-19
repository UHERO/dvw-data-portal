import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
//import { of as observableOf, Observable, from } from 'rxjs';
import { forkJoin as observableForkJoin, of as observableOf, Observable } from 'rxjs';
import { tap, map, mergeMap, switchMap, flatMap } from 'rxjs/operators';
import { HelperService } from './helper.service';
const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class DvwApiService {
  private cachedDimensions = [];
  private cachedDimensionOptions = [];
  private cachedSeries = [];

  constructor(private http: HttpClient, private _helper: HelperService) { }

  getDimensions(mod: string): any {
    if (this.cachedDimensions[mod]) {
      return observableOf(this.cachedDimensions[mod]);
    } else {
      let moduleDimensions$ = this.http.get(`${API_URL}/dimensions/${mod}`).pipe(
        map(mapData),
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
        map(mapData),
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
        flatMap((dimensions) => 
          observableForkJoin(dimensions.map(d => this.http.get(`${API_URL}/${d}/all/${mod}`).pipe(
            map((res: any) => {
              console.log(res)
              const mappedResponse = mapDimensionOptions(res);
              const selector = { name: d, options: mappedResponse };
              console.log('selector', selector)
              selectors.push(selector)
              this.cachedDimensionOptions[mod] = selectors;
              console.log(selectors)
              moduleDimensionOptions$ = null;
              return selector;
            })
          )))
        )
      );
      return moduleDimensionOptions$;
    }
  }

  getSeries(mod: string, dimensionList: string, freq: string) {
    if (this.cachedSeries[`${mod}:${dimensionList}:${freq}`]) {
      return observableOf(this.cachedSeries[`${mod}:${dimensionList}:${freq}`]);
    } else {
      let series$ = this.http.get(`${API_URL}/series/${mod}?${dimensionList}&f=${freq}`).pipe(
        map(mapData),
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

const mapData = response => response.data;

function mapDimensionOptions(response): any {
  const options = response.data;
  const dataMap = options.reduce((map, value) => (map[value.handle] = value, map), {});
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
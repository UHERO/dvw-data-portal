import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
//import { of as observableOf, Observable, from } from 'rxjs';
import { forkJoin as observableForkJoin, of as observableOf, Observable } from 'rxjs';
import { tap, map, mergeMap, switchMap, flatMap } from 'rxjs/operators';
const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class DvwApiService {
  private cachedDimensions = [];
  private cachedDimensionOptions = [];
  private cachedSeries = [];

  constructor(private http: HttpClient) { }

  testData = {
    "data": {
      "frequency": "M",
      "series": [
        {
          "columns": ["VV101", "MM101", "DI10"],
          "observationStart": "2011-01-01",
          "observationEnd": "2011-02-01",
          "dates": [ "2011-01-01", "2011-02-01"],
          "values": [ 903.23, 901.80],
        },
        {
          "columns": ["VV101", "MM101", "DI20"],
          "observationStart": "2011-01-01",
          "observationEnd": "2011-02-01",
          "dates": [ "2011-01-01", "2011-02-01"],
          "values": [ 843.37, 849.08],
        },
      ]
    }
  }

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
      return observableOf(this.cachedDimensionOptions[mod]);
    } else {
      const selectors = [];
      let moduleDimensionOptions$ = this.http.get(`${API_URL}/dimensions/${mod}`).pipe(
        map(mapData),
        flatMap((dimensions) => 
          observableForkJoin(dimensions.map(d => this.http.get(`${API_URL}/${d}/all/${mod}`).pipe(
            map((res: any) => {
              const selector = { name: d, options: res.data };
              selectors.push(selector)
              this.cachedDimensionOptions[mod] = selectors;
              moduleDimensionOptions$ = null;
              return selector;
            })
          )))
        )
      )
      return moduleDimensionOptions$;
    }
  }

  getSeries(mod: string, dimensionList: string, freq: string) {
    // return this.testData.data;
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

}

function mapData(response): any {
  return response.data;
}
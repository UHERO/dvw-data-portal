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
  constructor(private http: HttpClient) { }

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
              return selector;
            })
          )))
        )
      )
      this.cachedDimensionOptions[mod] = selectors;
      return moduleDimensionOptions$;
    }
  }

}

function mapData(response): any {
  return response.data;
}
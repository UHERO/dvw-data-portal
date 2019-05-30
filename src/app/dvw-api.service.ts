import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of as observableOf, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class DvwApiService {
  private cachedDimensions = [];
  constructor(private http: HttpClient) { }

  getDimensions(module: string): Observable<Array<string>> {
    if (this.cachedDimensions[module]) {
      return observableOf(this.cachedDimensions[module]);
    } else {
      let moduleDimensions$ = this.http.get(`${API_URL}/dimensions/${module}`).pipe(
        map(mapData),
        tap(val => {
          this.cachedDimensions[module] = val;
          moduleDimensions$ = null;
        }),
      );
      return moduleDimensions$;
    }
  }
}

function mapData(response): any {
  return response.data;
}
import { TestBed } from '@angular/core/testing';

import { DvwApiService } from './dvw-api.service';

describe('DvwApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DvwApiService = TestBed.get(DvwApiService);
    expect(service).toBeTruthy();
  });
});

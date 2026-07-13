import { TestBed } from '@angular/core/testing';

import { WeatherTransfer } from './weather-transfer';

describe('WeatherTransfer', () => {
  let service: WeatherTransfer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeatherTransfer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

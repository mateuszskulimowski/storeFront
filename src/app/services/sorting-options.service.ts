import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SortingOptionModel } from '../models/sorting-option.model';

@Injectable({ providedIn: 'root' })
export class SortingOptionsService {
  getsAll(): Observable<Record<string, SortingOptionModel>> {
    return of({
      Featured: { order: 'desc', sortBy: 'featureValue' },
      'Price: High to low': { order: 'asc', sortBy: 'price' },
      'Price: Low to High': { order: 'desc', sortBy: 'price' },
      'Avg, Rating': { order: 'desc', sortBy: 'ratingValue' },
    });
  }
}

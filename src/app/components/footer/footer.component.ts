import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { Observable, of } from 'rxjs';
import { CategoryModel } from '../../models/category.model';
import { StoreModel } from '../../models/store.model';
import { StoreService } from '../../services/store.service';

@Component({
  selector: 'app-footer',
  styleUrls: ['./footer.component.scss'],
  templateUrl: './footer.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  readonly categories$: Observable<CategoryModel[]> =
    this._storeService.getAllCategories();
  readonly stores$: Observable<StoreModel[]> =
    this._storeService.getAllStories();
  readonly getUs$: Observable<string[]> = of([
    'Company',
    'About',
    'Blog',
    'Help center',
  ]);

  constructor(private _storeService: StoreService) {}
}

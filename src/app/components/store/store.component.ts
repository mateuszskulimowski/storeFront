import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  of,
  shareReplay,
} from 'rxjs';
import {
  debounceTime,
  filter,
  last,
  map,
  startWith,
  take,
  tap,
} from 'rxjs/operators';

import { SortingOptionModel } from '../../models/sorting-option.model';
import { CategoryModel } from '../../models/category.model';
import { StoreModel } from '../../models/store.model';
import { ProductQueryModel } from '../../query-models/product.query-model';
import { StoreService } from '../../services/store.service';
import { SortingOptionsService } from '../../services/sorting-options.service';
import { ProductModel } from '../../models/product.model';

@Component({
  selector: 'app-store',
  styleUrls: ['./store.component.scss'],
  templateUrl: './store.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreComponent {
  readonly filterForm: FormGroup = new FormGroup({
    category: new FormGroup({}),
    store: new FormGroup({}),
  });
  readonly rangePriceForm: FormGroup = new FormGroup({
    minPrice: new FormControl(),
    maxPrice: new FormControl(),
  });
  readonly ratingStarForm: FormGroup = new FormGroup({});
  readonly sortingForm: FormControl = new FormControl('Featured');
  readonly sortingOption$: Observable<Record<string, SortingOptionModel>> =
    this._sortingOptionService.getsAll().pipe(shareReplay(1));
  readonly sortingValue$: Observable<SortingOptionModel> = combineLatest([
    this.sortingOption$,
    this.sortingForm.valueChanges.pipe(startWith('Featured')),
  ]).pipe(
    map(
      ([sortOption, sortForm]: [
        Record<string, SortingOptionModel>,
        string
      ]) => {
        // console.log(sortForm);
        return sortOption[sortForm];
      }
    )
  );
  readonly displaySortingOptions$: Observable<string[]> =
    this.sortingOption$.pipe(
      map((sortinOptions) => Object.keys(sortinOptions))
    );
  readonly ratingStars$: Observable<{ value: number; stars: number[] }[]> = of([
    { value: 5, stars: this._ratingStar(5) },
    { value: 4, stars: this._ratingStar(4) },
    { value: 3, stars: this._ratingStar(3) },
    { value: 2, stars: this._ratingStar(2) },
    { value: 1, stars: this._ratingStar(1) },
  ]).pipe(tap((stars) => this._addRatingStarControl(stars)));
  readonly rating$: Observable<number[]> =
    this.ratingStarForm.valueChanges.pipe(
      startWith([]),
      map((form) => {
        // console.log(
        //   'rate',
        //   Object.keys(form).filter((k) => form[k] === true)
        // );
        return Object.keys(form).reduce(
          (acc, c) => (form[c] === true ? [...acc, +c] : acc),
          [] as number[]
        );
      })
    );
  readonly categories$: Observable<CategoryModel[]> = this._storeService
    .getAllCategories()
    .pipe(
      shareReplay(1),
      tap((categories) => {
        this._addCategoryControl(categories);
        return categories;
      })
    );
  readonly selectedCategories$: Observable<string[]> =
    this.filterForm.valueChanges.pipe(
      map((form) => form.category),
      startWith([]),
      map((category) => {
        // console.log('category', Object.keys(category));
        return Object.keys(category).filter((k) => category[k] === true);
      })
    );
  // readonly selectedCategories$: Observable<string> = combineLatest([
  //   this._storeService.getAllCategories(),
  //   this.filterForm.valueChanges.pipe(map((form) => form.category)),
  // ]).pipe(

  //   shareReplay(1),
  //   map(([categories, categoryForm]) => {
  //     const categoryMap = categories
  //       .reduce((acc: string[], c: CategoryModel) => {
  //         categoryForm[c.id];
  //         if (categoryForm[c.id] === true) {
  //           return [...acc, c.id];
  //         }
  //         return acc;
  //       }, [])
  //       .sort()
  //       .join(',');

  //     return categoryMap;
  //   })
  // );
  readonly stores$: Observable<StoreModel[]> = this._storeService
    .getAllStories()
    .pipe(tap((stores) => this._addStoreCorntrol(stores)));
  readonly selectedStores$: Observable<string[]> =
    this.filterForm.valueChanges.pipe(
      map((form) => form.store),
      startWith([]),
      map((store) => {
        return Object.keys(store).filter((k) => store[k] === true);
      }),
      shareReplay(1)
    );
  readonly rangePrice$: Observable<{ minPrice: number; maxPrice: number }> =
    this.rangePriceForm.valueChanges.pipe(
      startWith({ minPrice: 0, maxPrice: Infinity }),
      debounceTime(1000)
    );
  readonly pageSizeForm: FormControl = new FormControl(6);
  private _pageNumberSubject: BehaviorSubject<number> =
    new BehaviorSubject<number>(1);
  public pageNumber$: Observable<number> =
    this._pageNumberSubject.asObservable();
  readonly pageSize$: Observable<number> = this.pageSizeForm.valueChanges.pipe(
    startWith(6),
    shareReplay(6)
  );
  readonly pageSizeOption$: Observable<number[]> = of([6, 12, 18]);

  readonly products$: Observable<ProductQueryModel[]> = combineLatest([
    this._storeService.getAllProducts(),
    this.categories$,
    this.selectedStores$,
    this.selectedCategories$,
    this.rangePrice$,
    this.rating$,
    this.sortingValue$,
  ]).pipe(
    map(
      ([
        products,
        categories,
        selectedStores,
        selectedCategories,
        price,
        ratingStars,
        sortingValue,
      ]) => {
        const categoryMap = categories.reduce((acc, c) => {
          return { ...acc, [c.id]: c };
        }, {}) as Record<string, CategoryModel>;
        return this._sortProducts(products, sortingValue)
          .map((product) => ({
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            category: categoryMap[product.id]?.name,
            rating: this._ratingStar(product.ratingValue),
            ratingCount: product.ratingCount,
            categoryId: product.categoryId,
            storeIds: product.storeIds.sort(),
            ratingValue: product.ratingValue,
          }))
          .filter((product) =>
            selectedCategories.length > 0
              ? selectedCategories.includes(product.categoryId)
              : true
          )
          .filter((product) => {
            return selectedStores.length > 0
              ? product.storeIds.filter((storeId) =>
                  selectedStores.includes(storeId)
                ).length > 0
              : true;
          })
          .filter((product) =>
            price.minPrice ? price.minPrice <= product.price : product
          )
          .filter((product) =>
            price.maxPrice ? price.maxPrice >= product.price : product
          )
          .filter((product) => {
            // console.log(ratingStars);
            return ratingStars.length > 0
              ? ratingStars.includes(Math.floor(product.ratingValue))
              : true;
          });
      }
    )
  );
  readonly pageNumberOptions$: Observable<{
    pages: number[];
    lastPage: number;
  }> = combineLatest([this.products$, this.pageSize$]).pipe(
    map(([products, pageSize]) => {
      const maxPage: number = Math.ceil(products.length / pageSize);
      const x = [1, 2, 3, 4, 5, 6];
      // console.log(
      //   new Array(maxPage).fill(0).map((_, idx) => {
      //     console.log(idx);
      //     return idx + 1;
      //   })
      // );
      return {
        pages: new Array(maxPage).fill(0).map((_, idx) => {
          // console.log(idx);
          return idx + 1;
        }),
        lastPage: maxPage ?? 1,
      };
    }),
    tap((options) => this._checkCurrentPage(options.lastPage))
  );
  readonly displayProduct$: Observable<ProductQueryModel[]> = combineLatest([
    this.products$,
    this.pageNumber$,
    this.pageSize$,
  ]).pipe(
    map(
      ([products, pageNumber, pageSize]: [
        ProductQueryModel[],
        number,
        number
      ]) => products.slice((pageNumber - 1) * pageSize, pageSize * pageSize)
    )
  );
  constructor(
    private _storeService: StoreService,
    private _sortingOptionService: SortingOptionsService
  ) {}

  setPageNumber(pageNumber: number) {
    console.log(pageNumber);
    this._pageNumberSubject.next(pageNumber);
  }
  nextPageNumber(lastPage: number) {
    let pageNumber = this._pageNumberSubject.getValue();
    if (lastPage > pageNumber) {
      this._pageNumberSubject.next(pageNumber + 1);
    }
  }
  prevPageNumber() {
    let pageNumber = this._pageNumberSubject.getValue();
    if (pageNumber > 1) {
      this._pageNumberSubject.next(pageNumber - 1);
    }
  }
  private _ratingStar(value: number): number[] {
    let star = [];
    let i = 1;
    for (i; i <= value; i++) {
      star.push(1);
    }
    if (value - star.length >= 0.5) {
      star.push(0.5);
    }
    for (i; i <= 5; i++) {
      star.push(0);
    }
    return star;
  }
  private _addCategoryControl(categories: CategoryModel[]): void {
    let categoryForm: FormGroup = this.filterForm.get('category') as FormGroup;
    categories.forEach((category) =>
      categoryForm.addControl(category.id, new FormControl(false))
    );
  }
  private _addStoreCorntrol(stores: StoreModel[]): void {
    let storeForm: FormGroup = this.filterForm.get('store') as FormGroup;
    stores.forEach((store) =>
      storeForm.addControl(store.id, new FormControl(false))
    );
  }
  private _addRatingStarControl(
    ratingStars: { value: number; stars: number[] }[]
  ) {
    ratingStars.forEach((ratingStar) =>
      this.ratingStarForm.addControl(
        ratingStar.value.toString(),
        new FormControl(false)
      )
    );
  }
  private _sortProducts(
    products: ProductModel[],
    sortValue: SortingOptionModel
  ) {
    return products.sort((a: Record<string, any>, b: Record<string, any>) => {
      return sortValue.order === 'asc'
        ? a[sortValue.sortBy] - b[sortValue.sortBy]
        : b[sortValue.sortBy] - a[sortValue.sortBy];
    });
  }
  private _checkCurrentPage(maxPage: number): void {
    const curPage: number = this._pageNumberSubject.getValue();
    if (curPage > maxPage) {
      this._pageNumberSubject.next(1);
    }
  }
}

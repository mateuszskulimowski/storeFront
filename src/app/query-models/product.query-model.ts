export interface ProductQueryModel {
  readonly name: string;
  readonly category: string;
  readonly price: number;
  readonly rating: number[];
  readonly ratingValue: number;
  readonly imageUrl: string;
  readonly ratingCount: number;
  readonly categoryId: string;
  readonly storeIds: string[];
}
